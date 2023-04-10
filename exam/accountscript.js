
const api_key = 'c98d5a85-c25f-4448-8e8f-77274a507e35';

let orderUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru');
orderUrl.pathname = '/api/orders';
orderUrl.searchParams.set('api_key', api_key);
let routeUrl = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru");
routeUrl.pathname = '/api/routes';
routeUrl.searchParams.set('api_key', api_key);
let gidUrl = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru");
gidUrl.pathname = '/api/guides';
gidUrl.searchParams.set('api_key', api_key);

let mainOrders, mainRoutes;
let choiceGid, choiceOrder, choiceRoute;
let choiceGidId = 0, choiceRouteId = 0, choiceOrderId = 0;
let currentPage = document.querySelector(".active").innerText;
let trTemplate = document.getElementById('order-template');

async function loadRoute() {
    let responseFromServer = await fetch(routeUrl);
    mainRoutes = await responseFromServer.json();
}

async function loadOrder() {
    let responseFromServer = await fetch(orderUrl);
    mainOrders = await responseFromServer.json();
}

async function loadChoiseGid() {
    gidUrl.pathname = '/api/guides/' + choiceGidId;
    let responseFromServer = await fetch(gidUrl);
    choiceGid = await responseFromServer.json();
}

function urlModified(addIdBool = false) {
    //смена url на id заявки для удаления, или на все заявки для show, edit
    if (addIdBool)
        orderUrl.pathname += '/' + choiceOrderId;
    else orderUrl.pathname = '/api/orders';
}

async function isThisDayOff(day) {
    //запрос на стороний API с датой, который возвращает выходной ли день
    //выходной - 1, рабочий - 0
    let urlDay = new URL('https://isdayoff.ru/');
    urlDay.pathname += day;
    let response = await fetch(urlDay);
    let isdayoff = await response.json();
    return isdayoff; // 1 - day off
}

async function updatePrice() {
    //обновление цены в заявке
    let spanPrice = document.querySelector('.total-price');

    let date = document.getElementById('date-excursion').value;
    let time = document.getElementById('time-excursion').value;
    let duration = document.getElementById('duration-excursion').value[0]; 
    let persons = document.getElementById('persons-excursion').value;
    //если опции выбраны, то сразу перевод в значение для подсчёта цены
    let optionFirst = document.getElementById('option-1').checked ? 0.85 : 1;
    let optionSecond = document.getElementById('option-2').checked ? 500 : 0;

    date = await isThisDayOff(date) == 1 ? 1.5 : 1;
    time = time <= '12:00' ? 400 :
        time >= '20:00' ? 1000 : 0;
    duration = Number(duration);
    optionSecond *= persons;
    persons = persons < 5 ? 0 :
        persons < 10 ? 1000 : 1500;

    // console.log(duration, date, time, optionSecond, persons, optionFirst);

    let price = (choiceGid.pricePerHour * duration * date 
        + time + optionSecond + persons) * optionFirst;
    //изменение цены на подсчитанную стоимость с округлением
    spanPrice.innerText = Math.round(price);
}

function manageSubmitBtn() {
    //если поля верны по валидации, то разблокировать кнопку, иначе - выключена
    let formOrder = document.querySelector(".new-order-form");
    let submitBtn = document.querySelector("button.create-new-order");
    if (formOrder.checkValidity())
        submitBtn.classList.remove("disabled");
    else
        submitBtn.classList.add("disabled");
}

