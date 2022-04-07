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
  const cal1 = calendarComponent({
    divID: "calendar1",
    container: document.querySelector("#main"),
    usersArray: USERS,
    tasksArray: TASKS,
  });
  const cal2 = calendarComponent({
    divID: "calendar2",
    container: document.querySelector("#main"),
    usersArray: USERS,
    tasksArray: TASKS,
  });

  const backlog1 = backlogComponent({
    divID: "backlog1",
    tasksArray: TASKS,
    container: document.querySelector("#optional"),
  });
  const backlog2 = backlogComponent({
    divID: "backlog2",
    tasksArray: TASKS,
    container: document.querySelector("#optional"),
  });

  cal1.render();
  cal2.render();

  backlog1.render();
  backlog2.render();
};
