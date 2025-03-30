import re
from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from sqlalchemy import or_

from . import security, schemas
from .database import get_db
from .models import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    payload = security.decode_token(token)
    if payload is None:
        raise credentials_exception

    user_id: str = payload.get("sub")
    if user_id is None:
        raise credentials_exception

    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception

    return user


async def authenticate_user(username_or_email: str, password: str, db: Session) -> Optional[User]:
    # Check if input is an email (contains @)
    is_email = bool(re.match(r"[^@]+@[^@]+\.[^@]+", username_or_email))

    # Query user by email or username based on input format
    if is_email:
        user = db.query(User).filter(User.email == username_or_email).first()
    else:
        user = db.query(User).filter(User.username == username_or_email).first()

    # If no user found or password is incorrect, return None
    if not user:
        return None
    if not security.verify_password(password, user.password):
        return None

    return user


def create_user(user: schemas.UserCreate, db: Session) -> User:
    hashed_password = security.get_password_hash(user.password)
    db_user = User(username=user.username, email=user.email, password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user