function showOrderHandler(action) {
    //при открытии окна заявки
    //внесение в заявку информацию по маршруту и гиду

    //заполнение окна заявки
    let modalWindow = document.querySelector("#new-order");
    modalWindow.querySelector(".guide-name").innerText = choiceGid.name;
    modalWindow.querySelector(".route-name").innerText = choiceRoute.name;
    modalWindow.querySelector("#guide-id").value = choiceGid.id;
    modalWindow.querySelector("#route-id").value = choiceRoute.id;
    manageSubmitBtn();

    let dateInput = document.getElementById('date-excursion');
    let timeInput = document.getElementById('time-excursion');
    let durationInput = document.getElementById('duration-excursion');
    let personsInput = document.getElementById('persons-excursion');
    let optionFirstInput = document.getElementById('option-1');
    let optionSecondInput = document.getElementById('option-2');
    let priceInput = document.querySelector('.total-price');

    
    //смена минимальной даты в атрибуте поля на minDay формата
    let minDay = new Date;
    //преобразование в завтрашнюю дату
    minDay.setDate(minDay.getDate() + 1);
    //Tue Jun 1 2023 12:24:00 GMT+0300 - изначальный формат Date
    //Date.toJSON() - '2023-01-01T09:24:00.298Z'
    //Date.toJSON().slice(0, 10) - '2023-01-01'
    dateInput.attributes.min.value = minDay.toJSON().slice(0, 10);

    let duration;
    if (choiceOrder.duration == 1)
        duration = choiceOrder.duration + ' час';
    else duration = choiceOrder.duration + ' часа';

    //заполение формы заявки в соотв с выбранной заявкой
    dateInput.value = choiceOrder.date;
    timeInput.value = choiceOrder.time;
    durationInput.value = duration;
    personsInput.value = choiceOrder.persons;
    optionFirstInput.checked = choiceOrder.optionFirst;
    optionSecondInput.checked = choiceOrder.optionSecond;
    priceInput.innerText = choiceOrder.price;
    // console.log(action);

    //если показать, то выключаем поля
    if (action == 'show') {
        dateInput.classList.remove('form-control');
        timeInput.classList.remove('form-control');
        personsInput.classList.remove('form-control');
        dateInput.classList.add('form-control-plaintext');
        timeInput.classList.add('form-control-plaintext');
        personsInput.classList.add('form-control-plaintext');

        dateInput.disabled = true;
        timeInput.disabled = true;
        durationInput.disabled = true;
        personsInput.disabled = true;
        optionFirstInput.disabled = true;
        optionSecondInput.disabled = true;
    //если редактирование, то включаем
    } else if (action == 'edit') {
        dateInput.classList.remove('form-control-plaintext');
        timeInput.classList.remove('form-control-plaintext');
        personsInput.classList.remove('form-control-plaintext');
        dateInput.classList.add('form-control');
        timeInput.classList.add('form-control');
        personsInput.classList.add('form-control');

        dateInput.disabled = false;
        timeInput.disabled = false;
        durationInput.disabled = false;
        personsInput.disabled = false;
        optionFirstInput.disabled = false;
        optionSecondInput.disabled = false;
    }

    //подсчёт цены
    updatePrice();
}

async function choiceOrderHandler(event) {
    //если нажата не иконка, то выход
    if (event.target.tagName != 'I')
        return;
    //сохранить id выбранного маршрута
    choiceOrderId = event.target.closest("tr").id;
    //если удалить, то выход, так как требуется только id заявки
    if (event.target.dataset.action == 'delete')
        return;

    //поиск информации по заявки, соотв ей маршрут, гид
    choiceOrder = mainOrders.find(order => order.id == choiceOrderId);
    choiceGidId = choiceOrder.guide_id;
    choiceRouteId = choiceOrder.route_id;
    choiceRoute = mainRoutes.find(route => route.id == choiceRouteId);
    await loadChoiseGid();

    //подгрузить необходимое окно заявки
    showOrderHandler(event.target.dataset.action);
}

function createNewTr(oneOrder, n) {
    //создание блока заявки для вставки в таблицу
    let trOrder = trTemplate.content.firstElementChild.cloneNode(true);
    trOrder.id = oneOrder.id;
    let number = trOrder.querySelector('.number');
    number.innerHTML = n + 1; //oneOrder.id
    let oneRoute = mainRoutes.filter(route => route.id == oneOrder.route_id);
    let name = trOrder.querySelector(".name");
    name.innerHTML = oneRoute[0].name;
    let date = trOrder.querySelector(".date");
    let splitDate = oneOrder.date.split('-'); // from YYYY-MM-DD to DD.MM.YYYY
    splitDate = splitDate.reverse();
    date.innerHTML = splitDate.join('.');
    let price = trOrder.querySelector(".price");
    price.innerHTML = oneOrder.price;
    let buttonsI = trOrder.querySelector(".buttons-i");
    buttonsI.addEventListener("click", choiceOrderHandler);

    return trOrder;
}

