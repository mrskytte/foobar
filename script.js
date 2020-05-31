"use strict";

window.addEventListener("load", init);

let domTickets = [];
let lastQueue = [];
let currentQueue = [];

const endpoint = "https://fireoranges.herokuapp.com";

function init() {
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

  currentQueue = [...response.queue];
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