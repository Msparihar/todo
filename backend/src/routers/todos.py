from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
import uuid

from .. import schemas, auth
from ..database import get_db
from ..models import Todo, Project, Tag, todo_tag, TodoStatus

router = APIRouter(prefix="/todos", tags=["todos"])


@router.get("", response_model=list[schemas.TodoWithProject])
async def get_todos(
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
    project_id: Optional[str] = None,
    status: Optional[TodoStatus] = None,
    is_completed: Optional[bool] = None,
    due_date_before: Optional[datetime] = None,
    due_date_after: Optional[datetime] = None,
    priority: Optional[int] = None,
    tag_id: Optional[str] = None,
):
    query = db.query(Todo).filter(Todo.user_id == current_user.id)

    # Apply filters
    if project_id:
        query = query.filter(Todo.project_id == project_id)

    if status:
        query = query.filter(Todo.status == status)

    if is_completed is not None:
        query = query.filter(Todo.is_completed == is_completed)

    if due_date_before:
        query = query.filter(Todo.due_date <= due_date_before)

    if due_date_after:
        query = query.filter(Todo.due_date >= due_date_after)

    if priority:
        query = query.filter(Todo.priority == priority)

    if tag_id:
        query = query.join(todo_tag).filter(todo_tag.c.tag_id == tag_id)

    return query.all()


@router.post("", response_model=schemas.TodoWithProject, status_code=status.HTTP_201_CREATED)
async def create_todo(
    todo: schemas.TodoCreate,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    # Verify project exists and belongs to user
    db_project = db.query(Project).filter(Project.id == todo.project_id, Project.user_id == current_user.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Create the todo
    todo_data = todo.model_dump(exclude={"tag_ids"})
    db_todo = Todo(**todo_data, user_id=current_user.id)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)

    # Add tags if provided
    if todo.tag_ids:
        add_tags_to_todo(db, db_todo.id, todo.tag_ids, current_user.id)
        db.refresh(db_todo)

    return db_todo


@router.get("/{todo_id}", response_model=schemas.TodoWithProject)
async def get_todo(
    todo_id: str,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    db_todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return db_todo


@router.put("/{todo_id}", response_model=schemas.TodoWithProject)
async def update_todo(
    todo_id: str,
    todo_update: schemas.TodoUpdate,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    db_todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    # Update fields
    update_data = todo_update.model_dump(exclude={"tag_ids"}, exclude_unset=True)

    # Check if is_completed is changing from False to True
    if "is_completed" in update_data and update_data["is_completed"] and not db_todo.is_completed:
        update_data["completed_at"] = datetime.utcnow()
        update_data["status"] = TodoStatus.DONE

    # Check if is_completed is changing from True to False
    if "is_completed" in update_data and not update_data["is_completed"] and db_todo.is_completed:
        update_data["completed_at"] = None
        if "status" not in update_data:
            update_data["status"] = TodoStatus.TODO

    for key, value in update_data.items():
        setattr(db_todo, key, value)

    # Update tags if provided
    if todo_update.tag_ids is not None:
        # Remove existing tags
        db.execute(todo_tag.delete().where(todo_tag.c.todo_id == db_todo.id))
        # Add new tags
        add_tags_to_todo(db, db_todo.id, todo_update.tag_ids, current_user.id)

    db.commit()
    db.refresh(db_todo)
    return db_todo


@router.delete("/{todo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_todo(
    todo_id: str,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    db_todo = db.query(Todo).filter(Todo.id == todo_id, Todo.user_id == current_user.id).first()
    if not db_todo:
        raise HTTPException(status_code=404, detail="Todo not found")

    db.delete(db_todo)
    db.commit()


# Helper function to add tags to todo
def add_tags_to_todo(db: Session, todo_id: str, tag_ids: List[str], user_id: str):
    """Add tags to a todo, validating they belong to the user."""
    for tag_id in tag_ids:
        # Check if tag exists and belongs to user
        tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == user_id).first()
        if not tag:
            continue  # Skip invalid tags

        # Create association
        db.execute(todo_tag.insert().values(todo_id=todo_id, tag_id=tag_id))

    db.commit()
