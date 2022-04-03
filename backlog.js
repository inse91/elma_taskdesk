let backlogComponent = function () {
  return {
    backlogOptions: {
      divID: undefined,
      tasksArray: undefined,
      searchKeyWord: undefined,
      container: undefined,
      afterMouseUpFunc: undefined,
      calendarLink: undefined,
    },
    backlogTasks: [],

    renderBacklog() {
      let component = this;

      if (this.backlogTasks == 0) {
        let tasks = component.backlogOptions.tasksArray;
        for (let t of tasks) {
          if (!t.executor) {
            component.backlogTasks.push(t);
          }
        }
      }

      let target = component.backlogOptions.container;

      let backlogdiv = document.querySelector(
        "#" + component.backlogOptions.divID
      );
      if (!backlogdiv) {
        backlogdiv = document.createElement("div");
        backlogdiv.id = component.backlogOptions.divID;
        backlogdiv.className = "backlog";
        target.appendChild(backlogdiv);
      }

      backlogdiv.innerHTML = "";

      let title = document.createElement("div");
      title.innerHTML = component.backlogOptions.divID.toUpperCase();
      title.id = "backlogheader";
      backlogdiv.appendChild(title);

      let txtbox = document.createElement("input");
      txtbox.id = "search" + component.backlogOptions.divID;
      txtbox.className = "search";
      txtbox.defaultValue = component.backlogOptions.searchKeyWord;
      backlogdiv.appendChild(txtbox);

      txtbox.addEventListener("keypress", function (event) {
        if (event.key === "Enter") {
          event.preventDefault();
          component.backlogOptions.searchKeyWord = txtbox.value;
          component.renderBacklog();
          txtbox = document.querySelector(
            "#search" + component.backlogOptions.divID
          );
          txtbox.focus();
          txtbox.selectionStart = txtbox.value.length;
        }
      });

      let BACKLOG = component.backlogTasks;
      let keyWord = component.backlogOptions.searchKeyWord;

      for (let i = 0; i < BACKLOG.length; i++) {
        taskName = BACKLOG[i].subject.toLowerCase();

        if (taskName.includes(keyWord.toLowerCase())) {
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
          component.applyDragAndDrop(
            taskdiv,
            component.backlogOptions.afterMouseUpFunc
          );
        }
      }
    },
    applyDragAndDrop(elem) {
      let component = this;
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
            let task = component.backlogTasks[taskIndex];

            component.backlogOptions.calendarLink.afterMouseUpOnCell(
              task,
              target
            );

            component.backlogTasks.splice(taskIndex, 1);
            component.renderBacklog();

            //elem.remove();
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
    },
  };
};
