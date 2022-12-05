import { Page1 } from "./page1/page1.js";
import { Page2 } from "./page2/page2.js";
import { Page3 } from "./page3/page3.js";
import { Nav } from "./shared/nav.js";
import * as utils from "./shared/utils.js";

// Initialize each of pages 1, 2, and 3 with dataset
const data_raw = await utils.loadData();

const data = utils.preprocessData(data_raw);

const pages = {
  p1: new Page1(data, "p1"),
  p2: new Page2(data, "p2"),
  p3: new Page3(data, "p3"),
};
const nav = new Nav(pages);
nav.activatePage("p1");

(async () => {
  R.forEachObjIndexed((page, name) => page.render(), pages);
})();

var globalState = {
  data: data,
  pages: pages,
  nav: nav,
};

// store state globally for debugging
window.globalState = globalState;

console.log("DONE");

var t = true;
d3.select("#navbar")
  .append("button")
  .text("debug")
  .on("click", () => {
    pages.p1.map.toggleShrink(100, 0);
    console.log("clicked:", t, pages.p1.hidden, pages.p2.hidden);
    if (t) {
      nav.activatePage("p2");
      pages.p2.div
        .style('left', `${1200}px`)
        .transition()
        .duration(500)
        .style("left", `${pages.p1.map.dimensions.right + 10}px`)
        .style("top",`${pages.p1.map.dimensions.top}px`);
      t = false;
    } else {
      pages.p2.div
        .transition()
        .duration(500)
        .style("left", `${pages.p2.padding}px`)
        .style("top", `${pages.p2.padding}px`)
        .delay(500)
        .call(() => {
          nav.hidePage("p2");
        });
      t = true;
    }
  });
