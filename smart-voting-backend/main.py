from fastapi import FastAPI, HTTPException 
from pydantic import BaseModel 
from typing import Dict, List, Set, Optional 
import uuid 
 
app = FastAPI()

# То, что мы ждём от фронтенда
class UserCreate(BaseModel):
    name: str

# То, что мы отправляем обратно фронтенду
class UserResponse(BaseModel):
    user_id: str
    message: str
 
# Модели данных (будут расширяться) 
class User(BaseModel): 
    id: str 
    name: str 
    group_ids: List[str] = [] # Для группового голосования 
 
class PollOption(BaseModel): 
    id: str 
    text: str 
 
class Poll(BaseModel): 
    id: str 
    title: str 
    options: List[PollOption] 
    is_global: bool = True 
    allowed_group_ids: List[str] = [] 
    is_active: bool = True 
 
class Vote(BaseModel): 
    user_id: str 
    poll_id: str 
    option_id: str 
    timestamp: float # Время голосования 
 
# "База данных" в памяти (для простоты)  
users_db: Dict[str, User] = {} 
polls_db: Dict[str, Poll] = {} 
votes_db: List[Vote] = [] # Список всех голосов 
user_votes_per_poll: Dict[str, Set[str]] = {} # user_id: {poll_id, ...}


@app.post("/register", response_model=UserResponse)
def register_user(user: UserCreate):
    # 1. Генерируем уникальный ID (hex убирает дефисы, делая строку короче)
    new_user_id = uuid.uuid4().hex
    
    # 2. Сохраняем пользователя в нашу "базу данных" (словарь)
    # Ключом будет ID, а значением - словарь с данными пользователя
    users_db[new_user_id] = {
        "name": user.name
    }
    
    # 3. Возвращаем ответ. FastAPI сам превратит этот словарь в JSON
    return {
        "user_id": new_user_id,
        "message": "Регистрация успешна!"
    }