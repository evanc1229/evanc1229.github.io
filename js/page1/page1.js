import { MainMap } from "./main_map.js";
import { TimeSelect } from "../shared/timeselect.js";
import { ToolTip } from "./tooltip.js";
import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";

// coordinate tooltip.js, main_map.js, timeselect.js

class Page1 extends Page {
  /**
   *
   * @param {Array<utils.AvalancheData>} data
   */
  constructor(data, name) {
    console.log("Init Page 1");
    super(data, name);

    this.padding = 10;

    this.config = {
      timeselect: {
        width: 800,
        height: 120,
      },
      map: {
        width: 1200,
        height: 900,
      },
    };

    this.timeselect = this.map = new Component(this, this.data);

    // initialize components
    this.components = [
      (this.timeselect = new TimeSelect(this, this.data, false)),
      (this.map = new MainMap(this, this.data, false)),
    ];
  }

  async render() {
    super.render();
  }
  
}
export { Page1 };
