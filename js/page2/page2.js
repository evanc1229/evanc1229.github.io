import { DepthChart } from "./depthchart.js";
import { ElevationChart } from "./elevationchart.js";
import { RosePlot } from "./roseplot.js";
import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";

// coordinate tooltip.js, main_map.js, timeselect.js

class Page2 extends Page {
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
      depthchart: {
        width: 800,
        height: 500,
      },
      elevationchart: {
        width: 800,
        height: 500,
      },
      roseplot: {
        width: 500,
        height: 500,
      },
    };

    // initialize components
    this.components = [
      (this.elevationchart = new ElevationChart(this, this.data, true)),
      (this.depthchart = new DepthChart(this, this.data, false)),
      (this.roseplot = new RosePlot(this, this.data, false)),
    ];
  }

  async render() {
    super.render();
  }
}
export { Page2 };
