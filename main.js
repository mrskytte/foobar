"use strict";

window.addEventListener("DOMContentLoaded", start);

let allBeers = [];

const Beer = {
    image: "",
    name: "",
    type: "",
    price: ""
};


function start() {
    console.log("ready");

    loadJSON();
}

async function loadJSON() {
    const response = await fetch("beers.json");
    const jsonData = await response.json();

    // when loaded, prepare data objects
    prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
    allBeers = jsonData.map(prepareObject);
    // TODO: This might not be the function we want to call first
    displayList(allBeers);
}

function prepareObject(jsonObject) {
    const beer = Object.create(Beer);

    return beer;
}

function displayList(beers) {
    // clear the list
    document.querySelector("#list > tbody").innerHTML = "";
    // build a new list
    beers.forEach(displayBeer);
}

function displayBeer(beer) {
    // create clone
    const clone = document.querySelector("#beer").content.cloneNode(true);
    // set clone data
    clone.querySelector("[data-field=image]").textContent = beer.image;
    clone.querySelector("[data-field=name]").textContent = beer.name;
    clone.querySelector("[data-field=type]").textContent = beer.type;
    clone.querySelector("[data-field=price]").textContent = beer.price;
    // append clone to list
    document.querySelector("#list > tbody").appendChild(clone);
}

function showBeer(beer) {
    const template = document.querySelector("template").content;
    const copy = template.cloneNode(true);
}