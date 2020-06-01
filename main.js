"use strict";

window.addEventListener("load", init);

let domTickets = [];
let lastQueue = [];
let currentQueue = [];

let beersArray = [];
let allBeers = [];
let displayedBeers = [];
let beersOnTap = [];
const Beer = {
    image: "",
    name: "",
    type: "",
    price: "",
};

const endpoint = "https://fireorange-foobar.herokuapp.com";

function init() {
    start();
    domTickets = document.querySelectorAll(".queue-entry");
    getQueueSpacing();
    isQueueMoveDone();
    getInitialQueue();
    prepareQueue();
}

function getQueueSpacing() {
    const queuePos1 = document
        .querySelector("[data-position=one]")
        .getBoundingClientRect().x;
    const queuePos2 = document
        .querySelector("[data-position=two]")
        .getBoundingClientRect().x;
    const queueOffset = queuePos1 - queuePos2;
    document
        .getElementById("container")
        .style.setProperty("--queue-offset", queueOffset);
}

function isQueueMoveDone() {
    document
        .querySelector("[data-position=one]")
        .addEventListener("animationend", removeMoveQueueClass);

    document
        .querySelector("[data-position=one]")
        .addEventListener("animationend", moveQueue);

    function removeMoveQueueClass() {
        domTickets.forEach((entry) => entry.classList.remove("move-queue"));
    }
}

async function getInitialQueue() {
    const data = await fetch(endpoint);
    const response = await data.json();
    const onTap = Object.values(response.taps);

    const beersData = await fetch("beers.json");
    const beersResponse = await beersData.json();

    beersArray = Object.entries(beersResponse);

    let taps = [];
    onTap.forEach((oneTap) => {
        taps.push(oneTap.beer);
    });
    console.log("taps", taps);
    console.log("beersArr", beersArray);

    beersOnTap = beersArray.filter((beer) => taps.includes(beer[1].name));
    currentQueue = [...response.queue];
    prepareObjects(beersOnTap);
    prepareQueue();
    startSystem();
}

function prepareQueue() {
    const queue = [...domTickets];
    lastQueue = [...currentQueue];

    fillOutQueueArray();

    domTickets.forEach((ticket) => ticket.classList.add("hide-queue"));

    for (let i = 0; i < currentQueue.length; i++) {
        const id =
            currentQueue[i].id > 100 ?
            currentQueue[i].id.toString().substring(1) :
            currentQueue[i].id;

        if (id !== "hideme") {
            queue[i].classList.remove("hide-queue");
        } else {
            queue[i].classList.add("hide-queue");
        }

        if (
            queue[i].querySelector("p").textContent === "hideme" &&
            id !== "hideme"
        ) {
            queue[i].classList.add("show-queue");
            setTimeout(() => queue[i].classList.remove("show-queue"), 1000);
        }

        queue[i].querySelector("p").textContent = id;

        // if (queue[i].querySelector("p").textContent === "hideme") {
        //   queue[i].classList.add("hide-queue");
        // }
    }
}

function fillOutQueueArray() {
    if (currentQueue.length < 10) {
        for (let i = currentQueue.length; i < 9; i++) {
            currentQueue.push({
                id: "hideme"
            });
        }
    }
    currentQueue.length = 9;
}

function startSystem() {
    setInterval(fetchQueue, 3000);
    fetchMenago();
}

async function fetchQueue() {
    const data = await fetch(endpoint);
    const response = await data.json();
    checkQueueProgress(response.queue);
}

function checkQueueProgress(queue) {
    currentQueue = [...queue];
    //console.log("last", lastQueue);
    //console.log("current", currentQueue);
    if (lastQueue.length < currentQueue.length) {
        //console.log("adding new entries");
        prepareQueue();
    }
    if (!currentQueue[0] && !lastQueue[0]) {
        //console.log("empty arrays and nothing new");
    } else if (!currentQueue[0] && lastQueue[0]) {
        //console.log("Queue emptied out");
        setIterations(lastQueue.length);
        lastQueue = [...currentQueue];
        updateQueue();
    } else if (!lastQueue[0] && currentQueue[0]) {
        //console.log("new entry + old queue empty ");
        lastQueue = [...currentQueue];

        updateQueue();
    } else if (lastQueue[0].id !== currentQueue[0].id) {
        if (lastQueue.length < 2) {} else if (lastQueue[1].id === currentQueue[0].id) {
            setIterations(1);
        } else if (lastQueue[2].id === currentQueue[0].id) {
            setIterations(2);
        }
        lastQueue = [...currentQueue];

        console.log("new entry");
        updateQueue();
    } else if (lastQueue[0].id === currentQueue[0].id) {
        //console.log("no change");
    } else {
        lastQueue = [...currentQueue];

        updateQueue();
    }
}

function updateQueue() {
    fillOutQueueArray();
    domTickets.forEach((entry) => entry.classList.add("move-queue"));
}

function setIterations(iterations) {
    document
        .querySelector("#container")
        .style.setProperty("--iterations", iterations);
}

function moveQueue() {
    for (let i = 0; i < 9; i++) {
        const thisTicket = document.getElementById(`ticket${1 + i}`);
        changeTicketId(thisTicket, i);
        showActiveTickets(thisTicket);
    }
}

function changeTicketId(thisTicket, i) {
    const id =
        currentQueue[i].id > 100 ?
        currentQueue[i].id.toString().substring(1) :
        currentQueue[i].id;
    //console.log(id);
    thisTicket.querySelector("p").textContent = id;
}

