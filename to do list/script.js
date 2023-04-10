

let createNewTask = document.querySelector(".create-new-task");
let idCounter = localStorage.getItem('idCounter') || 0; // со стороны сервера учитывается
let taskTemplate = document.querySelector("#task-template")
let listToDo = document.querySelector('#ToDo ul');
let listDone = document.querySelector('#Done ul');
let titles = {
    create: "Новая задача",
    edit: "Редактирование задачи",
    show: "Просмотр задачи",
}
let titelsBtn = {
    create: "Создать",
    edit: "Сохранить",
    show: "Ok",
}
let url = new URL('http://tasks-api.std-900.ist.mospolytech.ru/api/tasks?api_key=50d2199a-42dc-447d-81ed-d68a443b697e');

function urlModified(taskId = ''){
    if (taskId == '')
        url.pathname = '/api/tasks';
    else 
        url.pathname += `/${taskId}`;
}

// async function fetchTask(){
//     // fetch(url)
//     // .then((Response) => Response.json())
//     // .then((taskList) =>{
//     //     console.log(taskList.tasks);
//     // });
//     //console.log(taskList);
//     //urlModified('100');

//     let response = await fetch(url);
//     let tasksList = await response.json();

//     console.log(tasksList.tasks);

//     urlModified();
// }

async function createTask(name, desc, status) {
    // let task = {
    //     name: name,
    //     desc: desc,
    //     status: status,
    //     id: idCounter++,
    // }

    let taskData = new FormData();
    taskData.append('name', name);
    taskData.append('desc', desc);
    taskData.append('status', status);

    let response = await fetch(url, {method: 'POST', body: taskData});
    let taskFromServer = await response.json();
    // localStorage.setItem(`task-${task['id']}`, JSON.stringify(task)); //===========================================
    // localStorage.setItem(`idCounter`, idCounter); //===========================================
    return taskFromServer;
    // console.log("taskFromServer", taskFromServer);
    // callback(taskFromServer);
}

// task - объект
function createElemTask(task) {
    let taskLi = taskTemplate.content.firstElementChild.cloneNode(true);
    taskLi.id = task["id"];
    let name = taskLi.querySelector(".task-name");
    name.innerHTML = task["name"];
    return taskLi;
}

function updateCounters(event){
    let card = event.target.closest('.card');
    let span = card.querySelector('.counter-tasks');
    let count = event.target.children.length;
    span.innerHTML = count;
}

async function loadTasks() {
    let response = await fetch(url);
    let tasksList = await response.json();

    for (let i = 0; i < tasksList.tasks.length; i++) {
        let taskValue = tasksList.tasks[i];
        let task = createElemTask(taskValue);
        let list = taskValue['status'] == 'to-do' ? listToDo : listDone;
        list.append(task);
    }
}

async function createNewTaskHandler(event) {
    let modalWindow = event.target.closest(".modal");
    let formInputs = modalWindow.querySelector("form").elements;
    let name = formInputs["task-name"].value;
    let desc = formInputs["task-desc"].value;
    let status = formInputs["task-status"].value;
    let action = formInputs["action"].value;

    console.log(action, "createNewTaskHandler");

    if(action == "create"){
        let task = await createTask(name, desc, status);
        let taskLi = createElemTask(task);
        let list = status == 'to-do' ? listToDo : listDone;
        list.append(taskLi);
    }
    else if (action == "edit"){
        let taskId = formInputs["task-id"].value;
        urlModified(taskId);
        // let task = localStorage.getItem(`task-${taskId}`);//===========================================
        // task = JSON.parse(task);

        let taskData = new FormData();
        taskData.append('name', name);
        taskData.append('desc', desc);
        // task.name = name;
        // task.desc = desc;
        // localStorage.setItem(`task-${taskId}`, JSON.stringify(task));//===========================================
        let response = await fetch(url, {method: 'PUT', body: taskData});
        let task = await response.json();

        let taskElem = document.getElementById(taskId);
        taskElem.querySelector(".task-name").innerHTML = name;
        formInputs["task-status"].closest(".row").classList.remove("d-none");
        urlModified();
    }
    modalWindow.querySelector('form').reset();
}

