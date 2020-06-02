"use strict";

window.addEventListener("load", init);

let domTickets = [];
let lastQueue = [];
let currentQueue = [];

let nowServing = [];
let currentlyNowServing = [];
let bartenderOneServing = [{ id: "empty" }, { id: "empty" }];
let bartenderTwoServing = [{ id: "empty" }, { id: "empty" }];
let bartenderThreeServing = [{ id: "empty" }, { id: "empty" }];

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
  domTickets = document.querySelectorAll(".queue-entry");
  getQueueSpacing();
  isQueueMoveDone();
  getInitialData();
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

async function getInitialData() {
  const data = await fetch(endpoint);
  const response = await data.json();
  console.log("response", response);

  const onTap = Object.values(response.taps);

  const beersData = await fetch("beers.json");
  const beersResponse = await beersData.json();

  beersArray = Object.entries(beersResponse);

  let taps = [];
  onTap.forEach((oneTap) => {
    taps.push(oneTap.beer);
  });
  beersOnTap = beersArray.filter((beer) => taps.includes(beer[1].name));
  currentQueue = [...response.queue];
  prepareObjects(beersOnTap);
  prepareNowServing(response.serving);
  prepareQueue();
  startSystem();
  countBeers(response.queue);
}

function prepareNowServing(data) {
  nowServing = [...data];

  if (nowServing[0]) {
    bartenderOneServing.unshift(nowServing[0]);
    bartenderOneServing.pop();
    displayNowServing(bartenderOneServing, 1);
  }
  if (nowServing[1]) {
    bartenderTwoServing.unshift(nowServing[1]);
    bartenderTwoServing.pop();
    displayNowServing(bartenderTwoServing, 2);
  }
  if (nowServing[2]) {
    bartenderThreeServing.unshift(nowServing[2]);
    bartenderThreeServing.pop();
    displayNowServing(bartenderThreeServing, 3);
  }
}

function displayNowServing(bartender, bartenderNumber) {
  const servingTicket = document.querySelector(`#serving${bartenderNumber}`);
  const n = bartender[0].id.toString().length - 2;
  const id =
    bartender[0].id > 100
      ? bartender[0].id.toString().substring(n)
      : bartender[0].id;
  const imgUrl = `url('images/tickets/ticket_${id}.png')`;
  servingTicket.style.setProperty("--image-url", imgUrl);
}

function displayNewNowServing(bartender, bartenderNumber) {
  const servingTicket = document.querySelector(`#serving${bartenderNumber}`);
  const secondServingTicket = document.querySelector(
    `#secondserving${bartenderNumber}`
  );
  const n = bartender[0].id.toString().length - 2;
  const id =
    bartender[0].id > 100
      ? bartender[0].id.toString().substring(n)
      : bartender[0].id;
  const imgUrl = `url('images/tickets/ticket_${id}.png')`;
  secondServingTicket.style.setProperty("--image-url", imgUrl);
  startServingMotion();
  servingTicket.addEventListener("animationend", moveServingData);
  function startServingMotion() {
    secondServingTicket.classList.add("move");
    servingTicket.classList.add("move");
    servingTicket.classList.remove("hide");
  }
  function moveServingData() {
    servingTicket.style.setProperty("--image-url", imgUrl);
    secondServingTicket.classList.remove("move");
    servingTicket.classList.remove("move");
    servingTicket.removeEventListener("animationend", moveServingData);
  }
}

function updateNowServing(update) {
  currentlyNowServing = [...update];
  if (currentlyNowServing.length < 3) {
    console.log("currentlyNowServing", currentlyNowServing);
    removeNowServingTicket();
    console.log("nobody to serve");
    return;
  }
  nowServing.push({ id: "empty" });
  if (nowServing[2].id === currentlyNowServing[0].id) {
    console.log("adding two tickets");
    twoNewNowServingEntries();
  } else if (
    JSON.stringify(currentlyNowServing) !== JSON.stringify(nowServing)
  ) {
    console.log("adding one tickets");

    oneNewNowServingEntry();
  }
  nowServing = [...currentlyNowServing];
}

