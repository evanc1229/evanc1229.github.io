import * as utils from "../shared/utils.js";
import {About} from "./about.js";
import { Page, Component } from "../shared/prototype.js";

class Page3 extends Page {
  /**
   *
   * @param {Array<utils.AvalancheData>} data
   */
   constructor(data, name='page2') {
    console.log("Init Page 2");
    super(data);
    this.name = name;
    this.padding = 10;

    this.config = {
      about: {
        width: 1000,
        height: 1000,
      },
    };

    // initialize components
    this.components = [
      (this.about = new About(this, this.data, false)),
    ];
  }

  async render() {
    super.render();
  }

}
export { Page3 };
