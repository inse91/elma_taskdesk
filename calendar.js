let calendarComponent = function () {
  return {
    calendarOptions: {
      divID: undefined,
      weekCounter: undefined,
      container: undefined,
      size: undefined,
      usersArray: undefined,
      tasksArray: undefined,
    },
    userMap: undefined,

    fillUserMap() {
      let component = this;
      component.userMap = new Map();

      let users = component.calendarOptions.usersArray;
      for (let u of users) {
        component.userMap[u.id] = [];
      }

      let tasks = component.calendarOptions.tasksArray;
      for (let t of tasks) {
        t.dayGap =
          (component.parseDate(t.planEndDate) -
            component.parseDate(t.planStartDate)) /
          86400000;
        if (t.executor) {
          component.userMap[t.executor].push(t);
        }
      }
    },
    createCalendar() {
      let component = this;
      let target = component.calendarOptions.container;
      let weekCounter = component.calendarOptions.weekCounter;

      let calendardiv = document.querySelector(
        "#" + component.calendarOptions.divID
      );
      if (!calendardiv) {
        calendardiv = document.createElement("div");
        calendardiv.id = component.calendarOptions.divID;
        calendardiv.className = "calendar";
        target.appendChild(calendardiv);
      }

      calendardiv.innerHTML = "";

      component.createControlPannel(calendardiv);

      let headerdiv = document.createElement("div");
      headerdiv.id = "header";
      headerdiv.className = "toprow";
      calendardiv.appendChild(headerdiv);

      let dateArray = [""];

      for (let i = 0; i < component.calendarOptions.size; i++) {
        let newdiv = document.createElement("div");
        newdiv.className = "header-date";
        let today = new Date();
        today.setDate(today.getDate() - today.getDay() + i + 7 * weekCounter);

        if (i !== 0) {
          dateArray.push(today);
          newdiv.innerHTML = component.getHeaderDate(today);
        } else {
          newdiv.style.transform = "scale(0)";
        }
        headerdiv.appendChild(newdiv);
      }

      for (let i = 0; i < USERS.length; i++) {
        let rowdiv = document.createElement("div");
        rowdiv.className = "row";
        calendardiv.appendChild(rowdiv);

        for (let j = 0; j < component.calendarOptions.size; j++) {
          let div = document.createElement("div");
          div.setAttribute("userid", +i + 1);
          div.className = "droppable";
          if (j !== 0) {
            div.setAttribute("date", component.getDateForAttr(dateArray[j]));
            component.renderTasksforUser(dateArray[j], USERS[i].id, div);
          } else {
            div.innerHTML = USERS[i].firstName;
          }
          rowdiv.appendChild(div);
        }
      }
    },
    renderTasksforUser(currentDate, userID, target) {
      let component = this;
      let tasks = component.userMap[userID];
      let dateInString = component.getDateForAttr(currentDate);
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
    },
    createControlPannel(target) {
      let component = this;

      let buttondiv = document.createElement("div");
      buttondiv.id = "buttonsfor" + component.calendarOptions.divID;
      buttondiv.className = "buttons";
      target.appendChild(buttondiv);

      let leftButton = document.createElement("div");
      buttondiv.appendChild(leftButton);
      leftButton.innerHTML = "<<";
      leftButton.id = "left";
      leftButton.className = "button";
      leftButton.addEventListener("click", function () {
        component.calendarOptions.weekCounter--;
        component.createCalendar();
      });

      let rightButton = document.createElement("div");
      buttondiv.appendChild(rightButton);
      rightButton.innerHTML = ">>";
      rightButton.className = "button";
      rightButton.id = "right";
      rightButton.addEventListener("click", function () {
        component.calendarOptions.weekCounter++;
        component.createCalendar();
      });
    },

    afterMouseUpOnCell(task, target) {
      let component = this;
      let date = target.getAttribute("date");
      if (date) {
        task.planStartDate = date;
        let fixDate = component.parseDate(date);
        fixDate.setDate(fixDate.getDate() + task.dayGap);
        task.planEndDate = component.getDateForAttr(fixDate);
      }
      component.userMap[target.getAttribute("userid")].push(task);

      component.createCalendar();

      let par = target.parentElement;

      do {
        par = par.parentElement;
      } while (par.id.includes("calendar"));
      console.log(par);
    },

    getHeaderDate(date) {
      let day = date.getDate();
      let month = date.getMonth() + 1;
      if (day < 10) {
        day = "0" + day;
      }
      if (month < 10) {
        month = "0" + month;
      }
      return day + "." + month;
    },
    getDateForAttr(date) {
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
    },
    parseDate(date) {
      let millisecs = Date.parse(date);
      let outputDate = new Date(millisecs);
      return outputDate;
    },
  };
};