function twoNewNowServingEntries() {
  let counter = 1;
  if (
    !currentlyNowServing.some((order) => order.id === bartenderOneServing[0].id)
  ) {
    bartenderOneServing.unshift(currentlyNowServing[counter]);
    bartenderOneServing.pop();
    displayNewNowServing(bartenderOneServing, 1);
    counter++;
    console.log("two new Order one", bartenderOneServing[0].id);
  }
  if (
    !currentlyNowServing.some((order) => order.id === bartenderTwoServing[0].id)
  ) {
    bartenderTwoServing.unshift(currentlyNowServing[counter]);
    bartenderTwoServing.pop();
    displayNewNowServing(bartenderTwoServing, 2);
    console.log("two new Order two", bartenderTwoServing[0].id);
    counter++;
  }
  if (
    !currentlyNowServing.some(
      (order) => order.id === bartenderThreeServing[0].id
    )
  ) {
    bartenderThreeServing.unshift(currentlyNowServing[counter]);
    bartenderThreeServing.pop();
    displayNewNowServing(bartenderThreeServing, 3);
    counter++;
    console.log("two new Order three", bartenderThreeServing[0].id);
  }
}

function oneNewNowServingEntry() {
  if (
    !currentlyNowServing.some((order) => order.id === bartenderOneServing[0].id)
  ) {
    bartenderOneServing.unshift(currentlyNowServing[2]);
    bartenderOneServing.pop();
    displayNewNowServing(bartenderOneServing, 1);
    console.log("new Order one", bartenderOneServing[0].id);
  } else if (
    !currentlyNowServing.some((order) => order.id === bartenderTwoServing[0].id)
  ) {
    bartenderTwoServing.unshift(currentlyNowServing[2]);
    bartenderTwoServing.pop();
    displayNewNowServing(bartenderTwoServing, 2);
    console.log("new Order two", bartenderTwoServing[0].id);
  } else if (
    !currentlyNowServing.some(
      (order) => order.id === bartenderThreeServing[0].id
    )
  ) {
    bartenderThreeServing.unshift(currentlyNowServing[2]);
    bartenderThreeServing.pop();
    displayNewNowServing(bartenderThreeServing, 3);
    console.log("new Order three", bartenderThreeServing[0].id);
  }
}

function removeNowServingTicket() {
  if (
    !currentlyNowServing.some((order) => order.id === bartenderOneServing[0].id)
  ) {
    bartenderOneServing.unshift({ id: "empty" });
    bartenderOneServing.pop();
    document.querySelector(`#serving1`).classList.add("hide");
    console.log("ticket removed 1");
  } else if (
    !currentlyNowServing.some((order) => order.id === bartenderTwoServing[0].id)
  ) {
    bartenderTwoServing.unshift({ id: "empty" });
    bartenderTwoServing.pop();
    document.querySelector(`#serving2`).classList.add("hide");

    console.log("ticket removed 2");
  } else if (
    !currentlyNowServing.some(
      (order) => order.id === bartenderThreeServing[0].id
    )
  ) {
    bartenderThreeServing.unshift({ id: "empty" });
    bartenderThreeServing.pop();
    document.querySelector(`#serving3`).classList.add("hide");
    console.log("ticket removed 3");
  }
}

function prepareQueue() {
  const queue = [...domTickets];
  lastQueue = [...currentQueue];

  fillOutQueueArray();

  domTickets.forEach((ticket) => ticket.classList.add("hide-queue"));

  for (let i = 0; i < currentQueue.length; i++) {
    const n = currentQueue[i].id.toString().length - 2;
    const id =
      currentQueue[i].id > 100
        ? currentQueue[i].id.toString().substring(n)
        : currentQueue[i].id;

    if (id !== "hideme") {
      queue[i].classList.remove("hide-queue");
    } else {
      queue[i].classList.add("hide-queue");
    }

    if (queue[i].dataset.id === "hideme" && id !== "hideme") {
      queue[i].classList.add("show-queue");
      setTimeout(() => queue[i].classList.remove("show-queue"), 1000);
    }

    queue[i].dataset.id = id;
    queue[i].style.setProperty(
      "--image-url",
      `url('images/tickets/ticket_${id}.png')`
    );
  }
}

