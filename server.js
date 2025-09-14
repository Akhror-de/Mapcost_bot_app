const express = require('express');
const cors = require('cors');
const path = require('path');

/**
 * Express сервер для Telegram Mini App
 * 
 * Включает:
 * - Статические файлы для Mini App
 * - API для работы с предложениями
 * - CORS для работы с Telegram
 * - Middleware для логирования
 */

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Логирование запросов
app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${req.method} ${req.url} - ${req.ip}`);
    next();
});

// API Routes

/**
 * Главная страница - возвращает Mini App
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * API для получения предложений
 */
app.get('/api/offers', (req, res) => {
    const { lat, lon, radius = 5 } = req.query;
    
    // Валидация параметров
    if (!lat || !lon) {
        return res.status(400).json({
            success: false,
            error: 'Необходимы параметры lat и lon'
        });
    }
    
    // Моковые данные предложений
    const mockOffers = [
        {
            id: 1,
            title: "Ресторан 'Вкус Востока'",
            category: "рестораны",
            description: "Аутентичная восточная кухня с доставкой",
            address: "ул. Пушкина, 15",
            phone: "+7 (495) 123-45-67",
            lat: parseFloat(lat) + (Math.random() - 0.5) * 0.01,
            lon: parseFloat(lon) + (Math.random() - 0.5) * 0.01,
            distance: (Math.random() * 3).toFixed(1),
            image: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=300&h=150&fit=crop",
            telegram_url: "https://t.me/vkus_vostoka"
        },
        {
            id: 2,
            title: "Салон красоты 'Элегант'",
            category: "салоны красоты",
            description: "Полный спектр услуг красоты и ухода",
            address: "пр. Мира, 42",
            phone: "+7 (495) 234-56-78",
            lat: parseFloat(lat) + (Math.random() - 0.5) * 0.01,
            lon: parseFloat(lon) + (Math.random() - 0.5) * 0.01,
            distance: (Math.random() * 3).toFixed(1),
            image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=300&h=150&fit=crop",
            telegram_url: "https://t.me/elegant_salon"
        },
        {
            id: 3,
            title: "Автосервис 'Быстрый ремонт'",
            category: "автосервисы",
            description: "Диагностика и ремонт автомобилей любой сложности",
            address: "ул. Автомобильная, 8",
            phone: "+7 (495) 345-67-89",
            lat: parseFloat(lat) + (Math.random() - 0.5) * 0.01,
            lon: parseFloat(lon) + (Math.random() - 0.5) * 0.01,
            distance: (Math.random() * 3).toFixed(1),
            image: "https://images.unsplash.com/photo-1486754735734-325b5831c3ad?w=300&h=150&fit=crop",
            telegram_url: "https://t.me/quick_repair"
        },
        {
            id: 4,
            title: "Цветочный магазин 'Роза'",
            category: "цветочные магазины",
            description: "Свежие цветы и букеты на любой случай",
            address: "ул. Цветочная, 25",
            phone: "+7 (495) 456-78-90",
            lat: parseFloat(lat) + (Math.random() - 0.5) * 0.01,
            lon: parseFloat(lon) + (Math.random() - 0.5) * 0.01,
            distance: (Math.random() * 3).toFixed(1),
            image: "https://images.unsplash.com/photo-1563241527-3004b7be99c3?w=300&h=150&fit=crop",
            telegram_url: "https://t.me/roza_flowers"
        },
        {
            id: 5,
            title: "Медцентр 'Здоровье+'",
            category: "медцентры",
            description: "Комплексное медицинское обслуживание",
            address: "ул. Медицинская, 12",
            phone: "+7 (495) 567-89-01",
            lat: parseFloat(lat) + (Math.random() - 0.5) * 0.01,
            lon: parseFloat(lon) + (Math.random() - 0.5) * 0.01,
            distance: (Math.random() * 3).toFixed(1),
            image: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=300&h=150&fit=crop",
            telegram_url: "https://t.me/health_plus"
        }
    ];
    
    // Фильтруем предложения по радиусу
    const filteredOffers = mockOffers.filter(offer => {
        const distance = parseFloat(offer.distance);
        return distance <= parseFloat(radius);
    });
    
    res.json({
        success: true,
        data: {
            offers: filteredOffers,
            total: filteredOffers.length,
            location: { lat: parseFloat(lat), lon: parseFloat(lon) },
            radius: parseFloat(radius)
        },
        timestamp: new Date().toISOString()
    });
});

/**
 * API для информации о сервере
 */
app.get('/api/info', (req, res) => {
    res.json({
        success: true,
        data: {
            name: 'Telegram Mini App Server',
            port: PORT,
            env: process.env.NODE_ENV || 'development',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }
    });
});

/**
 * API для статуса приложения
 */
app.get('/api/status', (req, res) => {
    res.json({
        success: true,
        data: {
            status: 'online',
            version: '1.0.0',
            uptime: process.uptime(),
            timestamp: new Date().toISOString()
        }
    });
});

/**
 * Обработка несуществующих маршрутов
 */
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Страница не найдена',
        path: req.originalUrl
    });
});

/**
 * Обработка ошибок
 */
app.use((error, req, res, next) => {
    console.error('Ошибка сервера:', error);
    res.status(500).json({
        success: false,
        error: 'Внутренняя ошибка сервера',
        message: error.message
    });
});

/**
 * Запуск сервера
 */
app.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на порту ${PORT}`);
    console.log(`📱 Mini App: http://localhost:${PORT}`);
    console.log(`🔧 API: http://localhost:${PORT}/api/offers`);
    console.log(`📊 Статус: http://localhost:${PORT}/api/status`);
});

module.exports = app;