from fastapi import FastAPI, HTTPException 
from pydantic import BaseModel 
from typing import Dict, List, Set, Optional
import uuid
from fastapi.middleware.cors import CORSMiddleware
import dotenv
import os
import time

from fastapi.responses import HTMLResponse
 
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

class VoteCreate(BaseModel):
    user_id: str
    poll_id: str
    option_id: str

 
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
    
    # 3. Создаём полноценный объект Poll 
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

@app.get("/polls/{poll_id}", response_model=Poll)
def get_poll(poll_id: str):
    # poll_id автоматически извлечён из URL
    if poll_id not in polls_db:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    
    return polls_db[poll_id]


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


@app.post("/vote")
def cast_vote(vote_data: VoteCreate):
    # 1. Проверяем, что опрос существует
    if vote_data.poll_id not in polls_db:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    
    poll = polls_db[vote_data.poll_id]
    
    # 2. Проверяем, что вариант ответа существует в этом опросе
    option_ids = [opt['id'] for opt in poll['options']]
    if vote_data.option_id not in option_ids:
        raise HTTPException(status_code=400, detail="Такого варианта ответа не существует")
    
    # 3. Проверяем, не голосовал ли уже этот пользователь
    if vote_data.user_id in user_votes_per_poll and vote_data.poll_id in user_votes_per_poll[vote_data.user_id]:
        raise HTTPException(status_code=400, detail="Вы уже голосовали в этом опросе")
    
    # 4. Создаём объект голоса
    new_vote = Vote(
        user_id=vote_data.user_id,
        poll_id=vote_data.poll_id,
        option_id=vote_data.option_id,
        timestamp=time.time()
    )
    
    # 5. Сохраняем голос
    votes_db.append(new_vote)
    
    # 6. Запоминаем, что пользователь проголосовал в этом опросе
    if vote_data.user_id not in user_votes_per_poll:
        user_votes_per_poll[vote_data.user_id] = set()
    user_votes_per_poll[vote_data.user_id].add(vote_data.poll_id)
    
    return {
        "message": "Голос успешно учтён!",
        "poll_id": vote_data.poll_id,
        "option_id": vote_data.option_id
    }

@app.get("/vote-status/{poll_id}/{user_id}")
def get_vote_status(poll_id: str, user_id: str):
    # Проверяем, голосовал ли пользователь в этом опросе
    has_voted = user_id in user_votes_per_poll and poll_id in user_votes_per_poll[user_id]
    
    if has_voted:
        # Находим, за какой вариант он голосовал
        user_vote = next(
            (vote for vote in votes_db if vote.user_id == user_id and vote.poll_id == poll_id),
            None
        )
        return {
            "has_voted": True,
            "option_id": user_vote.option_id if user_vote else None
        }
    else:
        return {
            "has_voted": False,
            "option_id": None
        }
    
@app.get("/polls/{poll_id}/results")
def get_poll_results(poll_id: str):
    # 1. Проверяем, что опрос существует
    if poll_id not in polls_db:
        raise HTTPException(status_code=404, detail="Опрос не найден")
    
    poll = polls_db[poll_id]
    
    # 2. Считаем голоса для каждого варианта
    vote_counts = {}
    for vote in votes_db:
        if vote.poll_id == poll_id:
            if vote.option_id not in vote_counts:
                vote_counts[vote.option_id] = 0
            vote_counts[vote.option_id] += 1
    
    # 3. Формируем ответ с текстами вариантов
    results = {}
    for option in poll['options']:
        option_id = option['id']
        option_text = option['text']
        count = vote_counts.get(option_id, 0)
        results[option_text] = count
    
    return results

@app.get("/votingapp", response_class=HTMLResponse)
def voting_page(pollId: str):
    # Проверяем, что опрос существует
    if pollId not in polls_db:
        return HTMLResponse(
            content="<html><body><h1>Опрос не найден</h1></body></html>",
            status_code=404
        )
    
    poll = polls_db[pollId]
    
    # Создаём HTML с кнопками для голосования
    options_html = ""
    for option in poll['options']:
        options_html += f"""
        <button onclick="vote('{option['id']}')" style="display: block; margin: 10px 0; padding: 15px; font-size: 16px; cursor: pointer;">
            {option['text']}
        </button>
        """
    
    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>{poll['title']}</title>
        <style>
            body {{
                font-family: Arial, sans-serif;
                max-width: 600px;
                margin: 50px auto;
                padding: 20px;
                background-color: #f5f5f5;
            }}
            h1 {{
                color: #333;
                text-align: center;
            }}
            button {{
                width: 100%;
                background-color: #2196F3;
                color: white;
                border: none;
                border-radius: 8px;
                transition: background-color 0.3s;
            }}
            button:hover {{
                background-color: #1976D2;
            }}
            #message {{
                margin-top: 20px;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                display: none;
            }}
            .success {{
                background-color: #4CAF50;
                color: white;
            }}
            .error {{
                background-color: #f44336;
                color: white;
            }}
        </style>
    </head>
    <body>
        <h1>{poll['title']}</h1>
        <p style="text-align: center; color: #666;">Выберите вариант:</p>
        {options_html}
        <div id="message"></div>
        
        <script>
            const pollId = '{pollId}';
            
            async function vote(optionId) {{
                // Получаем userId из localStorage (или генерируем новый)
                let userId = localStorage.getItem('userId');
                if (!userId) {{
                    userId = 'guest_' + Math.random().toString(36).substr(2, 9);
                    localStorage.setItem('userId', userId);
                }}
                
                try {{
                    const response = await fetch('/vote', {{
                        method: 'POST',
                        headers: {{
                            'Content-Type': 'application/json',
                        }},
                        body: JSON.stringify({{
                            user_id: userId,
                            poll_id: pollId,
                            option_id: optionId
                        }})
                    }});
                    
                    const data = await response.json();
                    const messageDiv = document.getElementById('message');
                    
                    if (response.ok) {{
                        messageDiv.className = 'success';
                        messageDiv.textContent = 'Ваш голос учтён!';
                        messageDiv.style.display = 'block';
                        
                        // Блокируем все кнопки
                        document.querySelectorAll('button').forEach(btn => {{
                            btn.disabled = true;
                            btn.style.opacity = '0.5';
                            btn.style.cursor = 'not-allowed';
                        }});
                    }} else {{
                        messageDiv.className = 'error';
                        messageDiv.textContent = data.detail || 'Ошибка голосования';
                        messageDiv.style.display = 'block';
                    }}
                }} catch (error) {{
                    const messageDiv = document.getElementById('message');
                    messageDiv.className = 'error';
                    messageDiv.textContent = 'Ошибка соединения с сервером';
                    messageDiv.style.display = 'block';
                }}
            }}
        </script>
    </body>
    </html>
    """
    
    return HTMLResponse(content=html_content)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Разрешаем запросы отовсюду (для разработки это ок)
    allow_credentials=True,
    allow_methods=["*"],  # Разрешаем все методы (GET, POST и т. dist)
    allow_headers=["*"],
)