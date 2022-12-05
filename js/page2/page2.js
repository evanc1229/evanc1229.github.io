import { DepthChart } from "./depthchart.js";
import { ElevationChart } from "./elevationchart.js";
import { Histogram } from "./histogram.js";
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
        width: 500,
        height: 500,
      },
      elevationchart: {
        width: 500,
        height: 500,
      },
      histogram: {
        width: 500,
        height: 500,
      },
      roseplot: {
        width: 500,
        height: 500,
      },
    };

    // initialize components
    this.components = [
      (this.depthchart = new DepthChart(this, this.data, false)),
      (this.elevationchart = new ElevationChart(this, this.data, false)),
      (this.histogram = new Histogram(this, this.data, false)),
      (this.roseplot = new RosePlot(this, this.data, false)),
    ];
  }

  async render() {
    super.render();
  }
}
export { Page2 };
