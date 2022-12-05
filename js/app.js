import { Page1 } from "./page1/page1.js";
import { Page2 } from "./page2/page2.js";
import { Page3 } from "./page3/page3.js";
import { Nav } from "./shared/nav.js";
import * as utils from "./shared/utils.js";

// Initialize each of pages 1, 2, and 3 with dataset
const data_raw = await utils.loadData();

const data = utils.preprocessData(data_raw);

const pages = {
  p1: new Page1(data, 'p1'),
  p2: new Page2(data, 'p2'),
  p3: new Page3(data, 'p3'),
};
const nav = new Nav(pages);
pages.p1.show();

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
