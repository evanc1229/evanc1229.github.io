import { Page1 } from "./page1/page1.js";
import { Page2 } from "./page2/page2.js";
import { Page3 } from "./page3/page3.js";
import * as utils from "./shared/utils.js";

// Initialize each of pages 1, 2, and 3 with dataset
const data_raw = await utils.loadData();

// TODO: implement utils.preprocessData, then use here
const data = utils.preprocessData(data_raw)
// const data = data_raw; // placeholder

const pages = {
  p1: new Page1(data),
  p2: new Page2(data),
  p3: new Page3(data),
};

pages.p1.render();

var globalState = {
  data: data,
  pages: pages,
  activePage: "p1",
};

const swapPage = (p) => {
  if (globalState.activePage != p.target.id){
    let oldPageId = globalState.activePage;
    pages[globalState.activePage].hide();
    pages[p.target.id].render();
    globalState.activePage = p.target.id;

    document.querySelector(`#${oldPageId}`).classList.remove('active')
    p.target.classList.add('active')
  }
}

d3.selectAll(".nav-link").on("click", swapPage);
// store state globally for debugging
window.globalState = globalState;

console.log("DONE");
