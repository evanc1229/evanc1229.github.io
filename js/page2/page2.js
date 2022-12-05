import { DepthChart } from "./depthchart.js";
import { ElevationChart } from "./elevationchart.js";
import { Histogram } from "./histogram.js";
import {RosePlot} from "./roseplot.js";
import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";

// coordinate tooltip.js, main_map.js, timeselect.js

class Page2 extends Page {
  /**
   *
   * @param {Array<utils.AvalancheData>} data
   */
  constructor(data) {
    console.log("Init Page 2");
    super(data);

    this.padding = 10;

    this.dimensions = {
      depthchart: {
        width: 800,
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

    this.positions = {
      depthchart: {
        x: 0,
        y: 0,
      },
      elevationchart: {
        x: 0,
        y: 0,
      },
      histogram: {
        x: 0,
        y: this.dimensions.depthchart.height + this.padding,
      },
      roseplot: {
        x: this.dimensions.depthchart.width + this.padding,
        y: this.dimensions.depthchart.height + this.padding,
      },
    };

    this.aidSelection = this.data.map((d) => d.aid);
    this.aidFocus = null;

    // initialize components
    //this.depthchart = new DepthChart(this, this.data, false);
    this.elevationchart = new ElevationChart(this, this.data, true);
    this.histogram = new Histogram(this, this.data, false);
    this.roseplot = new RosePlot(this, this.data, false);

    this.components = [this.depthchart, this.elevationchart, this.histogram, this.roseplot];
  }

  async render() {
    let div = d3.select(".content");

    // let dcDiv = div
    //   .append("div")
    //   .attr("id", "depthchart")
    //   .style("width", `${this.dimensions.depthchart.width}px`)
    //   .style("height", `${this.dimensions.depthchart.height}px`)
    //   .style("left", `${this.positions.depthchart.x}px`)
    //   .style("top", `${this.positions.depthchart.y}px`)

    // .style("position", "absolute");

    let ecDiv = div
      .append("div")
      .attr("id", "elevationchart")
      .style("width", `${this.dimensions.elevationchart.width}px`)
      .style("height", `${this.dimensions.elevationchart.height}px`)
      .style("left", `${this.positions.elevationchart.x}px`)
      .style("top", `${this.positions.elevationchart.y}px`)
      
    // .style("position", "absolute");

    let hDiv = div
      .append("div")
      .attr("id", "histogram")
      .style("width", `${this.dimensions.histogram.width}px`)
      .style("height", `${this.dimensions.histogram.height}px`)
      .style("left", `${this.positions.histogram.x}px`)
      .style("top", `${this.positions.histogram.y}px`);
    // .style("position", "absolute");
    let rpDiv = div
      .append("div")
      .attr("id", "roseplot")
      .style("width", `${this.dimensions.roseplot.width}px`)
      .style("height", `${this.dimensions.roseplot.height}px`)
      .style("left", `${this.positions.roseplot.x}px`)
      .style("top", `${this.positions.roseplot.y}px`);
    // .style("position", "absolute");

    //this.depthchart.render(dcDiv);
    this.elevationchart.render(ecDiv);
    this.histogram.render(hDiv);
    this.roseplot.render(rpDiv);

    this.elementIds = ["depthchart", "elevationchart", "histogram", "roseplot"];
  }

  hide() {
    this.elementIds.forEach((id) => document.getElementById(id).remove());
  }
}
export { Page2 };
