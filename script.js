const USERSURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";
const TASKSURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";
const USERS = getDataFromURL(USERSURL);
const TASKS = getDataFromURL(TASKSURL);
const BACKLOG = [];
const USERMAP = new Map();
const CALENDARSIZE = 8; //число столбцов

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

function shiftCalendarForwards() {
  weekCounter++;
  createCalendar(weekCounter, MAINCONTAINER);
}
function shiftCalendarBackwards() {
  weekCounter--;
  createCalendar(weekCounter, MAINCONTAINER);
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

function renderBacklog(target, keyWord) {
  //let target = document.querySelector("#optional");

  let backlogdiv = document.querySelector("#backlog");
  if (backlogdiv) {
    backlogdiv.remove();
  }

  backlogdiv = document.createElement("div");
  backlogdiv.id = "backlog";
  target.appendChild(backlogdiv);

  backlogdiv.innerHTML = "";

  let title = document.createElement("div");
  title.innerHTML = "BACKLOG";
  title.id = "backlogheader";
  backlogdiv.appendChild(title);

  let txtbox = document.createElement("input");
  txtbox.id = "search";
  txtbox.defaultValue = keyWord;
  backlogdiv.appendChild(txtbox);

  txtbox.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      event.preventDefault();
      renderBacklog(OPTIONALCONTAINER, txtbox.value);
    } else {
      //txtbox.value += event.key;
    }
  });

  for (let i = 0; i < BACKLOG.length; i++) {
    taskName = BACKLOG[i].subject;
    if (taskName.includes(keyWord)) {
      let taskdiv = document.createElement("div");
      taskdiv.setAttribute("taskid", BACKLOG[i].id);
      taskdiv.setAttribute("i", i);
      taskdiv.id = "task" + (i + 1);
      taskdiv.innerHTML = BACKLOG[i].subject;
      taskdiv.draggable = true;
      taskdiv.className = "backlog-task";
      taskdiv.setAttribute(
        "hint",
        BACKLOG[i].planStartDate + " - " + BACKLOG[i].planEndDate
      );

      backlogdiv.appendChild(taskdiv);
      applyDragAndDrop(taskdiv);
    }
  }
}

function afterMouseUpOnTask(taskIndex, userIndex, date) {
  BACKLOG[taskIndex].planStartDate = date;
  let fixDate = parseDate(date);
  fixDate.setDate(fixDate.getDate() + BACKLOG[taskIndex].dayGap);
  BACKLOG[taskIndex].planEndDate = getDateForAttr(fixDate);

  USERMAP[userIndex].push(BACKLOG[taskIndex]);
  BACKLOG.splice(taskIndex, 1);
  renderBacklog(OPTIONALCONTAINER, "");

  createCalendar(weekCounter, MAINCONTAINER);
}

function afterMouseUpOnUser(taskIndex, userIndex) {
  USERMAP[userIndex].push(BACKLOG[taskIndex]);
  BACKLOG.splice(taskIndex, 1);
  renderBacklog(OPTIONALCONTAINER, "");

  createCalendar(weekCounter, MAINCONTAINER);
}

function applyDragAndDrop(elem) {
  elem.onmousedown = function (event) {
    elemClone = elem.cloneNode(true);
    document.body.append(elemClone);

    elemClone.style.position = "absolute";
    elemClone.style.zIndex = 1000;
    elemClone.className = "backlog-task-dragging";

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
      elemClone.style.left = pageX - elemClone.offsetWidth / 2 + "px";
      elemClone.style.top = pageY - elemClone.offsetHeight / 2 + "px";
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener("mousemove", onMouseMove);

    elemClone.onmouseup = function (event) {
      elemClone.hidden = true;

      let calnendarTasks = document.querySelectorAll(".calendar-task");
      for (let elem of calnendarTasks) {
        elem.style.transform = "scale(0)";
      }

      let target = document.elementFromPoint(event.clientX, event.clientY);

      for (let elem of calnendarTasks) {
        elem.style.transform = "scale(1)";
      }

      if (target.className == "droppable") {
        let taskIndex = elem.getAttribute("i");
        let userIndex = target.getAttribute("userid");
        let date = target.getAttribute("date");

        afterMouseUpOnTask(taskIndex, userIndex, date);
      } else if (target.className == "droppableUSER") {
        let userIndex = target.getAttribute("userid");
        let taskIndex = elem.getAttribute("i");

        afterMouseUpOnUser(taskIndex, userIndex);
      }
      elemClone.remove();

      elemClone.onmouseup = null;
    };

    elemClone.ondragstart = function () {
      return false;
    };
    elem.ondragstart = function () {
      return false;
    };
  };
}

function createControlPannel(target) {
  let buttondiv = document.createElement("div");
  buttondiv.id = "buttons";
  target.appendChild(buttondiv);

  let leftButton = document.createElement("div");
  buttondiv.appendChild(leftButton);
  leftButton.innerHTML = "LEFT";
  leftButton.id = "left";
  leftButton.className = "button";
  leftButton.addEventListener("click", shiftCalendarBackwards);

  let rightButton = document.createElement("div");
  buttondiv.appendChild(rightButton);
  rightButton.innerHTML = "RIGHT";
  rightButton.className = "button";
  rightButton.id = "right";
  rightButton.addEventListener("click", shiftCalendarForwards);
}

function createCalendar(weekCounter, target) {
  let calendar = document.querySelector("#calendar");
  if (calendar) {
    calendar.remove();
  }

  let calendardiv = document.createElement("div");
  calendardiv.id = "calendar";
  target.appendChild(calendardiv);

  let headerdiv = document.createElement("div");
  headerdiv.id = "header";
  headerdiv.className = "toprow";
  calendardiv.appendChild(headerdiv);

  let dateArray = [""];

  for (let i = 0; i < CALENDARSIZE; i++) {
    let newdiv = document.createElement("div");
    newdiv.className = "header-date";
    let today = new Date();
    today.setDate(today.getDate() - today.getDay() + i + 7 * weekCounter);

    if (i !== 0) {
      dateArray.push(today);
      newdiv.innerHTML = getHeaderDate(today);
    } else {
      newdiv.style.transform = "scale(0)";
    }
    headerdiv.appendChild(newdiv);
  }

  for (let i = 0; i < USERS.length; i++) {
    let rowdiv = document.createElement("div");
    rowdiv.className = "row";
    //rowdiv.id = "user" + USERS[i].id;
    calendardiv.appendChild(rowdiv);

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
  let dateInString = getDateForAttr(currentDate);
  if (tasks.length !== 0) {
    for (let task of tasks) {
      if (
        task.planStartDate <= dateInString &&
        dateInString <= task.planEndDate
      ) {
        let newTask = document.createElement("div");
        newTask.innerHTML = task.subject;
        newTask.className = "calendar-task";
        newTask.title = task.planStartDate + " - " + task.planEndDate;
        target.appendChild(newTask);
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

  MAINCONTAINER = document.querySelector("#main");
  OPTIONALCONTAINER = document.querySelector("#optional");

  renderBacklog(OPTIONALCONTAINER, "");

  createControlPannel(MAINCONTAINER);
  createCalendar(weekCounter, MAINCONTAINER);
};
