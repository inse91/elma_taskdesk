const USERSURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";
const TASKSURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";
const USERS = getDataFromURL(USERSURL);
const TASKS = getDataFromURL(TASKSURL);
const BACKLOG = [];
const USERMAP = new Map();
const CALENDARSIZE = 8; //число столбцов

for (let user of USERS) {
  USERMAP[user.id] = [];
}
for (let task of TASKS) {
  task.dayGap =
    (parseDate(task.planEndDate) - parseDate(task.planStartDate)) / 86400000;
  task.executor ? USERMAP[task.executor].push(task) : BACKLOG.push(task);
}

let MAINCONTAINER;
let OPTIONALCONTAINER;

let weekCounter = 0;

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

function getDateForAttr(date) {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let year = date.getFullYear();
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  return year + "-" + month + "-" + day;
}
function parseDate(date) {
  let millisecs = Date.parse(date);
  let outputDate = new Date(millisecs);
  return outputDate;
}

function afterMouseUpOnTask(taskIndex, userIndex, date) {
  BACKLOG[taskIndex].planStartDate = date;
  let fixDate = parseDate(date);
  fixDate.setDate(fixDate.getDate() + BACKLOG[taskIndex].dayGap);
  BACKLOG[taskIndex].planEndDate = getDateForAttr(fixDate);

  USERMAP[userIndex].push(BACKLOG[taskIndex]);
  BACKLOG.splice(taskIndex, 1);
  backlogComponent.renderBacklog(OPTIONALCONTAINER, "", afterMouseOptions);

  calendarComponent.createCalendar(weekCounter, MAINCONTAINER);
}
function afterMouseUpOnUser(taskIndex, userIndex) {
  USERMAP[userIndex].push(BACKLOG[taskIndex]);
  BACKLOG.splice(taskIndex, 1);
  backlogComponent.renderBacklog(OPTIONALCONTAINER, "", afterMouseOptions);

  calendarComponent.createCalendar(weekCounter, MAINCONTAINER);
}

let afterMouseOptions = {
  onTask: afterMouseUpOnTask,
  onUser: afterMouseUpOnUser,
};

window.onload = function () {
  MAINCONTAINER = document.querySelector("#main");
  OPTIONALCONTAINER = document.querySelector("#optional");

  backlogComponent.renderBacklog(OPTIONALCONTAINER, "", afterMouseOptions);
  calendarComponent.createCalendar(weekCounter, MAINCONTAINER);
};
