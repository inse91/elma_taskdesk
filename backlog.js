let backlogComponent = (function () {
  return {
    renderBacklog(optionsObject) {
      let component = this;
      let target = optionsObject.container;
      let keyWord = optionsObject.searchKeyWord;
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
          backlogOptions.searchKeyWord = txtbox.value;
          component.renderBacklog(backlogOptions);
          txtbox = document.querySelector("#search");
          txtbox.focus();
          txtbox.selectionStart = txtbox.value.length;
        }
      });

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
          component.applyDragAndDrop(taskdiv, optionsObject.afterMouseUp);
        }
      }
    },
    applyDragAndDrop(elem, afterMouseUpFunc) {
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

            afterMouseUpFunc(taskIndex, userIndex, date);
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
})();
