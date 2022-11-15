import { Page1 } from "./page1/page1.js";
import { loadData } from "./data.js";

// Initialize each of pages 1, 2, and 3 with dataset
const data = await loadData();

// const ts = new TimeSelect(data)


const p1 = new Page1(data);
p1.render();

var globalState = {
  data: data,
  p1: p1,
  // ts: ts
};

// store state globally for debugging
window.globalState = globalState;

console.log("DONE");