function fillOutQueueArray() {
  if (currentQueue.length < 7) {
    for (let i = currentQueue.length; i < 6; i++) {
      currentQueue.push({
        id: "hideme",
      });
    }
  }
  currentQueue.length = 6;
}

function startSystem() {
  setInterval(updateData, 3000);
}

async function updateData() {
  const data = await fetch(endpoint);
  const response = await data.json();
  checkQueueProgress(response.queue);
  updateNowServing(response.serving);
  prepareManager(response);
  countBeers(response.queue);
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
    if (lastQueue.length < 2) {
    } else if (lastQueue[1].id === currentQueue[0].id) {
      setIterations(1);
    } else if (lastQueue[2].id === currentQueue[0].id) {
      setIterations(2);
    }
    lastQueue = [...currentQueue];

    //console.log("new entry");
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
  console.log(currentQueue);
  for (let i = 0; i < 6; i++) {
    const thisTicket = document.getElementById(`ticket${1 + i}`);
    changeTicketId(thisTicket, i);
    showActiveTickets(thisTicket);
  }
}

function changeTicketId(thisTicket, i) {
  const n = currentQueue[i].id.toString().length - 2;
  const id =
    currentQueue[i].id > 100
      ? currentQueue[i].id.toString().substring(n)
      : currentQueue[i].id;

  thisTicket.dataset.id = id;
  thisTicket.style.setProperty(
    "--image-url",
    `url('images/tickets/ticket_${id}.png')`
  );
}

function showActiveTickets() {
  domTickets.forEach((ticket) => ticket.classList.add("hide-queue"));
  setTimeout(() =>
    domTickets.forEach((ticket) => {
      if (ticket.dataset.id !== "hideme") {
        ticket.classList.remove("hide-queue");
      }
    })
  );
}

function prepareObjects(jsonData) {
  allBeers = jsonData.map(prepareObject);
  // TODO: This might not be the function we want to call first
  displayList(allBeers);
}

function prepareObject(jsonObject) {
  const beer = Object.create(Beer);
  //beer.image = jsonObject[1].image;
  beer.name = jsonObject[1].name;
  beer.type = jsonObject[1].type;
  beer.alc = jsonObject[1].alc;
  beer.price = jsonObject[1].price;

  let image = "images/beers/" + jsonObject[1].image + ".png";
  beer.image = image;

  return beer;
}

function displayList(beers) {
  // clear the list
  document.querySelector("#list").innerHTML = "";
  // build a new list
  beers.forEach(displayBeer);
}

function displayBeer(beer) {
  // create clone
  let clone = document.querySelector("#beer-template").content.cloneNode(true);
  // set clone data

  clone.querySelector(".beer > img").src = beer.image;

  //clone.querySelector("[data-field=image]").textContent = beer.image;
  clone
    .querySelector(".beer")
    .setAttribute("id", beer.name.replace(/\s+/g, ""));
  clone.querySelector("[data-field=name]").textContent = beer.name;
  clone.querySelector("[data-field=type]").textContent = beer.type;
  clone.querySelector("[data-field=alc]").textContent = beer.alc + "%";
  clone.querySelector("[data-field=price]").textContent = beer.price + ",0kr.";
  // append clone to list
  document.querySelector("#list").appendChild(clone);
}
//Setting up the fetching//
async function fetchMenago() {
  const data = await fetch(endpoint);
  const response = await data.json();
  //console.log(response);

  console.log(
    `It is ${response.bar.closingTime} and we have ${response.bartenders.length} bartenders: ${response.bartenders[0].name}`
  );
  prepareManager(response);
}

function prepareManager(menago) {
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
  var table = document.getElementById("bartenderr");
  table.innerHTML = "";

  for (var i = 0; i < data.length; i++) {
    var row = `<div class="small-bartender">${data[i].name} ${data[i].status}</div>`;

    table.innerHTML += row;
  }
}

