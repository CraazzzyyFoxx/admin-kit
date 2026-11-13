import type { en } from "./en.js";

export const ru: typeof en = {
  "adminKit": {
    "table": {
      "copyRow": "Копировать строку",
      "copy": "Копировать «{value}»",
      "rows": "Строк",
      "range": "{start}–{end} из {total}",
      "rowsPerPage": "Строк на странице",
      "rowsAuto": "Авто · {count}"
    },
    "dataTable": {
      "noRecords": "Пока ничего нет.",
      "search": "Поиск…",
      "clearSearchAndFilters": "Сбросить поиск и фильтры",
      "clearSearch": "Сбросить поиск",
      "clearFilters": "Сбросить фильтры",
      "collapseDetails": "Свернуть подробности",
      "expandDetails": "Развернуть подробности",
      "selectRow": "Выбрать строку {id}",
      "selectVisibleRows": "Выбрать все видимые строки",
      "sortPriority": "Приоритет сортировки {index}",
      "sortHint": "Нажмите для сортировки, Shift+клик — для добавления второй сортировки",
      "sort": "Сортировка",
      "sortAsc": "По возрастанию",
      "sortDesc": "По убыванию",
      "resize": "Изменить ширину столбца {id}",
      "resizeHint": "Перетащите, чтобы изменить ширину, двойной клик — сбросить",
      "actions": "Действия",
      "actionsFor": "Действия: {label}",
      "refreshing": "Обновляем результаты…",
      "selectedRowsOtherPages": "Выбранные строки с других страниц тоже войдут в массовые действия",
      "exportSelected": "{count, plural, one {Экспортировать # выбранную строку в CSV} few {Экспортировать # выбранные строки в CSV} many {Экспортировать # выбранных строк в CSV} other {Экспортировать # выбранной строки в CSV}}",
      "selectedOnOtherPages": "Выбрано на других страницах: {count}",
      "selectAllMatching": "Выбрать все: {count}",
      "selectingAll": "Выбираем все строки…",
      "exportCurrent": "Экспортировать текущий вид в CSV",
      "compactRows": "Компактные строки",
      "pageHotkeys": "Горячие клавиши страниц",
      "core": "Основные",
      "meta": "Служебные",
      "admin": "Администрирование",
      "columns": "Столбцы",
      "resetColumns": "Сбросить по умолчанию",
      "views": "Виды",
      "view": "Вид",
      "deleteView": "Удалить вид «{name}»",
      "saveViewPrompt": "Сохранить текущий вид…",
      "saveView": "Сохранить текущий вид",
      "viewName": "Название вида",
      "rowFallback": "строка {id}",
      "noMatchSearch": "По запросу ничего не найдено.",
      "noMatchFilters": "С такими фильтрами ничего не найдено.",
      "noMatchBoth": "По запросу и фильтрам ничего не найдено.",
      "rowHint": "Стрелками вверх и вниз переходите между строками{select, select, yes {, пробел — выбрать, Shift со стрелкой — расширить выделение} other {}}{open, select, yes {, Enter — открыть строку в фокусе} other {}}.",
      "doubleClickHint": "Двойной щелчок — открыть"
    },
    "actions": {
      "back": "Назад",
      "bulkActions": "Массовые действия",
      "selectedSummary": "Выбрано: <num>{count}</num>",
      "clearSelection": "Снять выделение",
      "save": "Сохранить",
      "removeFilter": "Убрать фильтр «{label}»",
      "addFilter": "Добавить фильтр",
      "filter": "Фильтр",
      "backToFilterList": "К списку фильтров",
      "filterBy": "Фильтровать по…",
      "searchPicker": "Поиск: {label}…",
      "noFilters": "Нет доступных фильтров.",
      "nothingMatchesShort": "Ничего не найдено.",
      "clearAll": "Сбросить всё",
      "activeFilters": "Активные фильтры"
    },
    "infiniteScroll": {
      "rows": "строк",
      "progress": "Показано {loaded, number} {unit}",
      "progressOf": "Показано {loaded, number} из {total, number} {unit}",
      "loading": "Загружаем ещё {unit}…",
      "loadMore": "Загрузить ещё {unit}",
      "retry": "Повторить загрузку: {unit}",
      "error": "Не удалось загрузить ещё {unit}. Проверьте соединение и повторите попытку."
    },
    "pagination": {
      "label": "Постраничная навигация",
      "previous": "Предыдущая страница",
      "next": "Следующая страница",
      "goToPage": "Перейти на страницу {page}",
      "jump": "Перейти к странице",
      "go": "Перейти",
      "page": "Стр.",
      "ofTotal": "из {total}",
      "status": "Страница {page} из {total}"
    },
    "common": {
      "copy": "Копировать",
      "copied": "Скопировано",
      "hide": "Скрыть",
      "show": "Показать",
      "confirm": {
        "cascade": "Также будет удалено:",
        "typeToConfirm": "Введите <code>{name}</code> для подтверждения"
      },
      "cancel": "Отмена",
      "pageState": {
        "error": {
          "title": "Не удалось загрузить раздел",
          "description": "Запрос не выполнен. Проверьте соединение и повторите попытку."
        }
      },
      "retry": "Повторить",
      "save": "Сохранить",
      "saving": "Сохранение…",
      "close": "Закрыть"
    },
    "entityForm": {
      "couldNotSave": "Не удалось сохранить изменения.",
      "discardChanges": "Отменить изменения",
      "unsavedDescription": "В форме есть несохранённые изменения. Если вы уйдёте сейчас, они будут потеряны."
    },
    "saveBar": {
      "unsavedChanges": "Есть несохранённые изменения",
      "save": "Сохранить изменения",
      "discard": "Отменить",
      "discardTitle": "Отменить изменения?",
      "discardDescription": "В форме есть несохранённые изменения. Если вы уйдёте сейчас, они будут потеряны.",
      "discardConfirm": "Отменить и уйти"
    },
    "errors": {
      "status": "HTTP {status}",
      "requestId": "ID запроса"
    }
  }
};
