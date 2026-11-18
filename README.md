# The Wild Oasis

Гостевой сайт отеля с домиками в Доломитах. Учебный проект на Next.js: каталог домиков, бронирование и личный кабинет. Данные лежат в Supabase.

Сайт: [educational-project-the-wild-oasis.vercel.app](https://educational-project-the-wild-oasis.vercel.app/)

## Стек

- Next.js 14 (App Router)
- React
- Tailwind CSS
- Supabase
- Auth.js (NextAuth) и вход через Google
- react-day-picker и date-fns для дат брони

## Запуск

```bash
npm install
npm run dev
```

Сайт откроется на [http://localhost:3000](http://localhost:3000).

Для локального запуска нужен файл `.env.local`. В репозиторий он не входит.

```bash
SUPABASE_URL=
SUPABASE_KEY=
AUTH_SECRET=
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
```

`SUPABASE_URL` и `SUPABASE_KEY` — проект Supabase с таблицами домиков, гостей, броней и настроек. `AUTH_SECRET` — секрет сессии Auth.js. `AUTH_GOOGLE_ID` и `AUTH_GOOGLE_SECRET` — клиент Google для входа.

Сборка:

```bash
npm run build
npm start
```

## Что на сайте

- Первый экран и страница About.
- Список домиков. Фильтр по числу гостей: все, 1–3, 4–7 и 8–12. Список обновляется из базы раз в час.
- Страница домика: описание, выбор дат и форма брони. Цена считается на сервере: ночи умножаются на цену со скидкой, завтрак добавляется отдельно.
- Вход через Google. При первом входе гость создаётся в Supabase.
- Кабинет: приветствие, список своих броней, правка числа гостей и заметки, удаление своей брони, профиль с гражданством и номером документа.

Чужую бронь удалить или изменить нельзя: перед записью проверяется, что бронь принадлежит текущему гостю.

Оплата не подключена. Новая бронь сохраняется в Supabase со статусом `unconfirmed` и пометкой, что она не оплачена.
