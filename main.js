const USERSURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/users";
const TASKSURL =
  "https://varankin_dev.elma365.ru/api/extensions/2a38760e-083a-4dd0-aebc-78b570bfd3c7/script/tasks";

const getData = async (url1, url2) => {
  const response1 = await fetch(url1);
  const data1 = await response1.json();

  const response2 = await fetch(url2);
  const data2 = await response2.json();

  return { data1: data1, data2: data2 };
};

getData(TASKSURL, USERSURL).then((result) => {
  const tasks = result.data1;
  const users = result.data2;

  const backlog1 = backlogComponent({
    divID: "backlog1",
    tasksArray: tasks,
    container: document.querySelector("#optional"),
  });
  backlog1.create();
  const cal1 = calendarComponent({
    divID: "calendar1",
    container: document.querySelector("#main"),
    usersArray: users,
    tasksArray: tasks,
  });
  cal1.create();
});