function updateOrderTable(page = 1) {
    //обновление таблицы с заявками
    page = currentPage;
    let bodyTable = document.querySelector('.order-tbody');
    bodyTable.innerHTML = '';

    let start = (page - 1) * 5;
    let end = Math.min(mainOrders.length, start + 5);
    for (let i = start; i < end; i++) {
        let trOrder = createNewTr(mainOrders[i], i);
        bodyTable.append(trOrder);
    }
}

function makePagination(openPage = '1') {
    // у кнопки пагинации меняется только содержимое с учётом текущей страницы
    // если страница до середины (1-3) или последние 3 (n-3, n), то сдвига нет
    // иначе сдвиг на 1, при этом выбранная кнопка по середине
    // на какую стр переключать определяется содержимым кнопки
    // если страниц меньше 5, то лишние кнопки выключены

    let activeBtn = document.querySelector(".active"); //выбранная страница
    //кнопка в начало
    let startBtn = document.querySelector(".to-start").children[0];
    //в конец
    let endBtn = document.querySelector(".to-end").children[0];
    //кнопки пагинации
    let paginationBtns = document.querySelectorAll(".page-link");

    //расчёт последней страницы списка маршрутов
    let lastPage = (Math.ceil(mainOrders.length / 5)).toString();

    let start = Math.max(Number(openPage) - 2, 1);
    let end = Math.min(start + 4, Number(lastPage)); //Number(openPage) + 2
    let newActive = openPage;

    //фикс бага неправильного отображения номеров страниц на посл стр
    if (end == lastPage && lastPage > 4)
        start = Number(lastPage) - 4;

    //обработка кнопок в начало, в конец
    if (openPage == 'В начало') {
        start = 1;
        newActive = '1';
        end = lastPage > 4 ? 5 : lastPage;
    }
    if (openPage == 'В конец') {
        end = Number(lastPage);
        newActive = lastPage;
        start = lastPage > 4 ? Number(lastPage) - 4 : 1;
    }

    //Если на первой/последней странице, то В начало/В конец выключено
    startBtn.classList.remove("disabled");
    endBtn.classList.remove("disabled");
    if (newActive == '1') {
        startBtn.classList.add("disabled");
    }
    if (newActive == lastPage) {
        endBtn.classList.add("disabled");
    }

    //смена чисел внутри кнопок
    for (let i = start, j = 1; i <= end; i++, j++) {
        if (i == newActive) {
            activeBtn.classList.remove("active");
            paginationBtns[j].classList.add("active");
        }
        paginationBtns[j].innerText = i.toString();
        paginationBtns[j].classList.remove("disabled");
    }
    //выключение лишних кнопок, включение выключенных
    if (end < 5)
        for (let i = end + 1; i <= 5; i++)
            paginationBtns[i].classList.add("disabled");
    else
        for (let i = 1; i <= 5; i++)
            paginationBtns[i].classList.remove("disabled");

    currentPage = newActive;

    //обновить заявки с учётом новой страницы
    updateOrderTable();
}

function paginationHandler(event) {
    //если нажата не та область или кнопка выключена, то выход с ф-ции
    if (event.target.tagName == 'UL') return;
    else if (event.target.tagName == 'LI') {
        if (event.target.children[0].classList.contains("disabled"))
            return;
    } else if (event.target.classList.contains("disabled")) return;

    //обработать пагинацию по выбранной кнопке
    makePagination(event.target.innerText);
}

