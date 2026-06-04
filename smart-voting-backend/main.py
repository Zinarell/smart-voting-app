from fastapi import FastAPI, HTTPException 
from pydantic import BaseModel 
from typing import Dict, List, Set, Optional 
import uuid 
 
app = FastAPI() 
 
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