function getStorage(data) {
  var stock = document.getElementById("STOCK");
  stock.innerHTML = "";
  data.forEach((oneBeer) => {
    let beerImage = "";
    if (oneBeer.name === "El Hefe") {
      beerImage = "elhefe";
    } else if (oneBeer.name === "Fairy Tale Ale") {
      beerImage = "bigdaddy";
    } else if (oneBeer.name === "GitHop") {
      beerImage = "githop";
    } else if (oneBeer.name === "Hollaback Lager") {
      beerImage = "hollaback";
    } else if (oneBeer.name === "Hoppily Ever After") {
      beerImage = "hoppilyeverafter";
    } else if (oneBeer.name === "Mowintime") {
      beerImage = "mowingtime";
    } else if (oneBeer.name === "Row 26") {
      beerImage = "row26";
    } else if (oneBeer.name === "Ruined Childhood") {
      beerImage = "ruinedchildhood";
    } else if (oneBeer.name === "Sleighride") {
      beerImage = "sleighride";
    } else if (oneBeer.name === "Steampunk") {
      beerImage = "steampunk";
    }
    var row = `<div id="storage"><img src="images/beers/${beerImage}.png" alt="Beer Label"/><br> ${oneBeer.name}:<br> ${oneBeer.amount}</div>`;
    stock.innerHTML += row;
  });
}

function getTheTap(data) {
  var table = document.getElementById("onTap");
  table.innerHTML = "";
  //let image = "images/beers/" + + ".png";

  data.forEach((oneTap) => {
    let dataImage = "";
    if (oneTap.beer === "El Hefe") {
      dataImage = "elhefe";
    } else if (oneTap.beer === "Fairy Tale Ale") {
      dataImage = "bigdaddy";
    } else if (oneTap.beer === "GitHop") {
      dataImage = "githop";
    } else if (oneTap.beer === "Hollaback Lager") {
      dataImage = "hollaback";
    } else if (oneTap.beer === "Hoppily Ever After") {
      dataImage = "hoppilyeverafter";
    } else if (oneTap.beer === "Mowintime") {
      dataImage = "mowingtime";
    } else if (oneTap.beer === "Row 26") {
      dataImage = "row26";
    } else if (oneTap.beer === "Ruined Childhood") {
      dataImage = "ruinedchildhood";
    } else if (oneTap.beer === "Sleighride") {
      dataImage = "sleighride";
    } else if (oneTap.beer === "Steampunk") {
      dataImage = "steampunk";
    }

    var row = `<div id="oneTap"><div id="oneTap_img"><img src="images/beers/${dataImage}.png" alt="Beer Label"/></div><div id="oneTap_beer">${
      oneTap.beer
    }</div><div id="oneTap_level"ś>${oneTap.level / 100} l</div></div>`;
    table.innerHTML += row;
  });
}

let beerCount = [
  { name: "El Hefe", amount: 0 },
  { name: "Fairy Tale Ale", amount: 0 },
  { name: "GitHop", amount: 0 },
  { name: "Hollaback Lager", amount: 0 },
  { name: "Hoppily Ever After", amount: 0 },
  { name: "Mowintime", amount: 0 },
  { name: "Row 26", amount: 0 },
  { name: "Ruined Childhood", amount: 0 },
  { name: "Sleighride", amount: 0 },
  { name: "Steampunk", amount: 0 },
];

let lastCount = 0;

function countBeers(orders) {
  console.log(lastCount);
  console.log(orders);
  orders.forEach((order) => {
    if (order.id > lastCount) {
      order.order.forEach((beer) =>
        beerCount.map((beerCount) => {
          if (beer === beerCount.name) {
            beerCount.amount++;
          }
          return { name: beerCount.name, amount: beerCount.amount };
        })
      );
    }
    lastCount = order.id;
  });
  setMostWanted();
}

function setMostWanted() {
  beerCount.sort((a, b) => a.amount - b.amount);
  console.log(beerCount[9].name);
  document
    .querySelectorAll(".beer")
    .forEach((beer) => beer.classList.remove("most-wanted"));
  document
    .querySelector(`#${beerCount[9].name.replace(/\s+/g, "")}`)
    .classList.add("most-wanted");
}
