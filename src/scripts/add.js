document
  .getElementById("addTaskForm")
  .addEventListener("submit", function (event) {
    event.preventDefault();
    console.log("Форма отправлена");
    alert("Задача сохранена");
    // Отправка формы
  });
