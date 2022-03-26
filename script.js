const USERSURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";
const TASKSURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";
const USERS = getDataFromURL(USERSURL);
const TASKS = getDataFromURL(TASKSURL);
const BACKLOG = [];
const USERMAP = new Map();
const CALENDARSIZE = 8; //число столбцов

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

function shiftCalendarForwards() {
  weekCounter++;
  createCal(weekCounter);
}
function shiftCalendarBackwards() {
  weekCounter--;
  createCal(weekCounter);
}

function getHeaderDate(date) {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  return day + "." + month;
}

function getDateArray() {
  let dateArray = [""];
  let today = new Date();
  for (let i = 0; i < CALENDARSIZE; i++) {
    today.setDate(today.getDate() - today.getDay() + i + 7 * weekCounter);

    if (i !== 0) {
      dateArray.push(today);
    }
  }
  return dateArray;
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

function renderBacklog() {
  let backlogdiv = document.getElementById("backlog");
  backlogdiv.innerHTML = "";

  let title = document.createElement("div");
  title.innerHTML = "BACKLOG";
  title.id = "backlogheader";
  backlogdiv.appendChild(title);

  let txtbox = document.createElement("input");
  txtbox.id = "search";
  backlogdiv.appendChild(txtbox);

  for (let i = 0; i < BACKLOG.length; i++) {
    let taskdiv = document.createElement("div");
    taskdiv.setAttribute("taskid", BACKLOG[i].id);
    taskdiv.setAttribute("i", i);
    taskdiv.id = "task" + (i + 1);
    taskdiv.innerHTML = BACKLOG[i].subject;
    taskdiv.draggable = true;
    taskdiv.setAttribute(
      "hint",
      BACKLOG[i].planStartDate + " - " + BACKLOG[i].planEndDate
    );

    backlogdiv.appendChild(taskdiv);
    applyDragAndDrop(taskdiv);
  }
}

function afterMouseUpOnTask(taskIndex, userIndex, date) {
  BACKLOG[taskIndex].planStartDate = date;
  let fixDate = parseDate(date);
  fixDate.setDate(fixDate.getDate() + BACKLOG[taskIndex].dayGap);
  BACKLOG[taskIndex].planEndDate = getDateForAttr(fixDate);

  USERMAP[userIndex].push(BACKLOG[taskIndex]);
  BACKLOG.splice(taskIndex, 1);
  renderBacklog();

  createCal(weekCounter);
}

function afterMouseUpOnUser(taskIndex, userIndex) {
  USERMAP[userIndex].push(BACKLOG[taskIndex]);
  BACKLOG.splice(taskIndex, 1);
  renderBacklog();

  createCal(weekCounter);
}

function applyDragAndDrop(target) {
  target.onmousedown = function (event) {
    targetClone = target.cloneNode(true);
    document.body.append(targetClone);

    targetClone.style.position = "absolute";
    targetClone.style.zIndex = 1000;

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
      targetClone.style.left = pageX - targetClone.offsetWidth / 2 + "px";
      targetClone.style.top = pageY - targetClone.offsetHeight / 2 + "px";
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener("mousemove", onMouseMove);

    targetClone.onmouseup = function (event) {
      targetClone.hidden = true;

      let calnendarTasks = document.getElementsByClassName("hide");
      for (let elem of calnendarTasks) {
        elem.style.transform = "scale(0)";
      }

      let currentElem = document.elementFromPoint(event.clientX, event.clientY);

      for (let elem of calnendarTasks) {
        elem.style.transform = "scale(1)";
      }

      if (currentElem.className == "droppable") {
        let taskIndex = target.getAttribute("i");
        let userIndex = currentElem.getAttribute("userid");
        let date = currentElem.getAttribute("date");

        afterMouseUpOnTask(taskIndex, userIndex, date);
      } else if (currentElem.className == "droppableUSER") {
        let userIndex = currentElem.getAttribute("userid");
        let taskIndex = target.getAttribute("i");

        afterMouseUpOnUser(taskIndex, userIndex);
      }
      targetClone.remove();

      targetClone.onmouseup = null;
    };

    targetClone.ondragstart = function () {
      return false;
    };
    target.ondragstart = function () {
      return false;
    };
  };
}

function renderButtons(calendarDiv) {
  let buttondiv = document.createElement("div");
  buttondiv.id = "buttons";
  calendarDiv.appendChild(buttondiv);

  for (let i = 0; i < CALENDARSIZE; i++) {
    let newdiv = document.createElement("div");

    if (i !== 1 && i !== CALENDARSIZE - 1) {
      newdiv.style.transform = "scale(0)";
    }

    if (i == 1) {
      newdiv.innerHTML = "LEFT";
      newdiv.id = "left";
    }

    if (i == CALENDARSIZE - 1) {
      newdiv.innerHTML = "RIGHT";
      newdiv.id = "right";
    }
    buttondiv.appendChild(newdiv);
  }

  let leftButton = document.getElementById("right");
  leftButton.addEventListener("click", shiftCalendarForwards);

  let rightButton = document.getElementById("left");
  rightButton.addEventListener("click", shiftCalendarBackwards);
}

function createCal(weekCounter) {
  let calendardiv = document.getElementById("calendar");
  calendardiv.innerHTML = ""; //чистим содержимое

  renderButtons(calendardiv);

  let div = document.createElement("div");
  div.id = "header";
  calendardiv.appendChild(div);

  let dateArray = [""];

  for (let i = 0; i < CALENDARSIZE; i++) {
    let header = document.getElementById("header");
    let newdiv = document.createElement("div");
    let today = new Date();
    today.setDate(today.getDate() - today.getDay() + i + 7 * weekCounter);

    if (i !== 0) {
      dateArray.push(today);
      newdiv.innerHTML = getHeaderDate(today);
    } else {
      newdiv.style.transform = "scale(0)";
    }
    header.appendChild(newdiv);
  }

  for (let i = 0; i < USERS.length; i++) {
    let newdiv = document.createElement("div");
    let uname = "user" + USERS[i].id;
    newdiv.id = uname;
    calendardiv.appendChild(newdiv);

    let rowdiv = document.getElementById(uname);
    for (let j = 0; j < CALENDARSIZE; j++) {
      let div = document.createElement("div");
      div.setAttribute("userid", +i + 1);
      if (j !== 0) {
        div.setAttribute("date", getDateForAttr(dateArray[j]));
        div.className = "droppable";
        renderTasksforUser(dateArray[j], USERS[i].id, div);
      } else {
        div.innerHTML = USERS[i].firstName;
        div.className = "droppableUSER";
      }
      rowdiv.appendChild(div);
    }
  }
}

function renderTasksforUser(currentDate, userID, target) {
  let tasks = USERMAP[userID];
  let curdateSTR = getDateForAttr(currentDate);
  if (tasks.length !== 0) {
    for (let task of tasks) {
      if (task.planStartDate <= curdateSTR && curdateSTR <= task.planEndDate) {
        let newtask = document.createElement("div");
        newtask.innerHTML = task.subject;
        newtask.className = "hide";
        newtask.title = task.planStartDate + " - " + task.planEndDate;
        target.appendChild(newtask);
      }
    }
  }
}

window.onload = function () {
  for (let user of USERS) {
    USERMAP[user.id] = [];
  }

  for (let task of TASKS) {
    task.dayGap =
      (parseDate(task.planEndDate) - parseDate(task.planStartDate)) / 86400000;
    task.executor ? USERMAP[task.executor].push(task) : BACKLOG.push(task);
  }

  renderBacklog();

  createCal(weekCounter);

  let leftButton = document.getElementById("right");
  leftButton.addEventListener("click", shiftCalendarForwards);

  let rightButton = document.getElementById("left");
  rightButton.addEventListener("click", shiftCalendarBackwards);
};
