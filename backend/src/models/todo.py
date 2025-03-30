from datetime import datetime
import uuid
import enum
from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Integer, Enum
from sqlalchemy.orm import relationship

from ..database import Base
from .tag import todo_tag


class TodoStatus(str, enum.Enum):
    TODO = "todo"
    IN_PROGRESS = "in_progress"
    REVIEW = "review"
    DONE = "done"


class TodoPriority(int, enum.Enum):
    LOW = 1
    MEDIUM = 2
    HIGH = 3
    URGENT = 4


class Todo(Base):
    __tablename__ = "todos"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    project_id = Column(String, ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title = Column(String, nullable=False)
    description = Column(String)
    status = Column(Enum(TodoStatus), default=TodoStatus.TODO)
    priority = Column(Integer, default=TodoPriority.MEDIUM)
    is_completed = Column(Boolean, default=False)
    due_date = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    project = relationship("Project", back_populates="todos")
    user = relationship("User", back_populates="todos")
    tags = relationship("Tag", secondary=todo_tag, back_populates="todos")