function showActiveTickets() {
    domTickets.forEach((ticket) => ticket.classList.add("hide-queue"));
    setTimeout(() =>
        domTickets.forEach((ticket) => {
            if (ticket.querySelector("p").textContent !== "hideme") {
                ticket.classList.remove("hide-queue");
            }
        })
    );
}

// KERRTU AND MICHAL CODE STARTS HERE

function start() {
    //console.log("ready");

    loadJSON();
}

async function loadJSON() {
    //   const response = await fetch("beers.json");
    //   const jsonData = await response.json();
    //   console.log(jsonData);
    //   beersArray = Object.entries(response);
    // when loaded, prepare data objects
}

function prepareObjects(jsonData) {
    allBeers = jsonData.map(prepareObject);
    //console.log("allbeer", allBeers);
    // TODO: This might not be the function we want to call first
    displayList(allBeers);
}

function prepareObject(jsonObject) {
    //console.log(jsonObject);
    const beer = Object.create(Beer);
    //beer.image = jsonObject.image;
    beer.name = jsonObject[0].name;
    beer.type = jsonObject[0].type;
    beer.alc = jsonObject[0].alc;
    beer.price = jsonObject[0].price;

    let image = "images/beers/" + jsonObject.image + ".png";
    beer.image = image;

    return beer;
}

function displayList(beers) {
    //console.log("beers", beers);
    // clear the list
    document.querySelector("#list").innerHTML = "";
    // build a new list
    beers.forEach(displayBeer);
}

function displayBeer(beer) {
    //console.log("beer", beer);

    // create clone
    let clone = document.querySelector("#beer-template").content.cloneNode(true);
    // set clone data
    clone.querySelector("#beer > img").src = beer.image;
    clone.querySelector("[data-field=name]").textContent = beer.name;
    clone.querySelector("[data-field=type]").textContent = beer.type;
    clone.querySelector("[data-field=alc]").textContent = beer.alc;
    clone.querySelector("[data-field=price]").textContent = beer.price;
    // append clone to list
    document.querySelector("#list").appendChild(clone);
}

function showBeer(beer) {
    const template = document.querySelector("#beer").content;
    const clone = template.cloneNode(true);
}


///THE MANAGER VIEW///

//Setting up the fetching//
async function fetchMenago() {
    const data = await fetch(endpoint);
    const response = await data.json();
    //console.log(response);

    console.log(`It is ${response.bar.closingTime} and we have ${response.bartenders.length} bartenders: ${response.bartenders[0].name}`);
    prepareManager(response);
}

function prepareManager(menago) {
    console.log("menago", menago);
    var closedBar = menago.bar.closingTime;
    var today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var whatNow = closedBar - time;
    document.querySelector("body > main > div.time.small-screen > h1.tillclosing").textContent = whatNow;

    //table bartenders//
    buildTable(menago.bartenders);

    //stock
    getStorage(menago.storage);

    //ontap
    getTheTap(menago.taps);
    //best_setlling
}

function buildTable(data) {
    //console.log(data);
    var table = document.getElementById('myTable');

    for (var i = 0; i < data.length; i++) {
        var row = `<tr>
        <td>${data[i].name}</td>
        <td>${data[i].status}</td>
        </tr>`

        table.innerHTML += row
    }
}

function getStorage(data) {
    console.log(data);
    var stock = document.getElementById('STOCK');

    if (stock.name !== "El Hefe") {
        stock.image = "elhefe"
    } else if (stock.name !== "Fairy Tale Ale") {
        stock.image = "bigdaddy"
    } else if (stock.name !== "GitHop") {
        stock.image = "githop"
    } else if (stock.name !== "Hollaback Lager") {
        stock.image = "hollaback"
    } else if (stock.name !== "Hoppily Ever After") {
        stock.image = "hoppilyeverafter"
    } else if (stock.name !== "Mowintime") {
        stock.image = "mowingtime"
    } else if (stock.name !== "Row 26") {
        stock.image = "row26"
    } else if (stock.name !== "Ruined Childhood") {
        stock.image = "ruinedchildhood"
    } else if (stock.name !== "Sleighride") {
        stock.image = "sleighride"
    } else if (stock.name !== "Steampunk") {
        stock.image = "steampunk"
    }


    for (var i = 0; i < data.length; i++) {
        var row = `'<td>images/beers/${stock.image}.png" alt="Beer Label" class="label", ${data[i].name}, ${data[i].amount}</td>`

        stock.innerHTML += row
    }
}

function getTheTap(data) {
    console.log(data);
    var table = document.getElementById('myTaps');
    //let image = "images/beers/" + + ".png";

    if (data.beer = "El Hefe") {
        data.image = "elhefe"
    } else if (data.beer = "Fairy Tale Ale") {
        data.image = "bigdaddy"
    } else if (data.beer = "GitHop") {
        data.image = "githop"
    } else if (data.beer = "Hollaback Lager") {
        data.image = "hollaback"
    } else if (data.beer = "Hoppily Ever After") {
        data.image = "hoppilyeverafter"
    } else if (data.beer = "Mowintime") {
        data.image = "mowingtime"
    } else if (data.beer = "Row 26") {
        data.image = "row26"
    } else if (data.beer = "Ruined Childhood") {
        data.image = "ruinedchildhood"
    } else if (data.beer = "Sleighride") {
        data.image = "sleighride"
    } else //(data.beer = "Steampunk") {
    {
        data.image = "steampunk"
    }

    for (var i = 0; i < data.length; i++) {
        var row = `<tr>
        <td><img src="images/beers/${data.image}.png" alt="Beer Label" class="label" /></td>
        <td>${data[i].beer}</td>
        <td>${data[i].level} out of ${data[i].capacity}</td>
        </tr>`

        table.innerHTML += row
    }
}