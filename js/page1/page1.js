import { MainMap } from "./main_map.js";
import {TimeSelect} from "../shared/timeselect.js"
import { ToolTip } from "./tooltip.js";

// coordinate tooltip.js, main_map.js, timeselect.js

class Page1 {
  constructor(data) {
    console.log("Init Page 1");

    this.data = data;
    this.timeselect = new TimeSelect(data);
    this.tooltip = new ToolTip(data);
    
  }

  render() {
    let mapDiv = d3
      .select("body")
      .append("div")
      .attr("id", "map")
      .style("height", "700px")
      .style("width", "700px");

    this.map = new MainMap(mapDiv, this.data);

    this.map.render();

    // let dataSlice = this.data.avalanches.slice(0, 5);
    // let testSvg = d3.select("#test").data(dataSlice);

    // let tool = testSvg
    //   .append("polygon")
    //   .attr("id", (d, i) => `tooltip${i}`)
    //   .attr("height", 600)
    //   .attr("width", 600)
    //   .attr(
    //     "points",
    //     "318.5 10, 701.5 10, 1010 318.5, 1010 701.5, 701.5 1010, 318.5 1010, 10 701.5, 10 318.5"
    //   )
    //   .style("fill", "lightgrey")
    //   .style("stroke", "black")
    //   .style("strokeWidth", "10px")
    //   .style("opacity", 0)
    //   .style("position", "absolute");

    // testSvg
    //   .append("circle")
    //   .attr("x", (d, i) => 100 * i)
    //   .attr("y", (d, i) => 100 * i)
    //   .attr("r", 50)
    //   .attr("fill", "red")
    //   .on("mouseover", function (e, d) {
    //     tool.transition().duration(200).style("opacity", 0.9);
    //     tool
    //       .html(
    //         "Attribute  Value   Plot" +
    //           "<br/>" +
    //           "Region: " +
    //           d.Region +
    //           "" +
    //           "<br/>" +
    //           "Place: " +
    //           d.Place +
    //           "" +
    //           "<br/>" +
    //           "Trigger: " +
    //           d.Trigger +
    //           "" +
    //           "<br/>" +
    //           "Width: " +
    //           d.Width +
    //           "" +
    //           "<br/>" +
    //           "Vertical: " +
    //           d.Vertical +
    //           "" +
    //           "<br/>" +
    //           "Aspect: " +
    //           d.Aspect +
    //           "" +
    //           "<br/>" +
    //           "Elevation: " +
    //           d.Elevation +
    //           "" +
    //           "<br/>"
    //       )
    //       .style("left", d3.select(this).attr("cx") + "px")
    //       .style("top", d3.select(this).attr("cy") + "px");
    //   })
    //   .on("mouseout", function (d) {
    //     tool.transition().duration(500).style("opacity", 0);
    //   });
  }
}
export { Page1 };
