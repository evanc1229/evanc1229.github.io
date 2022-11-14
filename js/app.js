import { Page1 } from "./page1/page1.js";
import {TimeSelect} from "./shared/timeselect.js";
import {ToolTip} from "./page1/tooltip.js";
import { loadData } from "./data.js";

// Initialize each of pages 1, 2, and 3 with dataset
const data = await loadData();

const ts = new TimeSelect(data)

const tt = new ToolTip(data);


const p1 = new Page1(data, ts, tt);
p1.render();

var globalState = {
  data: data,
  p1: p1,
  ts: ts,
  tt: tt
  
};

// store state globally for debugging
window.globalState = globalState;

console.log("DONE");
