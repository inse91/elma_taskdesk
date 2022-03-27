// var calendarComponent = (function () {
//   return {
//     createCal: function (weekCounter, targetDiv) {
//       let calendarDiv = document.getElementById("cc");
//       calendarDiv.innerHTML = ""; //чистим содержимое

//       renderButtons(calendarDiv);

//       let div = document.createElement("div");
//       div.id = "header";
//       calendarDiv.appendChild(div);

//       let dateArray = [""];

//       for (let i = 0; i < CalLen; i++) {
//         let header = document.getElementById("header");
//         let newdiv = document.createElement("div");
//         let today = new Date();
//         today.setDate(today.getDate() - today.getDay() + i + 7 * weekCounter);

//         if (i !== 0) {
//           dateArray.push(today);
//           newdiv.innerHTML = getHeaderDate(today);
//         } else {
//           newdiv.style.transform = "scale(0)";
//         }
//         header.appendChild(newdiv);
//       }

//       for (let i = 0; i < Users.length; i++) {
//         let newdiv = document.createElement("div");
//         let uname = "user" + Users[i].id;
//         newdiv.id = uname;
//         calendarDiv.appendChild(newdiv);

//         let rowdiv = document.getElementById(uname);
//         for (let j = 0; j < CalLen; j++) {
//           let div = document.createElement("div");
//           div.id = "divfortask-" + j + "-" + i;
//           div.setAttribute("userid", +i + 1);
//           if (j !== 0) {
//             div.setAttribute("date", this.getDateForAttr(dateArray[j]));
//             div.className = "droppable";
//             renderTasksforUser(dateArray[j], Users[i].id, div);
//           } else {
//             div.innerHTML = Users[i].firstName;
//             div.className = "droppable-USER";
//           }
//           rowdiv.appendChild(div);
//         }
//       }
//     },
//     getUserTaksFortheDay: function (userid, currentDate) {
//       let str = "";
//       let ustasks = userMap[userid];
//       let curdateSTR = this.getDateForAttr(currentDate);
//       if (ustasks.length !== 0) {
//         for (let i = 0; i < ustasks.length; i++) {
//           if (
//             ustasks[i].planStartDate <= curdateSTR &&
//             curdateSTR <= ustasks[i].planEndDate
//           ) {
//             let title =
//               "dates: " +
//               ustasks[i].planStartDate +
//               " - " +
//               ustasks[i].planEndDate;
//             str +=
//               " " +
//               `<p title="${title}" class="hide">` +
//               ustasks[i].subject +
//               `</p>`;
//           }
//         }
//       }

//       return str;
//     },
//     getDateForAttr: function (date) {
//       let day = date.getDate();
//       let month = date.getMonth() + 1;
//       let yr = date.getFullYear();
//       if (day < 10) {
//         day = "0" + day;
//       }
//       if (month < 10) {
//         month = "0" + month;
//       }
//       return yr + "-" + month + "-" + day;
//     },
//   };
// })();
