const USERSURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";
const TASKSURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";
const USERS = getDataFromURL(USERSURL);
const TASKS = getDataFromURL(TASKSURL);
function getDataFromURL(url) {
  let httpRequest = new XMLHttpRequest();
  httpRequest.open("GET", url, false);
  httpRequest.send();
  if (httpRequest.status == 200) {
    let body = httpRequest.responseText;
    return JSON.parse(body);
  } else {
    alert("ERROR" + httpRequest.status);
    return null;
  }
}

window.onload = function () {
  const cal1 = calendarComponent();
  const backlog1 = backlogComponent();

  const cal2 = calendarComponent();
  const backlog2 = backlogComponent();

  cal1.calendarOptions = {
    divID: "calendar1",
    weekCounter: 0,
    container: document.querySelector("#main"),
    size: 8,
    usersArray: USERS,
    tasksArray: TASKS,
  };
  cal2.calendarOptions = {
    divID: "calendar2",
    weekCounter: 0,
    container: document.querySelector("#main"),
    size: 8,
    usersArray: USERS,
    tasksArray: TASKS,
  };

  backlog1.backlogOptions = {
    divID: "backlog1",
    tasksArray: TASKS,
    searchKeyWord: "",
    container: document.querySelector("#optional"),
    calendarLink: cal1,
  };
  backlog2.backlogOptions = {
    divID: "backlog2",
    tasksArray: TASKS,
    searchKeyWord: "",
    container: document.querySelector("#optional"),
    calendarLink: cal2,
  };

  cal1.fillUserMap();
  cal1.createCalendar();

  cal2.fillUserMap();
  cal2.createCalendar();

  backlog1.renderBacklog();
  backlog2.renderBacklog();
};

/*

Let calendar = new Calendar()

Ссылка на бэклог в календаре
Ну и так же в бэклоге осталась логика по использованию календаря

И после всего этого,  создаем 4 контейнера в html, 2 на календарь, 
2 на бэклог и они все должны появиться на странице и работать

*/
