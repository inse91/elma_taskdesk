let backlogComponent = function (options) {
  return {
    backlogOptions: {
      divID: options.divID, //тут хранить ссылку
      tasksArray: options.tasksArray,
      searchKeyWord: "",
      container: options.container,
    },
    backlogTasks: [],

    render() {
      this.renderBacklog();
      this.addResponseListener();
    },

    renderBacklog() {
      let component = this;

      if (component.backlogTasks == 0) {
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
        target.append(backlogdiv);
      }

      backlogdiv.innerHTML = "";

      let title = document.createElement("div");
      title.innerHTML = component.backlogOptions.divID.toUpperCase();
      title.id = "backlogheader";

      let txtbox = document.createElement("input");
      txtbox.id = "search" + component.backlogOptions.divID;
      txtbox.className = "search";
      txtbox.defaultValue = component.backlogOptions.searchKeyWord;

      backlogdiv.prepend(title, txtbox);

      txtbox.addEventListener("keypress", (event) => {
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

      let backlog = component.backlogTasks;
      let keyWord = component.backlogOptions.searchKeyWord;

      for (let i = 0; i < backlog.length; i++) {
        taskName = backlog[i].subject.toLowerCase();

        if (taskName.includes(keyWord.toLowerCase())) {
          let taskdiv = document.createElement("div");
          taskdiv.setAttribute("data-task-number", i);
          taskdiv.id = "task" + (i + 1);
          taskdiv.innerHTML = backlog[i].subject;
          taskdiv.draggable = true;
          taskdiv.className = "backlog-task";
          taskdiv.setAttribute(
            "hint",
            backlog[i].planStartDate + " - " + backlog[i].planEndDate
          );

          backlogdiv.append(taskdiv);
          component.applyDragAndDrop(taskdiv);
        }
      }
    },
    applyDragAndDrop(elem) {
      let component = this;
      elem.onmousedown = (event) => {
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

        document.addEventListener("mousemove", (event) => {
          moveAt(event.pageX, event.pageY);
        });

        elemClone.onmouseup = (event) => {
          elemClone.hidden = true;

          let target = document.elementFromPoint(event.clientX, event.clientY);
          let taskIndex = elem.dataset.taskNumber;

          const dropTask = new CustomEvent("dropTask", {
            bubbles: true,
            detail: {
              task: component.backlogTasks[taskIndex],
              target: target,
              taskIndex: taskIndex,
              backlogId: component.backlogOptions.divID,
            },
          });
          target.dispatchEvent(dropTask);

          elemClone.remove();
          //elemClone.onmouseup = null;
        };
        elemClone.ondragstart = () => false;
        elem.ondragstart = () => false;
      };
    },
    addResponseListener() {
      let component = this;
      let responseEventName = component.backlogOptions.divID;
      document.addEventListener(responseEventName, (event) => {
        let taskIndex = event.detail.taskIndex;
        component.backlogTasks.splice(taskIndex, 1);

        component.renderBacklog();
      });
    },
  };
};
