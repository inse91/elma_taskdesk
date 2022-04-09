const calendarComponent = function (args) {
  return {
    options: {
      divID: args.divID,
      weekCounter: 0,
      container: args.container,
      size: 8,
      usersArray: args.usersArray,
      tasksArray: args.tasksArray,
    },
    userMap: null,

    create() {
      this.fillUserMap();
      this.refresh();
      this.addDropTaskListener();
    },

    refresh() {
      const component = this;

      const target = component.options.container;
      const weekCounter = component.options.weekCounter;

      let calendardiv = document.querySelector("#" + component.options.divID);
      if (!calendardiv) {
        calendardiv = document.createElement("div");
        calendardiv.id = component.options.divID;
        calendardiv.className = "calendar";
        target.append(calendardiv);
      }

      calendardiv.innerHTML = "";

      component.createControlPannel(calendardiv);

      const headerdiv = document.createElement("div");
      headerdiv.id = "header";
      headerdiv.className = "toprow";
      calendardiv.append(headerdiv);

      const dateArray = [""];

      const users = component.options.usersArray;
      const size = component.options.size;

      for (let i = 0; i < size; i++) {
        const newdiv = document.createElement("div");
        newdiv.className = "header-date";
        const today = new Date();
        today.setDate(today.getDate() - today.getDay() + i + 7 * weekCounter);

        if (i !== 0) {
          dateArray.push(today);
          newdiv.innerHTML = component.getHeaderDate(today);
        } else {
          newdiv.style.transform = "scale(0)";
        }
        headerdiv.append(newdiv);
      }

      for (let user of users) {
        const rowdiv = document.createElement("div");
        rowdiv.className = "row";
        calendardiv.append(rowdiv);

        for (let i = 0; i < size; i++) {
          const div = document.createElement("div");
          div.setAttribute("data-user-id", user.id);
          div.className = "droppable";
          if (i !== 0) {
            div.setAttribute(
              "data-date",
              component.getDateForAttr(dateArray[i])
            );
            component.renderTasksforUser(dateArray[i], user.id, div);
          } else {
            div.innerHTML = user.firstName;
          }
          rowdiv.append(div);
        }
      }
    },
    addDropTaskListener() {
      const component = this;
      const calendar = document.querySelector("#" + component.options.divID);

      calendar.addEventListener("dropTask", (event) => {
        const task = event.detail.task;
        const target = event.detail.target;

        if (target.className === "calendar-task") {
          target = target.parentElement;
        }

        if (target.className === "droppable") {
          const date = target.dataset.date;
          if (date) {
            task.planStartDate = date;
            const fixDate = component.parseDate(date);
            fixDate.setDate(fixDate.getDate() + task.dayGap);
            task.planEndDate = component.getDateForAttr(fixDate);
          }
          component.userMap[target.dataset.userId].push(task);

          component.refresh();

          const responseEventName = event.detail.dragStartElem;

          const responseEvent = new CustomEvent(responseEventName, {
            bubbles: true,
            detail: {
              taskIndex: event.detail.taskIndex,
            },
          });
          document.body.dispatchEvent(responseEvent);
        }
      });
    },

    fillUserMap() {
      const component = this;
      component.userMap = new Map();

      const users = component.options.usersArray;
      for (let user of users) {
        component.userMap[user.id] = [];
      }

      const tasks = component.options.tasksArray;
      for (let task of tasks) {
        task.dayGap =
          (component.parseDate(task.planEndDate) -
            component.parseDate(task.planStartDate)) /
          86400000;
        if (task.executor) {
          component.userMap[task.executor].push(task);
        }
      }
    },
    renderTasksforUser(currentDate, userID, target) {
      const component = this;
      const tasks = component.userMap[userID];
      const dateInString = component.getDateForAttr(currentDate);
      if (tasks.length !== 0) {
        for (let task of tasks) {
          if (
            task.planStartDate <= dateInString &&
            dateInString <= task.planEndDate
          ) {
            const newTask = document.createElement("div");
            newTask.innerHTML = task.subject;
            newTask.className = "calendar-task";
            newTask.title = task.planStartDate + " - " + task.planEndDate;
            target.append(newTask);
          }
        }
      }
    },
    createControlPannel(target) {
      const component = this;

      const buttondiv = document.createElement("div");
      buttondiv.id = "buttonsfor" + component.options.divID;
      buttondiv.className = "buttons";
      target.prepend(buttondiv);

      const leftButton = document.createElement("div");
      leftButton.innerHTML = "<<";
      leftButton.id = "left";
      leftButton.className = "button";
      leftButton.addEventListener("click", function () {
        component.options.weekCounter--;
        component.refresh();
      });

      const rightButton = document.createElement("div");
      rightButton.innerHTML = ">>";
      rightButton.className = "button";
      rightButton.id = "right";
      rightButton.addEventListener("click", function () {
        component.options.weekCounter++;
        component.refresh();
      });

      buttondiv.append(leftButton, rightButton);
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
      const year = date.getFullYear();
      if (day < 10) {
        day = "0" + day;
      }
      if (month < 10) {
        month = "0" + month;
      }
      return year + "-" + month + "-" + day;
    },
    parseDate: (date) => new Date(Date.parse(date)),
  };
};
