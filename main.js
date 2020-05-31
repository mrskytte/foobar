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
    console.log(jsonData);

    // when loaded, prepare data objects
    prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
    allBeers = jsonData.map(prepareObject);
    console.log("allbeer", allBeers)
    // TODO: This might not be the function we want to call first
    displayList(allBeers);
}

function prepareObject(jsonObject) {
    console.log(jsonObject);
    const beer = Object.create(Beer);
    //beer.image = jsonObject.image;
    beer.name = jsonObject.name;
    beer.type = jsonObject.type;
    beer.alc = jsonObject.alc;
    beer.price = jsonObject.price;

    let image = "images/beers/" + jsonObject.image + ".png";
    beer.image = image

    return beer;
}

function displayList(beers) {
    console.log("beers", beers);
    // clear the list
    document.querySelector("#list").innerHTML = "";
    // build a new list
    beers.forEach(displayBeer);
}

function displayBeer(beer) {

    console.log("beer", beer)

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


//The time//