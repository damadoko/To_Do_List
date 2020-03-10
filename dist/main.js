const model = (() => {
  let data = JSON.parse(localStorage.getItem("DATA_TEMP")) || [];
  console.log("data", data);

  const addTask = des => {
    let newData, newID;

    // Create new ID: ID = last ID + 1
    if (data.length > 0) {
      newID = data[data.length - 1].ID + 1;
    } else {
      newID = 0;
    }
    // NewData: add new ID to dat
    newData = { ID: newID, description: des, status: "notDone" };
    data.push(newData);
    localStorage.setItem("DATA_TEMP", JSON.stringify(data));
    return newData;
  };

  const delTask = taskID => {
    data = data.filter(item => item.ID != taskID);
    localStorage.setItem("DATA_TEMP", JSON.stringify(data));
  };

  const changeStatus = taskID => {
    const dataIDArr = data.map(item => item.ID);
    const index = dataIDArr.indexOf(Number(taskID));
    // console.log(index);

    data[index].status === "notDone"
      ? (data[index].status = "done")
      : (data[index].status = "notDone");

    localStorage.setItem("DATA_TEMP", JSON.stringify(data));
  };

  const changeTaskDesModel = (taskID, des) => {
    const dataIDArr = data.map(item => item.ID);
    const index = dataIDArr.indexOf(Number(taskID));
    data[index].description = des;
    localStorage.setItem("DATA_TEMP", JSON.stringify(data));
  };

  const calculateReport = () => {
    let totalTasks, completedTasks, remainTask;
    totalTasks = data.length;
    const dataStatusArr = data.map(item => item.status);
    const dataDoneArr = dataStatusArr.filter(item => item === "done");
    completedTasks = dataDoneArr.length;
    remainTask = totalTasks - completedTasks;
    return {
      total: totalTasks,
      completed: completedTasks,
      remaining: remainTask
    };
  };

  const calculateFiltedTask = () => {
    const doneTasksArr = data.filter(item => item.status === "done");
    const remainTasksArr = data.filter(item => item.status === "notDone");
    return {
      doneArr: doneTasksArr,
      remainArr: remainTasksArr
    };
  };

  return {
    addTaskToModel: addTask,
    delTaskInModel: delTask,
    changeStatusInModel: changeStatus,
    changeTaskDesInModel: changeTaskDesModel,
    calReport: calculateReport,
    filtedTaskArr: calculateFiltedTask,
    data: data
  };
})();
const UICtrl = (() => {
  // DOM string
  const DOMString = {
    addBtn: ".app-add",
    taskInput: ".app-input",
    appWrapper: ".app-wrapper",
    tickedIcons: ".ticked-icon",
    delIcons: ".delete-icon",
    taskContent: ".task-content",
    reportTotal: "#total",
    reportComptele: "#completed",
    reportRemain: "#remaining",
    taskFilter: "#filter-select"
  };
  // getInput:
  const getUserInput = () => {
    let taskContent = document.querySelector(DOMString.taskInput).value;
    return taskContent;
  };

  const addTaskToUI = task => {
    // HTML code of tasks
    const html = processHTML(task.ID, task.status, task.description);
    // Insert the task to html
    document
      .querySelector(DOMString.appWrapper)
      .insertAdjacentHTML("afterbegin", html);
  };

  const clearInput = () => {
    document.querySelector(DOMString.taskInput).value = "";
  };

  const taskDoneUI = (status, cont, tick) => {
    const disableInput = tick.parentNode.children[1];
    const showDeleteIcon = tick.parentNode.parentNode.children[1];
    console.log(showDeleteIcon);
    if (status.value === "done") {
      cont.classList.remove("done");
      tick.classList.remove("text-red");
      status.value = "notDone";
      disableInput.removeAttribute("disabled", "disabled");
      showDeleteIcon.style.display = "none";
    } else {
      cont.classList.add("done");
      tick.classList.add("text-red");
      status.value = "done";
      disableInput.setAttribute("disabled", "disabled");
      showDeleteIcon.style.display = "inline-block";
    }
  };

  const delTaskInUI = task => {
    document.querySelector(DOMString.appWrapper).removeChild(task);
  };

  const renderReportUI = (total, completed, remain) => {
    document.querySelector(DOMString.reportTotal).value = total;
    document.querySelector(DOMString.reportComptele).value = completed;
    document.querySelector(DOMString.reportRemain).value = remain;
  };

  const processHTML = (id, stat, des) => {
    if (stat === "notDone") {
      return `<div class="task" id="${id}" data-status=${stat}><div class="task-wrapper"><i class="fas fa-check ticked-icon"></i><input value = "${des}" class="task-content"/></div><i class="fas fa-times delete-icon"></i></div>`;
    } else {
      return `<div class="task" id="${id}" data-status=${stat}><div class="task-wrapper"><i class="fas fa-check ticked-icon text-red"></i><input value ="${des}" class="task-content done"/></div><i class="fas fa-times delete-icon"></i></div>`;
    }
  };

  const removeAllTasksUI = () => {
    document.querySelector(DOMString.appWrapper).innerHTML = "";
  };

  const renderLocalStorage = store => {
    let html = processHTML(store.ID, store.status, store.description);
    // Insert to html
    document
      .querySelector(DOMString.appWrapper)
      .insertAdjacentHTML("afterbegin", html);
  };

  const renderFiltedTaskUI = TasksArr => {
    TasksArr.map(item => {
      const html = processHTML(item.ID, item.status, item.description);
      document
        .querySelector(DOMString.appWrapper)
        .insertAdjacentHTML("afterbegin", html);
    });
  };

  return {
    DOM: DOMString,
    getInput: getUserInput,
    addTaskUI: addTaskToUI,
    clearInputField: clearInput,
    taskDone: taskDoneUI,
    delTaskUI: delTaskInUI,
    renderReport: renderReportUI,
    removeAllTasks: removeAllTasksUI,
    renderLocalToUI: renderLocalStorage,
    renderFiltedTasks: renderFiltedTaskUI
  };
})();
const appCtrl = ((mod, UI) => {
  const setupEventListener = () => {
    // get DOM string
    const DOMs = UI.DOM;

    // Add task event
    document.querySelector(DOMs.addBtn).addEventListener("click", addTaskCtrl);
    document.addEventListener("keypress", e => {
      if (e.keyCode === 13) {
        addTaskCtrl();
        e.preventDefault();
      }
    });

    // Done task event
    let tickedIconList = document.querySelectorAll(DOMs.tickedIcons);
    Array.prototype.map.call(tickedIconList, item => {
      item.addEventListener("click", doneTaskCtrl);
    });

    // Del task event
    let delIconList = document.querySelectorAll(DOMs.delIcons);
    Array.prototype.map.call(delIconList, item => {
      item.addEventListener("click", delTaskCtrl);
    });

    // Update task content event
    let taskContentList = document.querySelectorAll(DOMs.taskContent);
    Array.prototype.map.call(taskContentList, item => {
      item.addEventListener("change", updateTaskCtrl);
      item.addEventListener("keypress", e => {
        e.keyCode === 13 ? updateTaskCtrl(e) : null;
      });
    });

    // Filter tasks evemt
    document
      .querySelector(DOMs.taskFilter)
      .addEventListener("change", filterTaskCtrl);
  };

  const addTaskCtrl = () => {
    // console.log("clicked");
    // 1. Get user input
    let inputDescription = UI.getInput();
    if (inputDescription.length > 0) {
      // 2. store input in model's data
      let curInput = mod.addTaskToModel(inputDescription);
      // 3. Show input to UI
      UI.addTaskUI(curInput);
      // 4. Clear input field
      UI.clearInputField();
      // 5. Setup Event to new task ticked-icon
      setupEventListener();
      // 6. Calculate & render new report
      reportCtrl();
    }
  };

  const doneTaskCtrl = e => {
    let taskID, taskStatus, content, ticked;
    // Get task ID
    taskID = e.target.parentNode.parentNode.id;
    // console.log(taskID);
    // Get task data-status value
    taskStatus = e.target.parentNode.parentNode.attributes[2];
    // Get task content
    content = e.target.parentNode.children[1];
    // Get ticked icon
    ticked = e.target;
    // Change status in UI & model
    UI.taskDone(taskStatus, content, ticked);
    mod.changeStatusInModel(taskID);
    // Calculate & render new report
    reportCtrl();
  };

  const delTaskCtrl = e => {
    // find the clicked del Icon parent
    let task = e.target.parentNode;
    console.log(task.id);
    // Del task in model and local storage
    model.delTaskInModel(task.id);
    // Del task in UI
    UI.delTaskUI(task);
    // console.log(task);
    // Calculate & render new report
    reportCtrl();
  };

  const updateTaskCtrl = event => {
    const content = event.target.value;
    const ElementIndex = event.target.parentNode.parentNode.id;
    console.log(event.target.classList);
    // Change task description in model
    mod.changeTaskDesInModel(ElementIndex, content);
  };

  const reportCtrl = () => {
    // Calculate report
    const report = mod.calReport();
    // render report to UI
    UI.renderReport(report.total, report.completed, report.remaining);
  };

  const filterTaskCtrl = e => {
    const curFilter = e.target.value;
    // remove all current task in UI
    UI.removeAllTasks();
    // Calculate all
    const filtedTasks = mod.filtedTaskArr();
    // Render to UI
    if (curFilter === "all") {
      renderLocalStorageCtrl();
    } else if (curFilter === "done") {
      UI.renderFiltedTasks(filtedTasks.doneArr);
    } else if (curFilter === "remain") {
      UI.renderFiltedTasks(filtedTasks.remainArr);
    }
  };

  const renderLocalStorageCtrl = () => {
    const local = JSON.parse(localStorage.getItem("DATA_TEMP"));
    if (local !== null) {
      local.map(item => {
        UI.renderLocalToUI(item);
      });
    }
  };

  return {
    init: () => {
      console.log("App started!");
      renderLocalStorageCtrl();
      setupEventListener();
      reportCtrl();
    }
  };
})(model, UICtrl);

window.onload = appCtrl.init();

// const dataGlobal = localStorage.getItem("DATA_TEMP") || [];

// const hi =
//   dataGlobal.length > 0 &&
//   dataGlobal.map((item, index) => {
//     return `<div class={task_${index}}>
//       <div>
//         <i class="fas fa-check ticked-icon"></i>
//         <input value=${item.description}class="task-content" />
//       </div>
//     </div>`;
//   });
