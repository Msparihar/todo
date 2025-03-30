from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid

from .. import schemas, auth
from ..database import get_db
from ..models import Tag, todo_tag

router = APIRouter(prefix="/tags", tags=["tags"])


@router.get("", response_model=list[schemas.Tag])
async def get_tags(
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    return db.query(Tag).filter(Tag.user_id == current_user.id).all()


@router.post("", response_model=schemas.Tag, status_code=status.HTTP_201_CREATED)
async def create_tag(
    tag: schemas.TagCreate,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    # Check if a tag with the same name already exists for this user
    existing_tag = db.query(Tag).filter(Tag.user_id == current_user.id, Tag.name == tag.name).first()

    if existing_tag:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tag with this name already exists")

    db_tag = Tag(**tag.model_dump(), user_id=current_user.id)
    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)
    return db_tag


@router.get("/{tag_id}", response_model=schemas.Tag)
async def get_tag(
    tag_id: str,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    db_tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == current_user.id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")
    return db_tag


@router.put("/{tag_id}", response_model=schemas.Tag)
async def update_tag(
    tag_id: str,
    tag_update: schemas.TagUpdate,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    db_tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == current_user.id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Check for name conflicts if name is being updated
    if tag_update.name and tag_update.name != db_tag.name:
        existing_tag = (
            db.query(Tag).filter(Tag.user_id == current_user.id, Tag.name == tag_update.name, Tag.id != tag_id).first()
        )

        if existing_tag:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Tag with this name already exists")

    update_data = tag_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_tag, key, value)

    db.commit()
    db.refresh(db_tag)
    return db_tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: str,
    db: Session = Depends(get_db),
    current_user: auth.User = Depends(auth.get_current_user),
):
    db_tag = db.query(Tag).filter(Tag.id == tag_id, Tag.user_id == current_user.id).first()
    if not db_tag:
        raise HTTPException(status_code=404, detail="Tag not found")

    # Remove all associations first
    db.execute(todo_tag.delete().where(todo_tag.c.tag_id == tag_id))

    # Delete the tag
    db.delete(db_tag)
    db.commit()