async function delTaskHandler(event) {
    let modalWindow = event.target;
    let taskId = event.relatedTarget.closest(".task").id;
    urlModified(taskId);
    let response = await fetch(url);
    let task = await response.json();
    urlModified();
    // let task = localStorage.getItem(`task-${taskId}`);//========================================
    // task = JSON.parse(task);
    let span = modalWindow.querySelector(".name-task");
    span.innerHTML = task.name;
    let form = modalWindow.querySelector("form");
    form.elements["task-id"].value = taskId;
    
}

async function delHandler(event) {
    let form = event.target.closest(".modal").querySelector("form");
    let taskId = form.elements["task-id"].value;
    urlModified(taskId);
    let response = await fetch(url, {method: 'DELETE'});
    // localStorage.removeItem(`task-${taskId}`);//===========================================
    let task = document.getElementById(taskId);
    task.remove();
    urlModified();
}

function addArrowHandler(event){
    let arrow_btn = event.target.childNodes;
    for(let i = 0; i < arrow_btn.length; i++) {
        arrow_btn[i].addEventListener("click", arrowHandler);
    }
    
}

async function arrowHandler(event) {
    if(event.target.classList.contains("bi-arrow-left") || event.target.classList.contains("bi-arrow-right")) {
        let taskId = event.target.closest(".task").id;
        
        urlModified(taskId);
        let response = await fetch(url);
        let task = await response.json();
        
        // let task = localStorage.getItem(`task-${taskId}`);//====================================================
        // task = JSON.parse(task);
        if(task.status == 'to-do') {
            task.status = 'done';
        } else {
            task.status = 'to-do';
        }
        let switch_task = document.getElementById(taskId);
        let list = task['status'] == 'to-do' ? listToDo : listDone;
        list.append(switch_task);
        let taskData = new FormData();
        taskData.append('status', task.status);
        let changeStatus = await fetch(url, {method: 'PUT', body: taskData});
        urlModified();
    }
}

async function actionModalHandler(event){
    let action = event.relatedTarget.dataset.action;

    console.log(action, "actionModalHandler");
    
    let form = event.target.querySelector("form");
    form.elements["action"].value = action;
    event.target.querySelector(".modal-title").innerHTML = titles[action];
    event.target.querySelector(".create-new-task").innerHTML = titelsBtn[action];

    let viewInput = form.elements["task-desc"].classList.contains("form-control-plaintext");
    if(viewInput && action != "show"){
        form.elements["task-desc"].classList.remove("form-control-plaintext");
        form.elements["task-name"].classList.remove("form-control-plaintext");
        form.elements["task-desc"].classList.add("form-control");
        form.elements["task-name"].classList.add("form-control");
    }
    
    if(action == "edit" || action == "show"){
        let taskId = event.relatedTarget.closest(".task").id;
        form.elements["task-id"].value = taskId;
        urlModified(taskId);
        let response = await fetch(url);
        let task = await response.json();
        // let task = localStorage.getItem(`task-${taskId}`);//===========================================
        // task = JSON.parse(task);
        form.elements["task-name"].value = task.name;
        form.elements["task-desc"].value = task.desc;
        form.elements["task-status"].closest(".row").classList.add("d-none");
        if (action == "show" && !viewInput){
            form.elements["task-desc"].classList.add("form-control-plaintext");
            form.elements["task-name"].classList.add("form-control-plaintext");
            form.elements["task-desc"].classList.remove("form-control");
            form.elements["task-name"].classList.remove("form-control");
        }
        urlModified();
    }
    else if(action == "create"){
        form.elements["task-status"].closest(".row").classList.remove("d-none");
        form.reset();
    }
}

window.onload = function () {
    loadTasks();

    createNewTask.addEventListener("click", createNewTaskHandler);

    listToDo.addEventListener("DOMSubtreeModified", updateCounters);
    listDone.addEventListener("DOMSubtreeModified", updateCounters);

    let modalDel = document.getElementById("del-task");
    modalDel.addEventListener("show.bs.modal", delTaskHandler);
    let delBtn = document.getElementsByClassName("del-task-btn")[0];
    delBtn.addEventListener("click", delHandler);

    let actionModal = document.getElementById("new-task");
    actionModal.addEventListener("show.bs.modal", actionModalHandler);

    listToDo.addEventListener("DOMSubtreeModified", addArrowHandler);
    listDone.addEventListener("DOMSubtreeModified", addArrowHandler);
}