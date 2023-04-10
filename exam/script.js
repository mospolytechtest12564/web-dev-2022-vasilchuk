// 1. Использовать скидку для школьников и студентов. 
// При выборе чекбокса стоимость
// уменьшается на 15%.
// 5. Тематические сувениры для посетителей. 
// Стоимость увеличивается на 500 рублей для
// каждого посетителя
const api_key = 'c98d5a85-c25f-4448-8e8f-77274a507e35';

let urlRoute = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru");
urlRoute.pathname = '/api/routes';
urlRoute.searchParams.set('api_key', api_key);

let urlGid = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru");
urlGid.pathname = '/api/routes/{id-маршрута}/guides';
urlGid.searchParams.set('api_key', api_key);

let urlOrder = new URL("http://exam-2023-1-api.std-900.ist.mospolytech.ru");
urlOrder.pathname = '/api/orders';
urlOrder.searchParams.set('api_key', api_key);

//mainRoutes - маршруты от сервера (не меняются)
//routes - фильтруемый список маршрутов
let mainRoutes, routes; 

let currentPage = document.querySelector(".active").innerText;

let trRouteTemplate = document.getElementById("tr-template");
let trGidTemplate = document.getElementById("tr-gid-template");

//mainGids - гиды от сервера (не меняются)
//gids - фильтруемый список гидов
let mainGids, gids;

//сохранение выбранного маршрута и гида
let choiceRoute, choiceGid;
let choiceRouteId = 0, choiceGidId = 0;

function manageOrderBtn(status = true) {
    // включение/выключение кнопки
    let createOrderBtn = document.querySelector(".create-order-btn");
    if (status) {
        createOrderBtn.classList.remove("disabled");
        createOrderBtn.classList.remove("btn-secondary");
        createOrderBtn.classList.remove("text-light");
        createOrderBtn.classList.add("btn-warning");
    } else {
        createOrderBtn.classList.add("disabled");
        createOrderBtn.classList.add("btn-secondary");
        createOrderBtn.classList.add("text-light");
        createOrderBtn.classList.remove("btn-warning");
    }
}

async function choiceGidHandler(event) {
    let trGid = event.target.closest("tr");
    //если выбран тот же самый гид, то сброс выбора, отключение кнопки заявки
    if (choiceGidId == trGid.id) {
        trGid.classList.remove("table-success");
        choiceGidId = 0;
        manageOrderBtn(false);
        return;
    //если был выбор до этого
    } else if (choiceGidId != 0) {
        choiceGidElement = document.getElementById(choiceGidId);
        //если гид есть в блоке с гидами, то сбросить выделение
        if (choiceGidElement != null)
            choiceGidElement.classList.remove("table-success");
        //обновить выбор
        trGid.classList.add("table-success");
        choiceGidId = trGid.id;
    //если выбор впервые, то просто выбрать
    } else {
        choiceGidId = trGid.id;
        trGid.classList.add("table-success");
    }
    //включение кнопки заявки, тк выбран маршрут и гид
    manageOrderBtn(true);

    //url for choice guide
    let tempUrl = new URL('http://exam-2023-1-api.std-900.ist.mospolytech.ru');
    tempUrl.pathname = '/api/guides/' + choiceGidId;
    tempUrl.searchParams.set('api_key', api_key);
    let response = await fetch(tempUrl);
    choiceGid = await response.json();
}

function createNewGid(gid) {
    let trGid = trGidTemplate.content.firstElementChild.cloneNode(true);
    trGid.id = gid.id;
    let name = trGid.querySelector(".name");
    name.innerHTML = gid.name;
    let lang = trGid.querySelector(".lang");
    lang.innerHTML = gid.language;
    let exp = trGid.querySelector(".exp");
    exp.innerHTML = gid.workExperience;
    let price = trGid.querySelector(".price");
    price.innerHTML = gid.pricePerHour;
    trGid.querySelector("button").addEventListener("click", choiceGidHandler);

    return trGid;
}

function updateGidTable(makeSelectBool = true) {
    //Доступные гиды по маршруту ...
    document.querySelector("#gid-list > span").innerText = choiceRoute.name;

    let selectLang = document.querySelector(".search-lang");

    //если не сделан выбор, то обновить фильтрацию языков
    if (makeSelectBool) {
        selectLang.innerHTML = '';
        let optionLang = document.createElement('option');
        optionLang.innerHTML = 'Не выбрано';
        selectLang.append(optionLang);
    }
    //сброс гидов с сайта
    let bodyTable = document.querySelector('.gid-tbody');
    bodyTable.innerHTML = '';
    for (let i = 0; i < gids.length; i++) {
        //добавление на стр гидов
        let trGid = createNewGid(gids[i]);
        bodyTable.append(trGid);

        if (makeSelectBool) {
            //update select language
            let optionLang = document.createElement('option');
            optionLang.innerHTML = gids[i].language;
            if (!selectLang.innerText.includes(gids[i].language))
                selectLang.append(optionLang);
        }
    }
}

