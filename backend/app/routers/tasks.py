from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.entities import Event, Task
from app.schemas.schemas import TaskCreate, TaskResponse, TaskUpdate

router = APIRouter(prefix="/api/tasks", tags=["Tasks"])

@router.get("/{event_id}", response_model=List[TaskResponse])
def get_event_tasks(event_id: int, db: Session = Depends(get_db)):
    return db.query(Task).filter(Task.event_id == event_id).order_by(Task.created_at.asc()).all()

@router.post("/{event_id}", response_model=TaskResponse)
def create_task(event_id: int, data: TaskCreate, db: Session = Depends(get_db)):
    ev = db.query(Event).filter(Event.id == event_id).first()
    if not ev:
        raise HTTPException(status_code=404, detail="Event not found")
    
    task = Task(
        event_id=event_id,
        title=data.title,
        due_date=data.due_date,
        status=data.status or "PENDING"
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.patch("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    task.status = "COMPLETED" if task.status == "PENDING" else "PENDING"
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted successfully", "id": task_id}
