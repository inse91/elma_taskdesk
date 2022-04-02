let calendarComponent = (function () {
  return {
    calendarOptions: {
      weekCounter: 0,
      container: document.querySelector("#main"),
      size: 8,
    },
    userMap: null,
    fillUserMap(users, tasks) {
      let component = this;
      this.userMap = new Map();
      for (let u of users) {
        component.userMap[u.id] = [];
      }
      for (let t of tasks) {
        t.dayGap =
          (component.parseDate(t.planEndDate) -
            component.parseDate(t.planStartDate)) /
          86400000;
        t.executor ? component.userMap[t.executor].push(t) : BACKLOG.push(t);
      }
    },
    createCalendar(calendarOptions) {
      let component = this;
      let target = document.querySelector("#main");
      let weekCounter = component.calendarOptions.weekCounter;
      component.createControlPannel(target);

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

      let buttons = document.querySelector("#buttons");
      if (buttons) {
        buttons.remove();
      }

      let buttondiv = document.createElement("div");
      buttondiv.id = "buttons";
      target.appendChild(buttondiv);

      let leftButton = document.createElement("div");
      buttondiv.appendChild(leftButton);
      leftButton.innerHTML = "<<";
      leftButton.id = "left";
      leftButton.className = "button";
      leftButton.addEventListener("click", function () {
        component.calendarOptions.weekCounter--;
        component.createCalendar(component.calendarOptions);
      });

      let rightButton = document.createElement("div");
      buttondiv.appendChild(rightButton);
      rightButton.innerHTML = ">>";
      rightButton.className = "button";
      rightButton.id = "right";
      rightButton.addEventListener("click", function () {
        component.calendarOptions.weekCounter++;
        component.createCalendar(component.calendarOptions);
      });
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
})();
