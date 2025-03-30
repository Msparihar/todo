from datetime import datetime
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Table
from sqlalchemy.orm import relationship

from ..database import Base


# Association table for many-to-many relationship between todos and tags
todo_tag = Table(
    "todo_tag",
    Base.metadata,
    Column("todo_id", String, ForeignKey("todos.id", ondelete="CASCADE"), primary_key=True),
    Column("tag_id", String, ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True),
)


class Tag(Base):
    __tablename__ = "tags"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name = Column(String, nullable=False)
    color = Column(String, default="#4F46E5")  # Default indigo color
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", backref="tags")
    todos = relationship("Todo", secondary=todo_tag, back_populates="tags")
