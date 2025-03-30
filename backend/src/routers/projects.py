from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from .. import schemas, auth
from ..database import get_db
from ..models import Project

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=list[schemas.Project])
async def get_projects(
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
    include_archived: bool = False,
):
    query = db.query(Project).filter(Project.user_id == current_user.id)

    if not include_archived:
        query = query.filter(Project.is_archived == False)

    return query.all()


@router.post("", response_model=schemas.Project, status_code=status.HTTP_201_CREATED)
async def create_project(
    project: schemas.ProjectCreate,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    db_project = Project(**project.model_dump(), user_id=current_user.id)
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    return db_project


@router.get("/{project_id}", response_model=schemas.ProjectWithTodos)
async def get_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    db_project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")
    return db_project


@router.put("/{project_id}", response_model=schemas.Project)
async def update_project(
    project_id: str,
    project_update: schemas.ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    db_project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    update_data = project_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_project, key, value)

    db.commit()
    db.refresh(db_project)
    return db_project


@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_project(
    project_id: str,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    db_project = db.query(Project).filter(Project.id == project_id, Project.user_id == current_user.id).first()
    if not db_project:
        raise HTTPException(status_code=404, detail="Project not found")

    db.delete(db_project)
    db.commit()