async function loadGid() {
    //сбросить гидов, если сброшен выбор маршрута
    if (choiceRouteId == 0) {
        mainGids = [];
        gids = [];
    } else {
        //загрузка выбранного маршрута
        urlGid.pathname = `/api/routes/${choiceRouteId}`;
        let response = await fetch(urlGid);
        choiceRoute = await response.json();

        //загрузка гидов по маршруту
        urlGid.pathname += "/guides";
        response = await fetch(urlGid);
        let gidList = await response.json();

        mainGids = gidList;
        gids = mainGids;
    }

    updateGidTable();
}

function choiceRouteHandler(event) {
    //обработчик выбора маршрута
    let trRoute = event.target.closest("tr");
    //если выбран тот же самый маршрут, то сбросить выбор
    if (choiceRouteId == trRoute.id) {
        trRoute.classList.remove("table-success");
        choiceRouteId = 0;
    //если маршрут был до этого выбран
    } else if (choiceRouteId != 0) {
        let choiceRouteElement = document.getElementById(choiceRouteId);
        //если выбранный маршрут на странице, то убрать выделение
        if (choiceRouteElement != null)
            choiceRouteElement.classList.remove("table-success");
        //выделить и сохранить новый маршрут
        trRoute.classList.add("table-success");
        choiceRouteId = trRoute.id;
    //если маршрут выбирается впервые, то просто выбрать
    } else {
        choiceRouteId = trRoute.id;
        trRoute.classList.add("table-success");
    }
    //в соотв с выбором загрузить гидов по маршруту
    choiceGid = {};
    choiceGidId = 0;
    loadGid();
    //выключить кнопку создания заявки
    manageOrderBtn(false);
}


function createNewTr(oneRoute) {
    //создание блока маршрута
    let trRoute = trRouteTemplate.content.firstElementChild.cloneNode(true);
    trRoute.id = oneRoute.id;
    let name = trRoute.querySelector(".name");
    name.innerHTML = oneRoute.name;
    let desc = trRoute.querySelector(".desc");
    desc.innerHTML = oneRoute.description;
    let mainObject = trRoute.querySelector(".main-object");
    mainObject.innerHTML = oneRoute.mainObject;
    let choiceBtn = trRoute.querySelector("button");
    choiceBtn.addEventListener("click", choiceRouteHandler);
    return trRoute;
}

//загрузка маршрутов
async function loadRoute() {
    let response = await fetch(urlRoute);
    let routeList = await response.json();
    mainRoutes = routeList;
    routes = mainRoutes;
}

