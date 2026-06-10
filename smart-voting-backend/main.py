from fastapi import FastAPI, HTTPException 
from pydantic import BaseModel 
from typing import Dict, List, Set, Optional
import uuid
from fastapi.middleware.cors import CORSMiddleware
import dotenv
import os
 
app = FastAPI()

dotenv.load_dotenv()
API_BASE_URL = os.getenv('API_BASE_URL')

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

class PollCreate(BaseModel):
    title: str
    options: List[str]  # Фронтенд пришлёт просто список текстов
 
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

@app.post("/polls", response_model=Poll)
def create_poll(poll_data: PollCreate):
    # 1. Генерируем ID для самого опроса
    new_poll_id = uuid.uuid4().hex
    
    # 2. Преобразуем список строк в список объектов PollOption с уникальными ID
    created_options = []
    for option_text in poll_data.options:
        option_id = uuid.uuid4().hex
        created_options.append(PollOption(id=option_id, text=option_text))
    
    # 3. Создаём полноценный объект Poll (используем твою существующую модель)
    new_poll = Poll(
        id=new_poll_id,
        title=poll_data.title,
        options=created_options,
        is_global=True,          # Значения по умолчанию из твоей модели
        allowed_group_ids=[],
        is_active=True
    )
    
    # 4. Сохраняем в "базу данных"
    polls_db[new_poll_id] = new_poll.model_dump()
    
    # 5. Возвращаем созданный опрос
    return new_poll

@app.get("/polls", response_model=List[Poll])
def get_polls():
    # list(polls_db.values()) превращает значения словаря в обычный список.
    # FastAPI сам проверит каждый элемент на соответствие модели Poll и вернет JSON.
    return list(polls_db.values())

# @app.get("/polls/{poll_id}")
# def get_poll(poll_id: str):
#     # poll_id автоматически извлечён из URL
#     if poll_id not in polls_db:
#         raise HTTPException(status_code=404, detail="Опрос не найден")
    
#     return polls_db[poll_id]

@app.get("/polls/{poll_id}/share-link")
def get_share_link(poll_id: str):
    # Проверяем, что опрос существует
    if poll_id not in polls_db:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    
    # Формируем ссылку (используем твой ngrok URL или IP)
    share_url = f"{API_BASE_URL}/votingapp?pollId={poll_id}"
    
    return {
        "poll_id": poll_id,
        "share_link": share_url
    }


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем запросы отовсюду (для разработки это ок)
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы (GET, POST и т. dist)
    allow_headers=["*"],
)