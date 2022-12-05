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
  constructor(data) {
    console.log("Init Page 1");
    super(data);

    this.padding = 10;

    this.config = {
      timeselect: {
        width: 1600,
        height: 100,
      },
      map: {
        width: 700,
        height: 700,
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
