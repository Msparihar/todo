from datetime import datetime
from typing import Optional, List, Union
from uuid import UUID
from pydantic import BaseModel, EmailStr, Field
from enum import Enum

from .models.todo import TodoStatus, TodoPriority


# Tag schemas
class TagBase(BaseModel):
    name: str
    color: str = "#4F46E5"


class TagCreate(TagBase):
    pass


class TagUpdate(TagBase):
    name: Optional[str] = None
    color: Optional[str] = None


class Tag(TagBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr


class UserCreate(UserBase):
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class User(UserBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# Project schemas
class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    color: str = "#4F46E5"
    is_archived: bool = False


class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    name: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_archived: Optional[bool] = None


class Project(ProjectBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Todo schemas
class TodoBase(BaseModel):
    title: str
    description: Optional[str] = None
    is_completed: bool = False
    status: TodoStatus = TodoStatus.TODO
    priority: int = TodoPriority.MEDIUM
    due_date: Optional[datetime] = None


class TodoCreate(TodoBase):
    project_id: str
    tag_ids: Optional[List[str]] = []


class TodoUpdate(TodoBase):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    status: Optional[TodoStatus] = None
    priority: Optional[int] = None
    due_date: Optional[datetime] = None
    project_id: Optional[str] = None
    tag_ids: Optional[List[str]] = None


class Todo(TodoBase):
    id: str
    project_id: str
    user_id: str
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Response models with relationships
class TodoWithProject(Todo):
    project: Project
    tags: List[Tag] = []

    class Config:
        from_attributes = True


class ProjectWithTodos(Project):
    todos: List[Todo] = []

    class Config:
        from_attributes = True


class UserWithProjectsAndTodos(User):
    projects: List[Project] = []
    todos: List[Todo] = []
    tags: List[Tag] = []

    class Config:
        from_attributes = True
