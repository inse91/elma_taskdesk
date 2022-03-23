const CalLen = 8; //число столбцов
const UsersURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";
const TasksURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";

const Users = getDataFromURL(UsersURL);
const Tasks = getDataFromURL(TasksURL);

const backlog = [];

const userMap = new Map();
const taskMap = new Map();

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

function shiftCalFwd() {
  weekCounter++;
  createCal(weekCounter);
}
function shiftCalBckwd() {
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
  for (let k = 0; k < CalLen; k++) {
    today.setDate(today.getDate() - today.getDay() + k + 7 * weekCounter);

    if (k !== 0) {
      dateArray.push(today);
    }
  }
  return dateArray;
}

function getDateForAttr(date) {
  let day = date.getDate();
  let month = date.getMonth() + 1;
  let yr = date.getFullYear();
  if (day < 10) {
    day = "0" + day;
  }
  if (month < 10) {
    month = "0" + month;
  }
  return yr + "-" + month + "-" + day;
}

function getUserTaksFortheDay(userid, currentDate) {
  //userid = Users[i].id;
  let str = "";
  let ustasks = userMap[userid];
  let curdateSTR = getDateForAttr(currentDate);
  if (ustasks.length !== 0) {
    for (let i = 0; i < ustasks.length; i++) {
      if (
        ustasks[i].planStartDate <= curdateSTR &&
        curdateSTR <= ustasks[i].planEndDate
      ) {
        let title =
          "dates: " + ustasks[i].planStartDate + " - " + ustasks[i].planEndDate;
        str +=
          " " +
          `<p title="${title}" class="hide">` +
          ustasks[i].subject +
          `</p>`;
      }
    }
  }

  return str;
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

  for (let i = 0; i < backlog.length; i++) {
    let taskdiv = document.createElement("div");
    taskdiv.setAttribute("taskid", backlog[i].id);
    taskdiv.setAttribute("i", i);
    taskdiv.id = "task" + (i + 1);
    taskdiv.innerHTML = backlog[i].subject;
    taskdiv.draggable = true;
    taskdiv.setAttribute(
      "hint",
      backlog[i].planStartDate + " - " + backlog[i].planEndDate
    );

    backlogdiv.appendChild(taskdiv);
    dnd(taskdiv);
  }
}

function afterMouseUPonTask(taskidx, useridx, date) {
  backlog[taskidx].planStartDate = date;
  let x = parseDate(date);
  x.setDate(x.getDate() + backlog[taskidx].dayGap);
  backlog[taskidx].planEndDate = getDateForAttr(x);

  userMap[useridx].push(backlog[taskidx]);
  backlog.splice(taskidx, 1);
  renderBacklog();

  createCal(weekCounter);
}

function afterMouseUPonUser(taskidx, useridx) {
  userMap[useridx].push(backlog[taskidx]);
  backlog.splice(taskidx, 1);
  renderBacklog();

  createCal(weekCounter);
}

function dnd(ball) {
  ball.onmousedown = function (event) {
    taskDnD = ball.cloneNode(true);
    document.body.append(taskDnD);

    taskDnD.style.position = "absolute";
    taskDnD.style.zIndex = 1000;

    moveAt(event.pageX, event.pageY);

    function moveAt(pageX, pageY) {
      taskDnD.style.left = pageX - taskDnD.offsetWidth / 2 + "px";
      taskDnD.style.top = pageY - taskDnD.offsetHeight / 2 + "px";
    }

    function onMouseMove(event) {
      moveAt(event.pageX, event.pageY);
    }

    document.addEventListener("mousemove", onMouseMove);

    taskDnD.onmouseup = function (event) {
      taskDnD.hidden = true;

      let drp = document.getElementsByClassName("hide");
      for (let x = 0; x < drp.length; x++) {
        drp[x].style.transform = "scale(0)";
      }

      let currentElem = document.elementFromPoint(event.clientX, event.clientY);
      //taskDnD.hidden = false;

      for (let x = 0; x < drp.length; x++) {
        drp[x].style.transform = "scale(1)";
      }

      if (currentElem.className == "droppable") {
        let taskidx = ball.getAttribute("i");
        let useridx = currentElem.getAttribute("userid");
        let date = currentElem.getAttribute("date");

        afterMouseUPonTask(taskidx, useridx, date);
      } else if (currentElem.className == "droppableUSER") {
        let useridx = currentElem.getAttribute("userid");
        let taskidx = ball.getAttribute("i");

        afterMouseUPonUser(taskidx, useridx);
      }
      taskDnD.remove();

      taskDnD.onmouseup = null;
    };

    taskDnD.ondragstart = function () {
      return false;
    };
    ball.ondragstart = function () {
      return false;
    };
  };
}

