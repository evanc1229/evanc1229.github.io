import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";

class Page3 extends Page {
  /**
   *
   * @param {Array<utils.AvalancheData>} data
   */
  constructor(data, name) {
    super(data, name);
    console.log("Init Page 3");
    this.data = data;
  }

}
export { Page3 };
