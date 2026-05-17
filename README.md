# Книжный магазин

Next.js 14 + Supabase + Tailwind CSS.

---

## Быстрый старт

### 1. Создать проект в Supabase

1. Зайдите на [supabase.com](https://supabase.com) → **New project**
2. Запомните `Project URL` и оба ключа (`anon` и `service_role`) — они нужны на следующем шаге

### 2. Применить SQL-миграцию

В Supabase Dashboard → **SQL Editor** → вставьте содержимое `supabase/migrations/init.sql` и нажмите **Run**.

Это создаст:
- таблицу `books` с RLS-политиками
- bucket `books-images` для хранения обложек
- 8 демо-книг

### 3. Создать первого администратора

В Supabase Dashboard → **Authentication** → **Users** → **Add user** → введите email и пароль.

### 4. Настроить переменные окружения

```bash
cp .env.local.example .env.local
```

Заполните `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 5. Запустить локально

```bash
npm install
npm run dev
```

Откройте [http://localhost:3000](http://localhost:3000)

---

## Страницы

| URL | Описание |
|-----|----------|
| `/` | Каталог книг с поиском и фильтрами |
| `/admin` | Панель управления (требует авторизации) |
| `/admin/login` | Вход в админку |

---

## Вход в админку

1. Перейдите на `/admin/login`
2. Введите email и пароль, которые указали при создании пользователя в Supabase
3. После входа вы попадёте на `/admin`

---

## Деплой на Vercel

1. Залейте репо на GitHub
2. Зайдите на [vercel.com](https://vercel.com) → **New Project** → выберите репо
3. В разделе **Environment Variables** добавьте три переменные из `.env.local`
4. Нажмите **Deploy**

---

## Структура проекта

```
src/
├── app/
│   ├── page.tsx              # Каталог (/)
│   ├── layout.tsx
│   ├── globals.css
│   └── admin/
│       ├── page.tsx          # Панель управления
│       ├── layout.tsx
│       └── login/
│           └── page.tsx      # Страница входа
├── components/
│   ├── BookCard.tsx          # Карточка книги
│   ├── FilterPanel.tsx       # Боковые фильтры
│   ├── SearchBar.tsx         # Поиск
│   ├── BookForm.tsx          # Форма добавления/редактирования
│   └── ImageUpload.tsx       # Drag & drop загрузка обложки
├── lib/
│   ├── types.ts              # Типы и константы
│   └── supabase/
│       ├── client.ts         # Клиентский Supabase
│       └── server.ts         # Серверный Supabase
└── middleware.ts             # Защита /admin роутов
supabase/
└── migrations/
    └── init.sql              # Миграция БД + Storage
```
