# 🗺️ MapCost Bot - Telegram Mini App

Telegram Mini App с геолокацией и картой для поиска предложений поблизости.

## 🚀 Возможности

- 📍 Определение местоположения пользователя
- 🗺️ Интерактивная карта с маркерами
- 🏪 Поиск предложений поблизости
- 📱 Адаптивный дизайн для мобильных устройств
- 🎨 Поддержка тем Telegram
- 💬 Интеграция с Telegram WebApp API

## 🛠️ Технологии

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Backend**: Node.js, Express.js
- **Карты**: Leaflet (OpenStreetMap)
- **Хостинг**: Vercel (Serverless Functions)
- **API**: RESTful API

## 📦 Установка и запуск

### Локальная разработка

1. **Клонируйте репозиторий:**
   ```bash
   git clone <repository-url>
   cd mapcost-bot
   ```

2. **Установите зависимости:**
   ```bash
   npm install
   ```

3. **Запустите локальный сервер:**
   ```bash
   npm run dev
   ```

4. **Откройте в браузере:**
   ```
   http://localhost:3000
   ```

## 🌐 Деплой на Vercel

### Автоматический деплой через GitHub

1. **Создайте GitHub репозиторий:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/mapcost-bot.git
   git push -u origin main
   ```

2. **Подключите к Vercel:**
   - Перейдите на [vercel.com](https://vercel.com)
   - Войдите через GitHub
   - Нажмите "New Project"
   - Выберите ваш репозиторий
   - Нажмите "Deploy"

3. **Получите постоянный URL:**
   ```
   https://your-project-name.vercel.app
   ```

### Ручной деплой через Vercel CLI

1. **Установите Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Войдите в аккаунт:**
   ```bash
   vercel login
   ```

3. **Деплой:**
   ```bash
   vercel --prod
   ```

## 📱 Настройка Telegram Bot

1. **Создайте бота через @BotFather:**
   ```
   /newbot
   /setmenubutton
   ```

2. **Настройте Web App:**
   ```
   /setmenubutton
   @your_bot_name
   MapCost Bot
   https://your-project-name.vercel.app
   ```

3. **Добавьте команды:**
   ```
   /setcommands
   @your_bot_name
   start - Запустить MapCost Bot
   help - Помощь
   ```

## 🔧 API Endpoints

### GET /api/offers
Получение предложений поблизости

**Параметры:**
- `lat` (number) - Широта
- `lon` (number) - Долгота  
- `radius` (number, optional) - Радиус поиска в км (по умолчанию 5)

**Пример:**
```
GET /api/offers?lat=55.7558&lon=37.6176&radius=3
```

**Ответ:**
```json
{
  "success": true,
  "data": {
    "offers": [
      {
        "id": 1,
        "title": "Ресторан 'Вкус Востока'",
        "category": "рестораны",
        "description": "Аутентичная восточная кухня",
        "address": "ул. Пушкина, 15",
        "phone": "+7 (495) 123-45-67",
        "lat": 55.7558,
        "lon": 37.6176,
        "distance": "0.5",
        "image": "https://example.com/image.jpg",
        "telegram_url": "https://t.me/restaurant"
      }
    ],
    "total": 1,
    "location": { "lat": 55.7558, "lon": 37.6176 },
    "radius": 3
  },
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### GET /api/info
Информация о сервере

**Ответ:**
```json
{
  "success": true,
  "data": {
    "name": "Telegram Mini App Server",
    "port": 3000,
    "env": "production",
    "uptime": 3600,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

### GET /api/status
Статус приложения

**Ответ:**
```json
{
  "success": true,
  "data": {
    "status": "online",
    "version": "1.0.0",
    "uptime": 3600,
    "timestamp": "2024-01-01T12:00:00.000Z"
  }
}
```

## 📁 Структура проекта

```
mapcost-bot/
├── api/                    # Vercel Serverless Functions
│   ├── info.js            # Информация о сервере
│   ├── offers.js          # API предложений
│   └── status.js          # Статус приложения
├── public/                # Статические файлы
│   └── index.html         # Главная страница
├── app.js                 # Frontend JavaScript
├── server.js              # Express сервер
├── vercel.json            # Конфигурация Vercel
├── package.json           # Зависимости и скрипты
└── README.md              # Документация
```

## 🎨 Кастомизация

### Добавление новых категорий предложений

Отредактируйте массив `mockOffers` в `server.js`:

```javascript
const mockOffers = [
  {
    id: 6,
    title: "Новая категория",
    category: "новая_категория",
    // ... остальные поля
  }
];
```

### Изменение стилей

Отредактируйте CSS в `public/index.html` или создайте отдельный файл стилей.

### Настройка карты

Измените настройки Leaflet в `public/index.html`:

```javascript
map = L.map('map').setView([lat, lng], 15); // Измените zoom level
```

## 🔒 Безопасность

- Все API endpoints защищены CORS
- Валидация входных параметров
- Обработка ошибок
- Логирование запросов

## 📄 Лицензия

MIT License

## 🤝 Поддержка

Если у вас есть вопросы или предложения, создайте issue в репозитории.

---

**Создано с ❤️ для Telegram Mini Apps**