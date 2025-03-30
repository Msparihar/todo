from datetime import datetime
import uuid
from sqlalchemy import Column, String, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from ..database import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), index=True)
    name = Column(String, nullable=False)
    description = Column(String)
    is_archived = Column(Boolean, default=False)
    color = Column(String, default="#4F46E5")  # Default indigo color
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="projects")
    todos = relationship("Todo", back_populates="project", cascade="all, delete-orphan")
