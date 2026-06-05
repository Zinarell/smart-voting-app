# Smart Voting App

## Установка модулей для фронтенда
1. Переходим в папку SmartVotingApp: `cd SmartVotingApp`
2. Устанавливаем зависимости: `npm install`
3. Готово

## Установка библиотек для бэкенда
1. Переходим в папку smart-voting-backend: `cd smart-voting-backend`
2. Создаём виртуальное окружение: `python -m venv .venv`
3. Активируем виртуальное окружение:
   - **Windows:** `.\.venv\Scripts\activate`
   - **Mac/Linux:** `source .venv/bin/activate`
4. Устанавливаем зависимости: `pip install -r requirements.txt`
5. Готово

## Запуск приложения

⚠️ **Важно:** Бэкенд и фронтенд должны работать **одновременно** в разных окнах терминала!

### 1. Настройка публичного доступа через ngrok
1. Скачиваем ngrok с официального сайта: `https://ngrok.com/download`
2. Регистрируемся на `https://ngrok.com` и копируем Authtoken
3. Настраиваем ngrok: `ngrok config add-authtoken "<YOUR_AUTHTOKEN>"`
4. Запускаем ngrok: `ngrok http 8000`
5. Копируем публичный URL (пример: `https://your-ngrok-url.ngrok-free.dev`)

### 2. Настройка конфигурации
6. Создаём файл `config.js` по примеру `config_example.js` и вставляем свой URL из ngrok

### 3. Запуск серверов
7. **В первом терминале** запускаем бэкенд (из папки smart-voting-backend):
   ```bash
   uvicorn main:app --reload
   ```
   Флаг --reload включает автоматическую перезагрузку при изменении кода.
8. Во втором терминале запускаем фронтенд (из папки SmartVotingApp):
   ```bash
   npx expo start
   ```
### 4. Тестирование
9. Сканируем QR-код в приложении Expo Go на телефоне
10. Тестируем приложение!

Требования:
- Node.js и npm
- Python 3.9+ (проверено с Python 3.11)
- Expo Go на телефоне (версия SDK должна совпадать с версией в проекте)

❗ Текущая версия проекта: SDK 54. Убедитесь, что в Expo Go установлена совместимая версия.