//обновление таблицы маршрутов на опр страницу
function updateRouteTable(page) {
    let makeSelectBool = true;
    let selectObject = document.querySelector('.search-object');
    // выбор места сделан? Да - менять список мест не надо
    if (selectObject.value != 'Не выбрано') 
        makeSelectBool = false;

    let bodyTable = document.querySelector('.route-tbody');
    bodyTable.innerHTML = ''; //сборс таблицы маршрутов

    //определение индекса первого маршрута на page странице
    let start = (page - 1) * 10; 
    //если старт + 10 уходит за список, то выбирается конец списка
    let end = Math.min(routes.length, start + 10);
    //добавление марщрутов на сайт от start до end индекса
    for (let i = start; i < end; i++) {
        let trRoute = createNewTr(routes[i]);
        bodyTable.append(trRoute);
    }

    //обработка выпадающего списка по главным местам, если место не выбрано
    if (makeSelectBool) {
        let selectObject = document.querySelector(".search-object");
        selectObject.innerHTML = "<option>Не выбрано</option>";

        for (let i = 0; i < routes.length; i++) {
            let optionObject = document.createElement('option');
            optionObject.innerText = routes[i].mainObject;
            selectObject.append(optionObject);
        }
    }

    //выделить зелённым выбранный маршрут, если он есть
    if (document.getElementById(choiceRouteId) != null)
        document.getElementById(choiceRouteId).classList.add("table-success");

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
    let lastPage = (Math.ceil(routes.length / 10)).toString();

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

    //обновить маршруты с учётом новой страницы 
    updateRouteTable(currentPage);
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

function searchRouteHandler(event) {
    routes = mainRoutes;
    let searchName = document.querySelector('.search-name');
    let selectObject = document.querySelector('.search-object');

    //если есть выбор в полях фильтрации, то фильтрация по содержимому поля
    if (searchName.value != '')
        routes = routes.filter(route =>
            route.name.toLowerCase().includes(searchName.value.toLowerCase()));

    if (selectObject.value != 'Не выбрано')
        routes = routes.filter(route =>
            route.mainObject.includes(selectObject.value));

    //сброс на первую страницу
    makePagination('1');
}

function searchGidHandler(event) {
    let langGid = document.querySelector(".search-lang");
    let expFromGid = document.querySelector(".search-from");
    let expToGid = document.querySelector(".search-to");
    gids = mainGids;

    //если есть выбор в полях фильтрации, то фильтрация по содержимому поля
    if (langGid.value != 'Не выбрано')
        gids = gids.filter(gid => gid.language.includes(langGid.value));

    if (expFromGid.value != '')
        gids = gids.filter(gid => gid.workExperience >= expFromGid.value);

    if (expToGid.value != '')
        gids = gids.filter(gid => gid.workExperience <= expToGid.value);

    //обновить блок гидов по новому списку
    updateGidTable(false);
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
    // in duration: value = 'n час', value[0] = n
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
// ● date:
// множитель для будней равен 1, 
// для праздничных и выходных дней (сб, вс) – 1,5;
// time:
// с 9 до 12 часов, равна 400 рублей, 
// начинаются с 20 до 23 часов, равна 1000 рублей, для остальных – 0;
// ● persons:
// ○ от 1 до 5 человек – 0 рублей,
// ○ от 5 до 10 – 1000 рублей,
// ○  иначе (от 10 до 20) – 1500 рублей.

function manageSubmitBtn() {
    //если поля верны по валидации, то разблокировать кнопку, иначе - выключена
    let formOrder = document.querySelector(".new-order-form");
    let submitBtn = document.querySelector("button.create-new-order");
    if (formOrder.checkValidity())
        submitBtn.classList.remove("disabled");
    else
        submitBtn.classList.add("disabled");
}

function showNewOrderHandler(event) {
    //при открытии окна заявки
    //внесение в заявку информацию по маршруту и гиду
    event.target.querySelector(".guide-name").innerText = choiceGid.name;
    event.target.querySelector(".route-name").innerText = choiceRoute.name;
    event.target.querySelector("#guide-id").value = choiceGid.id;
    event.target.querySelector("#route-id").value = choiceRoute.id;
    //set min day for input:date
    //установка минимульго дня с учётом сегодняшней даты
    let dateInput = document.getElementById('date-excursion');
    let minDay = new Date;
    //преобразование в завтрашнюю дату
    minDay.setDate(minDay.getDate() + 1);
    //смена минимальной даты в атрибуте поля на minDay формата
    //console.log(minDay, minDay.toJSON(), minDay.toJSON().slice(0, 10));
    //Tue Jun 1 2023 12:24:00 GMT+0300 - изначальный формат Date
    //Date.toJSON() - '2023-01-01T09:24:00.298Z'
    //Date.toJSON().slice(0, 10) - '2023-01-01'
    dateInput.attributes.min.value = minDay.toJSON().slice(0, 10);

    //обновить цену, проверить кнопку
    manageSubmitBtn();
    updatePrice();
}

function inputsOrderHandler(event) {
    //при изменении в полях заявки проверить валидацию
    //обновиь цену, если ошибок в валидации нет
    let formOrder = event.target.closest(".new-order-form");
    if (event.target.tagName == 'INPUT' || event.target.tagName == 'SELECT') {
        if (formOrder.checkValidity())
            updatePrice();
        manageSubmitBtn();
    }

}

function alertOrder(response) {
    //ответ от сервера на создание заявки
    let sectionAlert = document.querySelector(".alerts");
    let alertTemplate = document.getElementById('alert-template');
    let divAlert = alertTemplate.content.firstElementChild.cloneNode(true);
    let textAlert = divAlert.querySelector(".alert-text");
    //если нет ошибок, то зелённый с успехом
    if (response.error == null) {
        divAlert.classList.add("alert-success");
        textAlert.innerText += "Заявка успешно создана!";
    //если ошибка, то выдать красный с текстом ошибки
    } else {
        divAlert.classList.add("alert-danger");
        textAlert.innerText += response.error;
    }
    sectionAlert.append(divAlert);
}

let parsResponse;


async function newOrderHandler(event) {
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

    //отправка заявки
    let response = await fetch(urlOrder, { method: 'POST', body: orderData });
    parsResponse = await response.json();

    //сброс формы
    modalWindow.querySelector('form').reset();
    //отобразить ответ от сервера
    alertOrder(parsResponse);
}


window.onload = async function () {
    await loadRoute();
    updateRouteTable(1);
    //назначение обработчика кнопок пагинации
    let paginationList = document.querySelector(".pagination");
    paginationList.addEventListener("click", paginationHandler);

    //назначение обработчика фильтрации маршрутов
    let searchName = document.querySelector(".search-name");
    let searchObject = document.querySelector(".search-object");
    searchName.addEventListener("input", searchRouteHandler);
    searchObject.addEventListener("change", searchRouteHandler);

    //назначение обработчика фильтрации гидов
    let searchLanguage = document.querySelector(".search-lang");
    let searchExpFrom = document.querySelector(".search-from");
    let searchExpTo = document.querySelector(".search-to");
    searchLanguage.addEventListener("change", searchGidHandler);
    searchExpFrom.addEventListener("input", searchGidHandler);
    searchExpTo.addEventListener("input", searchGidHandler);

    //обработчикиотображение, изменения окна заявки
    let modalWindow = document.getElementById("new-order");
    let orderInput = document.querySelector(".new-order-form");
    modalWindow.addEventListener("show.bs.modal", showNewOrderHandler);
    orderInput.addEventListener("change", inputsOrderHandler);

    //обработчик отправки заявки
    let createOrderBtn = document.querySelector("button.create-new-order");
    createOrderBtn.addEventListener("click", newOrderHandler);
};