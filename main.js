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

let cal1 = calendarComponent();
let backlog1 = backlogComponent();

cal1.calendarOptions = {
  divID: "calendar1",
  weekCounter: 0,
  container: document.querySelector("#main"),
  size: 8,
  usersArray: USERS,
  tasksArray: TASKS,
  backlogLink: backlog1,
};

backlog1.backlogOptions = {
  searchKeyWord: "",
  container: document.querySelector("#optional"),
  calendarLink: cal1,
};

cal1.fillUserMap();
cal1.createCalendar();

backlog1.renderBacklog();

window.onload = function () {};
