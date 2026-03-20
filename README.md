# Nova Rush

Космический слот-автомат с архитектурой ECS, рендерингом на PixiJS v8 и UI на React + Chakra UI.

## Запуск

```bash
git clone https://github.com/kreqter/novarush.git
cd novarush
```

Для установки `@releaseband/ecs` требуется GitHub token с правом `read:packages`:
GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
Generate new token (classic)
Галочку только на read:packages

```bash
export GITHUB_TOKEN=ghp_ваш_токен
npm install
npm run dev
```

Откроется на `http://localhost:3000`

### Production build

```bash
npm run build
```

Результат в папке `dist/`.

---

## Технический стек

| Технология | Назначение |
|---|---|
| PixiJS v8 | WebGL рендеринг |
| @releaseband/ecs 3.0.4 | ECS-библиотека |
| React 18 + Chakra UI v2 | UI-оверлей |
| zustand | Мост ECS ↔ React |
| TypeScript | Типизация |
| Vite | Бандлер |

---

## Архитектура

### ECS (Entity-Component-System)

**Компоненты** — чистые данные, без логики:

| Файл | Назначение |
|---|---|
| `src/components/GameSession.ts` | Баланс, ставка, имя игрока, состояние игры |
| `src/components/Reel.ts` | Индекс барабана, скорость, scrollY, текущие символы |
| `src/components/SlotSymbol.ts` | Тип символа, позиция в сетке (row, col) |
| `src/components/SpinResult.ts` | Сетка символов, выигрышные линии, сумма выигрыша |
| `src/components/Position.ts` | Координаты x, y |
| `src/components/Renderable.ts` | Ссылки на PixiJS объекты |
| `src/components/AutoPlay.ts` | Счётчик автоспинов |
| `src/components/TurboMode.ts` | Флаг турбо, множитель скорости |
| `src/components/TallSymbol.ts` | Занятые строки для длинного символа |
| `src/components/Animation.ts` | Тип, длительность, прогресс анимации |

**Системы** — вся игровая логика (порядок = pipeline кадра):

| # | Файл | Ответственность |
|---|---|---|
| 1 | `src/systems/SkipSystem.ts` | Мгновенная остановка рилов / скип показа выигрыша |
| 2 | `src/systems/SpinSystem.ts` | Обработка команды спина, списание ставки |
| 3 | `src/systems/SymbolGeneratorSystem.ts` | Генерация символов (weighted random), tall BAR |
| 4 | `src/systems/ReelSpinSystem.ts` | Анимация вращения, бесшовная остановка, bounce |
| 5 | `src/systems/EvaluationSystem.ts` | Проверка 5 paylines, подсчёт совпадений |
| 6 | `src/systems/PayoutSystem.ts` | Начисление выигрыша, таймер показа |
| 7 | `src/systems/AutoPlaySystem.ts` | Автоматический запуск следующего спина |
| 8 | `src/systems/TurboSystem.ts` | Переключение турборежима (2.5x) |
| 9 | `src/systems/AnimationSystem.ts` | Обновление анимаций |
| 10 | `src/systems/SoundSystem.ts` | Звуки по событиям (реактивно через теги) |
| 11 | `src/systems/RenderSystem.ts` | ECS → PixiJS спрайты, win lines, pulse |
| 12 | `src/systems/UIBridgeSystem.ts` | Синхронизация ECS → zustand (с диффингом) |

### Рендеринг (PixiJS)

| Файл | Назначение |
|---|---|
| `src/pixi/PixiApp.ts` | Инициализация PIXI.Application, resize (portrait/landscape) |
| `src/pixi/AssetLoader.ts` | Загрузка spritesheet, фона, логотипа |
| `src/pixi/SoundManager.ts` | Пул аудио-элементов, фоновая музыка |

### UI (React + Chakra)

| Файл | Назначение |
|---|---|
| `src/ui/StartScreen.tsx` | Модалка ввода имени |
| `src/ui/HUD.tsx` | Нижняя панель: баланс, ставка, выигрыш |
| `src/ui/SpinButton.tsx` | Кнопка SPIN/SKIP + turbo + auto (layout) |
| `src/ui/TurboToggle.tsx` | Кнопка турборежима |
| `src/ui/AutoPlayPanel.tsx` | Выбор автоспинов (10/25/50/100) |
| `src/ui/WinDisplay.tsx` | Попап WIN с пульсацией |
| `src/ui/Paytable.tsx` | Таблица выплат |

### Конфигурация

| Файл | Назначение |
|---|---|
| `src/config/game.ts` | Размеры, тайминги, позиция рамки |
| `src/config/symbols.ts` | Типы символов, веса, множители |
| `src/config/paylines.ts` | 5 линий выплат |
| `src/config/paytable.ts` | Формулы выплат (3/4/5 совпадений) |

### Связующие файлы

| Файл | Назначение |
|---|---|
| `src/ecs/index.ts` | Реэкспорт `@releaseband/ecs` + базовый класс System |
| `src/store/gameStore.ts` | zustand: состояние + команды + actions |
| `src/game.ts` | Инициализация World, создание сущностей, game loop |
| `src/App.tsx` | React root: canvas + UI overlay |
| `src/main.tsx` | Точка входа, монтирование React |

---

## Игровое поле

- **5 барабанов × 3 строки**, 7 типов символов
- **5 paylines**: 3 горизонтальные + V-образная + перевёрнутая V
- **Выплаты**: 3 совпадения = bet × 2 × множитель, 4 = ×5, 5 = ×10

## Дополнительные фичи

- **Tall Symbol** — BAR может занять 2 ячейки (30% шанс), отдельный спрайт `bar_tall`
- **AutoPlay** — серия из 10/25/50/100 автоматических спинов
- **Turbo** — ускорение 2.5x, переключается в любой момент
- **Skip** — клик по экрану перематывает текущее событие
- **Space** — запуск спина, зажатие = повтор

## Коммуникация React ↔ ECS

```
React UI  →  zustand actions  →  store.spinRequested = true
ECS Systems  →  читают store  →  обрабатывают  →  сбрасывают флаг
UIBridgeSystem  →  пишет состояние в store (только при изменениях)
React UI  →  подписывается на store  →  обновляет UI
```
