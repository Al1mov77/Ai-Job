# AIJob Platform - Candidate & Recruitment Ecosystem

[🇷🇺 Читать на русском языке](#russian-version)

AIJob is a modern, high-performance web application designed for career growth and networking. It bridges the gap between candidates and organizations through a dynamic social-feed experience, rich user profiles, and an intelligent notification system.

## 🚀 Key Features

*   **Dynamic Social Feed**: A real-time dashboard for sharing insights, posting jobs, and engaging with the community through likes and comments.
*   **Intelligent Profile System**: Comprehensive user profiles at `/candidate/profile/[id]` featuring skills tags, experience timelines, and automatic fallback avatars using dynamic initials.
*   **Networking Engine**: A robust connection system allowing users to follow, connect, and manage professional relationships.
*   **Unified Notifications**: A dedicated tab for tracking likes, comments, and connection requests with inline "Accept/Decline" actions.
*   **Secure Authentication**: Fully integrated JWT-based auth flow with session persistence and role-based access control.

## 🛠 Technology Stack

### Frontend
- **Framework**: [Next.js 14+](https://nextjs.org/) (App Router architecture)
- **Language**: [TypeScript](https://www.typescriptlang.org/) for type safety across the board.
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) for lightweight global auth and UI state.
- **Data Fetching**: [TanStack Query v5](https://tanstack.com/query/latest) (React Query) for smart caching, optimistic UI, and background synchronization.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with a custom Dark-Aesthetic design system.
- **Notifications**: [Sonner](https://sonner.stevenly.com/) for high-performance toast animations.

### Integration
- **API Client**: [Axios](https://axios-http.com/) with custom instances for base URL and proxy handling.
- **JWT Handling**: Custom logic for decoding and extracting user metadata from secure tokens.

## 🏗 System Architecture

### 1. Smart Data Fetching (TanStack Query)
Instead of standard `useEffect` hooks, the project utilizes React Query.
- **Caching**: Data stays in memory, making page transitions feel instantaneous.
- **Parallel Requests**: In profile views, we execute requests for basic info, skills, and experience simultaneously to minimize TTFB (Time to First Byte).
- **Invalidation**: Notifications and feeds are refreshed automatically upon user interaction (e.g., accepting a connection).

### 2. State & Persistence
- Authorization tokens are stored in `LocalStorage` and managed via a Zustand store.
- To prevent **Hydration Mismatches** (Next.js specific), we use a "mounted" state pattern before accessing browser-only APIs like `localStorage`.

### 3. API Proxying
To bypass CORS and maintain security, all requests are routed through a Next.js proxy to the core backend at `http://157.180.29.248:8090`.

---

<br id="russian-version">

# AIJob Platform - Экосистема для Кандидатов и Рекрутинга

AIJob — это современное высокопроизводительное веб-приложение для карьерного роста и нетворкинга. Оно объединяет кандидатов и организации через динамическую ленту, подробные профили пользователей и интеллектуальную систему уведомлений.

## 🚀 Основные Возможности

*   **Динамическая Социальная Лента**: Панель управления (Dashboard) в реальном времени для обмена мнениями, публикации вакансий и взаимодействия через лайки и комментарии.
*   **Система Профилей**: Полноценные страницы пользователей `/candidate/profile/[id]` с тегами навыков, таймлайном опыта работы и автоматической генерацией аватарок (инициалы) при отсутствии фото.
*   **Networking Engine**: Система взаимодействия, позволяющая пользователям подписываться, устанавливать контакты и управлять профессиональными связями.
*   **Центр Уведомлений**: Отдельная вкладка для отслеживания событий с возможностью принимать или отклонять запросы на подписку прямо из списка.
*   **Безопасная Авторизация**: Полный цикл аутентификации на базе JWT с сохранением сессий и ролевой моделью доступа.

## 🛠 Технологический Стек

### Frontend
- **Фреймворк**: [Next.js 14+](https://nextjs.org/) (Архитектура App Router).
- **Язык**: [TypeScript](https://www.typescriptlang.org/) для полной типизации проекта.
- **Управление состоянием**: [Zustand](https://zustand-demo.pmnd.rs/) для глобального стейта авторизации.
- **Работа с данными**: [TanStack Query v5](https://tanstack.com/query/latest) для кэширования, «оптимистичного» UI и фоновой синхронизации.
- **Стилизация**: [Tailwind CSS](https://tailwindcss.com/) с кастомной темной премиум-темой.
- **Уведомления**: [Sonner](https://sonner.stevenly.com/) для плавных Toast-анимаций.

### Интеграция
- **API Клиент**: [Axios](https://axios-http.com/) с преднастроенными инстансами для работы с прокси.
- **JWT**: Логика декодирования и извлечения метаданных пользователя из токена.

## 🏗 Архитектура Проекта

### 1. Умная загрузка данных (TanStack Query)
Вместо обычных хуков `useEffect`, проект использует React Query.
- **Кэширование**: Данные сохраняются в памяти, что делает переходы между страницами мгновенными.
- **Параллельные запросы**: При загрузке профиля запросы информации, навыков и опыта выполняются одновременно (`Promise.all`), сокращая время ожидания.
- **Инвалидация**: Лента и уведомления обновляются автоматически при действиях пользователя.

### 2. Состояние и Стойкость
- Токены авторизации хранятся в `LocalStorage` и управляются через Zustand.
- Для предотвращения **Hydration Mismatch** (ошибки несоответствия сервера и клиента), используется паттерн проверки `mounted` перед доступом к браузерным API.

### 3. Проксирование API
Для обхода CORS и повышения безопасности, все запросы маршрутизируются через прокси Next.js на основной бэкенд: `http://157.180.29.248:8090`.

---

## ⚙️ Installation / Установка

```bash
# Clone the repository / Клонировать репозиторий
git clone https://github.com/Al1mov77/Ai-Job.git

# Install dependencies / Установить зависимости
npm install

# Run development server / Запустить сервер для разработки
npm run dev
```

Project developed with attention to aesthetics, performance, and scalability. / Проект разработан с акцентом на эстетику, производительность и масштабируемость.
