// Глобальные переменные
let map = null;
let userLocation = null;
let offersData = [];
let markersCollection = null;

// Инициализация Telegram WebApp
const tg = window.Telegram.WebApp;

// Настройка Telegram WebApp
function initTelegramWebApp() {
    try {
        // Расширяем приложение на весь экран
        tg.expand();
        
        // Настраиваем цвета темы
        tg.setHeaderColor('#17212b');
        tg.setBackgroundColor('#17212b');
        
        // Показываем главную кнопку если нужно
        tg.MainButton.hide();
        
        console.log('Telegram WebApp инициализирован');
        console.log('Пользователь:', tg.initDataUnsafe?.user);
    } catch (error) {
        console.log('Приложение запущено вне Telegram:', error);
    }
}

// Функция получения геолокации
function getLocation() {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('Геолокация не поддерживается браузером'));
            return;
        }

        const options = {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 минут
        };

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const location = {
                    lat: position.coords.latitude,
                    lon: position.coords.longitude,
                    accuracy: position.coords.accuracy
                };
                console.log('Геолокация получена:', location);
                resolve(location);
            },
            (error) => {
                console.error('Ошибка получения геолокации:', error);
                let errorMessage = 'Не удалось получить геолокацию';
                
                switch(error.code) {
                    case error.PERMISSION_DENIED:
                        errorMessage = 'Доступ к геолокации запрещен';
                        break;
                    case error.POSITION_UNAVAILABLE:
                        errorMessage = 'Информация о местоположении недоступна';
                        break;
                    case error.TIMEOUT:
                        errorMessage = 'Превышено время ожидания геолокации';
                        break;
                }
                
                reject(new Error(errorMessage));
            },
            options
        );
    });
}

// Инициализация Яндекс.Карт
function initYandexMap(lat, lon) {
    return new Promise((resolve, reject) => {
        if (typeof ymaps === 'undefined') {
            reject(new Error('Яндекс.Карты не загружены'));
            return;
        }

        ymaps.ready(() => {
            try {
                // Создаем карту в темной теме
                map = new ymaps.Map('map', {
                    center: [lat, lon],
                    zoom: 14,
                    type: 'yandex#dark'
                }, {
                    searchControlProvider: 'yandex#search'
                });

                // Добавляем элементы управления
                map.controls.add('zoomControl', {
                    position: { right: 10, top: 50 }
                });
                
                map.controls.add('typeSelector', {
                    position: { top: 10, right: 10 }
                });

                // Создаем коллекцию для маркеров
                markersCollection = new ymaps.GeoObjectCollection();
                map.geoObjects.add(markersCollection);

                // Добавляем маркер пользователя
                const userPlacemark = new ymaps.Placemark([lat, lon], {
                    balloonContent: '📍 Ваше местоположение',
                    hintContent: 'Вы здесь'
                }, {
                    preset: 'islands#redCircleDotIcon',
                    iconColor: '#ff6b6b'
                });

                markersCollection.add(userPlacemark);
                
                console.log('Яндекс.Карты инициализированы');
                resolve(map);
            } catch (error) {
                console.error('Ошибка инициализации карты:', error);
                reject(error);
            }
        });
    });
}