function inputsOrderHandler(event) {
    //при измении данных в окне заявки проверить корректность данных
    let formOrder = event.target.closest(".new-order-form");
    if (event.target.tagName == 'INPUT' || event.target.tagName == 'SELECT') {
        if (formOrder.checkValidity())
            updatePrice();
        manageSubmitBtn();
    }
}

function alertOrder(response, action) {
    //ответ от сервера на изменение заявки
    let sectionAlert = document.querySelector(".alerts");
    let alertTemplate = document.getElementById('alert-template');
    let divAlert = alertTemplate.content.firstElementChild.cloneNode(true);
    let textAlert = divAlert.querySelector(".alert-text");
    let text;
    //если нет ошибок, то зелённый с успехом
    if (action == 'edit')
        text = "Заявка успешно изменена";
    else if (action == 'delete')
        text = "Заявка успешно удалена";

    if (response.error == null) {
        divAlert.classList.add("alert-success");
        textAlert.innerText += text;
    //если ошибка, то выдать красный с текстом ошибки        
    } else {
        divAlert.classList.add("alert-danger");
        textAlert.innerText += response.error;
    }

    sectionAlert.append(divAlert);
}

let parsResponse;

async function newOrderHandler(event) {
    personsExcursion = document.getElementById('persons-excursion');
    //если поля выключены, то режим отображения, иначе редактирования
    let action = personsExcursion.classList.contains('form-control-plaintext') 
        ? 'show' : 'edit';
    //если отображение, то отправлять ничего не надо
    if (action == 'show')
        return;
    //сбор данных с окна заявки
    let modalWindow = event.target.closest(".modal");
    let formInputs = modalWindow.querySelector("form").elements;
    let route_id = formInputs["route_id"].value;
    let guide_id = formInputs["guide_id"].value;
    let date = formInputs["date"].value;
    let time = formInputs["time"].value;
    let duration = formInputs["duration"].value[0];
    let persons = formInputs["persons"].value;
    let optionFirst = formInputs["optionFirst"].checked ? 1 : 0;
    let optionSecond = formInputs["optionSecond"].checked ? 1 : 0;
    let price = document.querySelector('.total-price').innerText;

    //создание формы содержимого заявки для POST на API
    let orderData = new FormData();
    orderData.append('route_id', route_id);
    orderData.append('guide_id', guide_id);
    orderData.append('date', date);
    orderData.append('time', time);
    orderData.append('duration', Number(duration));
    orderData.append('persons', persons);
    orderData.append('optionFirst', optionFirst);
    orderData.append('optionSecond', optionSecond);
    orderData.append('price', price);

    //добавления в URL order'a id заявки
    urlModified(true);
    let response = await fetch(orderUrl, { method: 'PUT', body: orderData });
    parsResponse = await response.json();
    urlModified();

    //сброс формы, обновление данных, показать ответ сервера
    modalWindow.querySelector('form').reset();
    await loadOrder();
    updateOrderTable();
    alertOrder(parsResponse, 'edit');
}

async function delHandler(event) {
    //удаление заявки с сервера
    urlModified(true);
    let responseFromServer = await fetch(orderUrl, { method: 'DELETE' });
    let delId = await responseFromServer.json();
    // console.log(delId);
    urlModified();

    await loadOrder();
    updateOrderTable();
    alertOrder(delId, 'delete');
}

window.onload = async function () {
    //загрузка данных
    await loadRoute();
    await loadOrder();
    makePagination(1);
    //назначение обработчика пагинации
    let paginationList = document.querySelector(".pagination");
    paginationList.addEventListener("click", paginationHandler);

    //обработчик для формы окна с заявкой
    let orderInput = document.querySelector(".new-order-form");
    orderInput.addEventListener("change", inputsOrderHandler);

    //обработчки удаление заявки
    let delBtn = document.getElementsByClassName("del-order-btn")[0];
    delBtn.addEventListener("click", delHandler);

    //обработчик отправки заявки на сервер
    let createOrderBtn = document.querySelector("button.create-new-order");
    createOrderBtn.addEventListener("click", newOrderHandler);
};