# Артём Калинин — портфолио веб-разработки

Основной сайт-портфолио для привлечения заказчиков на создание и доработку сайтов. Здесь собраны услуги, ориентиры по стоимости, процесс работы и пять демонстрационных веб-проектов.

![Web Portfolio Validation](https://github.com/blvxx/web-development-portfolio/actions/workflows/portfolio-validation.yml/badge.svg)

**[Веб-портфолио](https://blvxx.github.io/web-development-portfolio/)** · **[Инженерное портфолио](https://blvxx.github.io/portfolio/engineering/)** · **[Исходный код](https://github.com/blvxx/web-development-portfolio)**

## Услуги

- Создание лендингов и небольших сайтов компаний.
- Редизайн и обновление структуры существующего сайта.
- Адаптация интерфейсов под смартфоны и планшеты.
- Исправление HTML / CSS / JavaScript и небольшие интерактивные доработки.

## Избранные проекты

| Проект | Формат | Что показывает |
|---|---|---|
| [NOIR COFFEE](./projects/noir-coffee/) | Сайт кофейни | Атмосфера бренда, меню, выразительная типографика и адаптивная навигация |
| [FRAME STUDIO](./projects/frame-studio/) | Сайт студии | Визуальная композиция, портфолио и презентация услуг |
| [IRON DISTRICT](./projects/iron-district/) | Лендинг фитнес-клуба | Контрастная визуальная система, направления тренировок и CTA |
| [ДОМФОРМА](./projects/domforma/) | Сайт ремонтно-отделочной компании | Структура услуг, концепции интерьеров, этапы работ, адаптивное меню и демо-форма |
| [VÉRA SKIN](./projects/vera-skin/) | E-commerce UI | Каталог, фильтрация, избранное и демонстрационная корзина |

> **Честно о проектах:** это самостоятельные концепт-работы, созданные для демонстрации подхода и навыков. Они не выдаются за коммерческие клиентские внедрения или отзывы реальных заказчиков. Форма ДОМФОРМА работает только в демонстрационном режиме и не отправляет данные; функции VÉRA SKIN также демонстрационные.

## Технологии

- **HTML5** — семантическая структура.
- **CSS3** — адаптивные сетки, типографика и состояния интерфейса.
- **JavaScript** — интерактивные элементы и клиентская логика.
- **Responsive design** — поддержка мобильных и десктопных экранов.

## Локальный запуск

1. Склонируйте репозиторий:
   ```bash
   git clone https://github.com/blvxx/web-development-portfolio.git
   ```
2. Откройте корневой `index.html` в браузере.
3. Для отдельного проекта откройте его `index.html` внутри `projects/`.

Сборщик и сервер разработки не требуются: сайты реализованы как самостоятельные HTML/CSS/JavaScript-страницы.

## Автоматические проверки

GitHub Actions запускает два уровня проверок. Статические проверки выполняются на Python 3.12 без сторонних runtime-зависимостей:

- корректность структуры `projects.json` и уникальность идентификаторов;
- наличие страницы и мобильного viewport для каждого демо-проекта;
- соответствие ссылок на демо и исходный код реальным папкам репозитория;
- существование локальных CSS, JavaScript и HTML-ссылок главной страницы;
- безопасные настройки iframe-превью и внешних ссылок.

Статические проверки: **5 passed**. Playwright на Chromium: **10 passed** — последний успешный прогон от 23 ноября 2026 года включает проверку всех пяти демо-сайтов на мобильном viewport и интерактивные пользовательские сценарии. [Открыть успешный CI-запуск](https://github.com/blvxx/web-development-portfolio/actions/runs/45103113568) · [JUnit-отчёт браузерных тестов](https://github.com/blvxx/web-development-portfolio/actions/runs/45103113568/artifacts/14786307014).

Запуск локально:

```bash
python -m unittest discover -s tests -v

# Playwright browser suite (Chromium)
python -m pip install -r requirements-test.txt
python -m playwright install chromium
pytest -q tests/test_browser_regression.py
```

Эти проверки валидируют структуру контента и локальные ссылки. Отдельная Playwright browser suite запускает Chromium и проверяет:
- загрузку пяти демонстрационных сайтов на мобильном viewport без горизонтальной прокрутки;
- пересчёт формата и цены в интерактивном брифе;
- открытие/закрытие мобильной навигации клавишей Escape с возвратом фокуса;
- фильтрацию меню NOIR и каталога VÉRA SKIN, добавление товара в корзину;
- HTML-валидацию и демонстрационный сценарий формы ДОМФОРМА.

Browser tests используют локальный HTTP-сервер; внешние изображения и шрифты блокируются, чтобы не делать результат зависимым от сторонних CDN. Они проверяют функциональность и адаптивный viewport, но не заменяют полноценный визуальный дизайн-ревью и проверку реального устройства.

## Как оценить проекты

- Проверьте навигацию и интерактивные элементы.
- Измените ширину окна до мобильного размера.
- Проверьте, что содержимое не выходит за границы экрана.
- Проверьте фокус с клавиатуры и доступность основных действий.

## Контакты

По вопросам создания и доработки сайтов: **[blvx8x@gmail.com](mailto:blvx8x@gmail.com)** · [Telegram](https://t.me/blvlxx).

**Артём Калинин** · [GitHub](https://github.com/blvxx)

## SMM portfolio

A separate SMM profile page is published as a route inside this existing GitHub Pages site; it does not create another Pages repository:

**[SMM-специалист / Контент-стратег — опыт и кейс East West Fitness](https://blvxx.github.io/web-development-portfolio/smm/)**

The page presents experience at Independent Digital Practice, Delivery Club and East West Fitness. The East West Fitness case is reconstructed from the described work because original source files and historical metrics are unavailable; visual examples and content matrix are labelled as demonstrations, and no unverified performance figures are claimed.


## Новый кейс: ДОМФОРМА

[Открыть сайт](https://blvxx.github.io/web-development-portfolio/projects/domforma/) · [Описание проекта](./projects/domforma/README.md)

Сайт вымышленной ремонтно-отделочной компании: услуги, интерьерные концепции, процесс, FAQ и адаптивная форма запроса. Проект создан как демонстрация структуры коммерческого сайта; он не является реальным заказом.