// Функция запроса предложений с сервера
async function fetchOffers(lat, lon, radius = 5) {
    try {
        const response = await fetch(`/api/offers?lat=${lat}&lon=${lon}&radius=${radius}`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Получены предложения:', data);
        return data;
    } catch (error) {
        console.error('Ошибка запроса предложений:', error);
        throw error;
    }
}

// Функция добавления маркеров на карту
function addMarkersToMap(offers) {
    if (!map || !markersCollection) return;

    // Очищаем предыдущие маркеры предложений (оставляем только пользователя)
    markersCollection.removeAll();
    
    // Добавляем маркер пользователя обратно
    const userPlacemark = new ymaps.Placemark([userLocation.lat, userLocation.lon], {
        balloonContent: '📍 Ваше местоположение',
        hintContent: 'Вы здесь'
    }, {
        preset: 'islands#redCircleDotIcon',
        iconColor: '#ff6b6b'
    });
    markersCollection.add(userPlacemark);

    // Добавляем маркеры предложений
    offers.forEach((offer, index) => {
        const categoryIcons = {
            'рестораны': '🍽️',
            'салоны красоты': '💅',
            'автосервисы': '🔧',
            'цветочные магазины': '🌸',
            'медцентры': '🏥'
        };

        const icon = categoryIcons[offer.category] || '📍';
        
        const placemark = new ymaps.Placemark([offer.lat, offer.lon], {
            balloonContentHeader: `${icon} ${offer.title}`,
            balloonContentBody: `
                <div style="max-width: 250px;">
                    <p><strong>${offer.category}</strong></p>
                    <p>${offer.description}</p>
                    <p>📍 ${offer.address}</p>
                    <p>📞 ${offer.phone}</p>
                    <p>📏 ${offer.distance} км от вас</p>
                    ${offer.telegram_url ? `<p><a href="${offer.telegram_url}" target="_blank" style="color: #6ab7ff;">💬 Telegram</a></p>` : ''}
                </div>
            `,
            hintContent: `${offer.title} (${offer.distance} км)`
        }, {
            preset: 'islands#blueCircleDotIcon',
            iconColor: getCategoryColor(offer.category)
        });

        // Добавляем обработчик клика на маркер
        placemark.events.add('click', () => {
            showOfferModal(offer);
        });

        markersCollection.add(placemark);
    });

    // Устанавливаем границы карты чтобы показать все маркеры
    if (offers.length > 0) {
        map.setBounds(markersCollection.getBounds(), {
            checkZoomRange: true,
            zoomMargin: 50
        });
    }
}

// Функция получения цвета для категории
function getCategoryColor(category) {
    const colors = {
        'рестораны': '#ff6b6b',
        'салоны красоты': '#ff9ff3',
        'автосервисы': '#54a0ff',
        'цветочные магазины': '#5f27cd',
        'медцентры': '#00d2d3'
    };
    return colors[category] || '#6c5ce7';
}

// Функция отображения списка предложений
function displayOffers(offers) {
    const offersList = document.getElementById('offers-list');
    const offersSection = document.getElementById('offers-section');
    
    if (!offers || offers.length === 0) {
        offersSection.classList.add('hidden');
        return;
    }

    offersList.innerHTML = '';
    
    offers.forEach(offer => {
        const offerCard = createOfferCard(offer);
        offersList.appendChild(offerCard);
    });
    
    offersSection.classList.remove('hidden');
    
    // Плавная прокрутка к результатам
    setTimeout(() => {
        offersSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    }, 300);
}

// Функция создания карточки предложения
function createOfferCard(offer) {
    const card = document.createElement('div');
    card.className = 'offer-card';
    
    const categoryEmojis = {
        'рестораны': '🍽️',
        'салоны красоты': '💅',
        'автосервисы': '🔧',
        'цветочные магазины': '🌸',
        'медцентры': '🏥'
    };

    card.innerHTML = `
        <img src="${offer.image}" alt="${offer.title}" class="offer-image" 
             onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjE1MCIgdmlld0JveD0iMCAwIDMwMCAxNTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjMwMCIgaGVpZ2h0PSIxNTAiIGZpbGw9IiMyMzJlM2MiLz48dGV4dCB4PSIxNTAiIHk9Ijc1IiBmaWxsPSIjNzA4NDk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0iY2VudHJhbCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE0Ij7QpNC+0YLQvjwvdGV4dD48L3N2Zz4='" />
        <div class="offer-content">
            <h3 class="offer-title">${offer.title}</h3>
            <span class="offer-category">${categoryEmojis[offer.category] || '📍'} ${offer.category}</span>
            <p class="offer-description">${offer.description}</p>
            <div class="offer-details">
                <div class="offer-address">📍 ${offer.address}</div>
                <div class="offer-phone">📞 ${offer.phone}</div>
                <div class="offer-distance">📏 ${offer.distance} км от вас</div>
            </div>
            ${offer.telegram_url ? `<a href="${offer.telegram_url}" class="offer-telegram" target="_blank">💬 Открыть в Telegram</a>` : ''}
        </div>
    `;
    
    // Добавляем обработчик клика на карточку
    card.addEventListener('click', (e) => {
        if (e.target.tagName !== 'A') {
            showOfferModal(offer);
        }
    });
    
    return card;
}

// Функция показа модального окна с деталями предложения
function showOfferModal(offer) {
    const modal = document.getElementById('offer-modal');
    const modalBody = document.getElementById('modal-body');
    
    const categoryEmojis = {
        'рестораны': '🍽️',
        'салоны красоты': '💅',
        'автосервисы': '🔧',
        'цветочные магазины': '🌸',
        'медцентры': '🏥'
    };

    modalBody.innerHTML = `
        <div style="padding: 20px;">
            <img src="${offer.image}" alt="${offer.title}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px; margin-bottom: 15px;" 
                 onerror="this.style.display='none'" />
            <h2 style="color: var(--tg-theme-text-color); margin-bottom: 10px;">${offer.title}</h2>
            <span style="background-color: var(--tg-theme-button-color); color: white; padding: 5px 10px; border-radius: 6px; font-size: 0.8rem; text-transform: uppercase;">
                ${categoryEmojis[offer.category] || '📍'} ${offer.category}
            </span>
            <p style="color: var(--tg-theme-hint-color); margin: 15px 0; line-height: 1.5;">${offer.description}</p>
            
            <div style="margin: 20px 0;">
                <div style="margin: 8px 0; color: var(--tg-theme-subtitle-text-color);">
                    <strong>📍 Адрес:</strong> ${offer.address}
                </div>
                <div style="margin: 8px 0; color: var(--tg-theme-subtitle-text-color);">
                    <strong>📞 Телефон:</strong> ${offer.phone}
                </div>
                <div style="margin: 8px 0; color: var(--tg-theme-accent-text-color); font-weight: 600;">
                    <strong>📏 Расстояние:</strong> ${offer.distance} км от вас
                </div>
            </div>
            
            <div style="display: flex; gap: 10px; margin-top: 20px;">
                ${offer.telegram_url ? `<a href="${offer.telegram_url}" target="_blank" style="flex: 1; padding: 12px; background-color: var(--tg-theme-button-color); color: white; text-decoration: none; border-radius: 8px; text-align: center; font-weight: 600;">💬 Открыть в Telegram</a>` : ''}
                <button onclick="showOnMap(${offer.lat}, ${offer.lon})" style="flex: 1; padding: 12px; background-color: var(--tg-theme-secondary-bg-color); color: var(--tg-theme-text-color); border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">🗺️ Показать на карте</button>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

// Функция показа места на карте
function showOnMap(lat, lon) {
    if (map) {
        map.setCenter([lat, lon], 16);
        hideModal();
        
        // Прокручиваем к карте
        document.getElementById('map-container').scrollIntoView({ 
            behavior: 'smooth',
            block: 'center'
        });
    }
}

// Функция скрытия модального окна
function hideModal() {
    const modal = document.getElementById('offer-modal');
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Функция показа/скрытия индикатора загрузки
function showLoading(show = true) {
    const loading = document.getElementById('loading');
    const button = document.getElementById('find-offers');
    
    if (show) {
        loading.classList.remove('hidden');
        button.disabled = true;
        button.textContent = '⏳ Поиск...';
    } else {
        loading.classList.add('hidden');
        button.disabled = false;
        button.textContent = '📍 Найти предложения рядом';
    }
}

// Функция показа уведомления
function showNotification(message, type = 'info') {
    // Используем Telegram уведомления если доступны
    if (tg.showAlert) {
        tg.showAlert(message);
    } else {
        alert(message);
    }
}

// Основная функция поиска предложений
async function findNearbyOffers() {
    try {
        showLoading(true);
        
        // Получаем геолокацию
        console.log('Запрос геолокации...');
        userLocation = await getLocation();
        
        // Инициализируем карту
        console.log('Инициализация карты...');
        await initYandexMap(userLocation.lat, userLocation.lon);
        
        // Запрашиваем предложения
        console.log('Запрос предложений...');
        const response = await fetchOffers(userLocation.lat, userLocation.lon, 5);
        offersData = response.offers || [];
        
        // Отображаем результаты
        addMarkersToMap(offersData);
        displayOffers(offersData);
        
        if (offersData.length === 0) {
            showNotification('В радиусе 5 км от вас не найдено предложений. Попробуйте изменить местоположение.');
        } else {
            showNotification(`Найдено ${offersData.length} предложений поблизости!`);
        }
        
    } catch (error) {
        console.error('Ошибка при поиске предложений:', error);
        showNotification(`Ошибка: ${error.message}`);
    } finally {
        showLoading(false);
    }
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    console.log('Инициализация приложения...');
    
    // Инициализируем Telegram WebApp
    initTelegramWebApp();
    
    // Обработчик кнопки поиска
    const findButton = document.getElementById('find-offers');
    findButton.addEventListener('click', findNearbyOffers);
    
    // Обработчик закрытия модального окна
    const closeModal = document.querySelector('.close');
    const modal = document.getElementById('offer-modal');
    
    closeModal.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            hideModal();
        }
    });
    
    // Обработчик клавиши Escape для закрытия модального окна
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideModal();
        }
    });
    
    console.log('Приложение готово к работе!');
});

// Экспорт функций для глобального доступа
window.showOnMap = showOnMap;
window.hideModal = hideModal;

