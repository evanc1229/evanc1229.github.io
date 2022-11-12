// use for loading data, and initializing each page

import { Page1 } from "./page1/page1.js";

// TODO: Load dataset
async function loadData() {
  console.log("Loading Data");
  const avalanches = await d3.csv("data/avalanches.csv");
  const map = await d3.json("data/map.geojson");

  return {
    avalanches:avalanches,
    map:map,
  };
}

// Initialize each of pages 1, 2, and 3 with dataset
const data = await loadData();
const p1 = new Page1(data);
p1.render();

var globalState = {
  data: data,
  p1: p1
};

// store state globally for debugging
window.globalState = globalState;

console.log("DONE");
