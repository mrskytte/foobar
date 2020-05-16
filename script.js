"use strict";

window.addEventListener("load", init);
let domTickets = [];
let lastQueue = [];
let currentQueue = [];
let counter = 10;

const endpoint = "https://fireoranges.herokuapp.com";

function init() {
  domTickets = document.querySelectorAll(".queue-entry");
  getQueueSpacing();
  getInitialQueue();
  prepareQueue();
  isQueueMoveDone();
  //   setInterval(artificialQueue, 3000);
}

async function getInitialQueue() {
  const data = await fetch(endpoint);
  const response = await data.json();
  currentQueue = [...response.queue];
  console.log(currentQueue);
  fillOutQueueArray();
  prepareQueue();
  startSystem();
}

function prepareQueue() {
  const queue = [...domTickets];
  domTickets.forEach((ticket) => ticket.classList.add("hide-queue"));
  for (let i = 0; i < currentQueue.length; i++) {
    const id =
      currentQueue[i].id > 100
        ? currentQueue[i].id.toString().substring(1)
        : currentQueue[i].id;
    queue[i].classList.remove("hide-queue");
    if (queue[i].querySelector("p").textContent === "hideme") {
      queue[i].classList.add("show-queue");
    }
    setTimeout(() => queue[i].classList.remove("show-queue"), 1000);
    queue[i].querySelector("p").textContent = id;
    if (queue[i].querySelector("p").textContent === "hideme") {
      queue[i].classList.add("hide-queue");
    }
  }
  lastQueue = [...currentQueue];
}

function fillOutQueueArray() {
  lastQueue = [...currentQueue];
  if (currentQueue.length < 10) {
    for (let i = currentQueue.length; i < 9; i++) {
      currentQueue.push({ id: "hideme" });
    }
  }
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
  console.log("last", lastQueue);
  console.log("current", currentQueue);
  if (lastQueue.length < currentQueue.length) {
    console.log("adding new entries");
    prepareQueue();
  }
  if (!currentQueue[0]) {
    console.log("queue empty");
  } else if (!lastQueue[0] && currentQueue[0]) {
    console.log("new entry + old queue empty ");
    updateQueue();
  } else if (lastQueue[0].id !== currentQueue[0].id) {
    if (lastQueue[1].id === currentQueue[0].id) {
      setIterations(1);
      updateQueue();
    } else if (lastQueue[2].id === currentQueue[0].id) {
      setIterations(2);
    }
    console.log("new entry");
    updateQueue();
  } else if (lastQueue[0].id === currentQueue[0].id) {
    console.log("no change");
  } else {
    updateQueue();
  }
}

function setIterations(iterations) {
  document
    .querySelector("#container")
    .style.setProperty("--iterations", iterations);
}

function isQueueMoveDone() {
  document
    .querySelector("[data-position=one]")
    .addEventListener("animationend", removeMoveQueueClass);
  document
    .querySelector("[data-position=one]")
    .addEventListener("animationend", () => {
      moveQueue();
    });
}

function removeMoveQueueClass() {
  domTickets.forEach((entry) => entry.classList.remove("move-queue"));
}

function updateQueue() {
  fillOutQueueArray();
  domTickets.forEach((entry) => entry.classList.add("move-queue"));
}

function getQueueSpacing() {
  console.log(
    "queuePos1",
    document.querySelector("[data-position=one]").getBoundingClientRect()
  );
  const queuePos1 = document
    .querySelector("[data-position=one]")
    .getBoundingClientRect().x;
  const queuePos2 = document
    .querySelector("[data-position=two]")
    .getBoundingClientRect().x;

  const queueOffset = queuePos1 - queuePos2;
  console.log(queueOffset);
  document
    .getElementById("container")
    .style.setProperty("--queue-offset", queueOffset);
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
    currentQueue[i].id > 100
      ? currentQueue[i].id.toString().substring(1)
      : currentQueue[i].id;
  console.log(id);
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

// currentQueue[i].id > 100 ? currentQueue[i].id - 100 : currentQueue[i].id;
