const backlogComponent = function (args) {
  return {
    options: {
      divID: args.divID,
      tasksArray: args.tasksArray,
      searchKeyWord: "",
      container: args.container,
    },
    tasksArr: [],

    create() {
      this.fillTasksArr();
      this.render();
      this.addResponseListener();
    },

    fillTasksArr() {
      const component = this;
      const tasks = component.options.tasksArray;
      for (const task of tasks) {
        if (!task.executor) {
          component.tasksArr.push(task);
        }
      }
    },
    render() {
      const component = this;
      const target = component.options.container;

      let backlogdiv = document.querySelector("#" + component.options.divID);
      if (!backlogdiv) {
        backlogdiv = document.createElement("div");
        backlogdiv.id = component.options.divID;
        backlogdiv.className = "backlog";
        target.append(backlogdiv);
      }
      backlogdiv.innerHTML = "";

      const title = document.createElement("div");
      title.innerHTML = "backlog".toUpperCase();
      title.className = "backlogheader";
      backlogdiv.prepend(title);

      title.after(this.getSearchBox());

      const tasks = component.tasksArr;
      const keyWord = component.options.searchKeyWord;

      let taskCounter = 0;
      tasks.forEach((task, index) => {
        taskName = task.subject.toLowerCase();

        if (taskName.includes(keyWord.toLowerCase())) {
          const taskdiv = document.createElement("div");
          taskdiv.setAttribute("data-task-number", index);
          taskdiv.innerHTML = task.subject;
          taskdiv.draggable = true;
          taskdiv.className = "backlog-task";
          taskdiv.setAttribute(
            "hint",
            task.planStartDate + " - " + task.planEndDate
          );
          taskCounter++;

          backlogdiv.append(taskdiv);
          component.applyDragAndDrop(taskdiv);
        }
      });
      return taskCounter;
    },

    getSearchBox() {
      const component = this;
      const defaulfValue = "Enter task name";

      let searchBox = document.createElement("input");
      searchBox.id = "search" + component.options.divID;
      searchBox.type = "text";
      searchBox.className = "search";
      searchBox.value = component.options.searchKeyWord;
      if (searchBox.value == "") {
        searchBox.value = defaulfValue;
      }

      searchBox.addEventListener("focusin", () => {
        if (searchBox.value == "" || searchBox.value == defaulfValue) {
          searchBox.value = component.options.searchKeyWord;
        }
      });
      searchBox.addEventListener("focusout", () => {
        if (searchBox.value === "") {
          searchBox.value = defaulfValue;
        }
      });
      searchBox.addEventListener("keypress", (event) => {
        if (event.key === "Enter") {
          event.preventDefault();
          component.options.searchKeyWord = searchBox.value;
          component.render();
          searchBox = document.querySelector(
            "#search" + component.options.divID
          );
          searchBox.focus();
          searchBox.selectionStart = searchBox.value.length;
        }
      });
      return searchBox;
    },
    applyDragAndDrop(elem) {
      const component = this;
      elem.onmousedown = (event) => {
        elemClone = elem.cloneNode(true);
        document.body.append(elemClone);

        elemClone.style.position = "absolute";
        elemClone.style.zIndex = 1000;
        elemClone.className = "backlog-task-dragging";

        function moveAt(pageX, pageY) {
          elemClone.style.left = pageX - elemClone.offsetWidth / 2 + "px";
          elemClone.style.top = pageY - elemClone.offsetHeight / 2 + "px";
        }

        document.addEventListener("mousemove", (event) => {
          moveAt(event.pageX, event.pageY);
        });

        elemClone.onmouseup = (event) => {
          elemClone.hidden = true;

          const target = document.elementFromPoint(
            event.clientX,
            event.clientY
          );
          const taskIndex = elem.dataset.taskNumber;

          const dropTask = new CustomEvent("dropTask", {
            bubbles: true,
            detail: {
              task: component.tasksArr[taskIndex],
              target: target,
              taskIndex: taskIndex,
              dragStartElem: component.options.divID,
            },
          });
          target.dispatchEvent(dropTask);

          elemClone.remove();
          elemClone.onmouseup = null;
        };
        elemClone.ondragstart = () => false;
        elem.ondragstart = () => false;
      };
    },
    addResponseListener() {
      const component = this;
      const responseEventName = component.options.divID;
      document.addEventListener(responseEventName, (event) => {
        const taskIndex = event.detail.taskIndex;
        component.tasksArr.splice(taskIndex, 1);

        const taskCounter = component.render();
        if (taskCounter == 0) {
          component.options.searchKeyWord = "";
          component.render();
        }
      });
    },
  };
};