function renderButtons(calendarDiv) {
  let buttondiv = document.createElement("div");
  buttondiv.id = "btns";
  calendarDiv.appendChild(buttondiv);

  for (let i = 0; i < CalLen; i++) {
    //let btn = document.getElementById("btns");
    let newdiv = document.createElement("div");

    if (i !== 1 && i !== CalLen - 1) {
      newdiv.style.transform = "scale(0)";
    }

    if (i == 1) {
      newdiv.innerHTML = "LEFT";
      newdiv.id = "left";
    }

    if (i == CalLen - 1) {
      newdiv.innerHTML = "RIGHT";
      newdiv.id = "right";
    }
    buttondiv.appendChild(newdiv);
  }

  let leftButton = document.getElementById("right");
  leftButton.addEventListener("click", shiftCalFwd);

  let rightButton = document.getElementById("left");
  rightButton.addEventListener("click", shiftCalBckwd);
}

function createCal(weekCounter) {
  let calendarDiv = document.getElementById("cc");
  calendarDiv.innerHTML = ""; //чистим содержимое

  renderButtons(calendarDiv);

  let div = document.createElement("div");
  div.id = "header";
  calendarDiv.appendChild(div);

  let dateArray = [""];

  for (let i = 0; i < CalLen; i++) {
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

  for (let i = 0; i < Users.length; i++) {
    let newdiv = document.createElement("div");
    let uname = "user" + Users[i].id;
    newdiv.id = uname;
    calendarDiv.appendChild(newdiv);

    let rowdiv = document.getElementById(uname);
    for (let j = 0; j < CalLen; j++) {
      let div = document.createElement("div");
      div.id = "divfortask-" + j + "-" + i;
      div.setAttribute("userid", +i + 1);
      if (j !== 0) {
        div.setAttribute("date", getDateForAttr(dateArray[j]));
        div.className = "droppable";
        renderTasksforUser(dateArray[j], Users[i].id, div);
      } else {
        div.innerHTML = Users[i].firstName;
        div.className = "droppableUSER";
      }
      rowdiv.appendChild(div);
    }
  }
}

function renderTasksforUser(currentDate, userid, div) {
  let ustasks = userMap[userid];
  let curdateSTR = getDateForAttr(currentDate);
  if (ustasks.length !== 0) {
    for (let i = 0; i < ustasks.length; i++) {
      if (
        ustasks[i].planStartDate <= curdateSTR &&
        curdateSTR <= ustasks[i].planEndDate
      ) {
        let tsk = document.createElement("div");
        tsk.innerHTML = ustasks[i].subject;
        tsk.className = "hide";
        tsk.title = ustasks[i].planStartDate + " - " + ustasks[i].planEndDate;
        div.appendChild(tsk);
      }
    }
  }
}

window.onload = function () {
  for (let i = 0; i < Users.length; i++) {
    userMap[Users[i].id] = [];
  }

  for (let i = 0; i < Tasks.length; i++) {
    Tasks[i].dayGap =
      (parseDate(Tasks[i].planEndDate) - parseDate(Tasks[i].planStartDate)) /
      86400000;
    let task = Tasks[i];
    task.executor ? userMap[task.executor].push(task) : backlog.push(task);
  }

  renderBacklog();

  createCal(weekCounter);

  let leftButton = document.getElementById("right");
  leftButton.addEventListener("click", shiftCalFwd);

  let rightButton = document.getElementById("left");
  rightButton.addEventListener("click", shiftCalBckwd);
};
