import { MainMap } from "./main_map.js";

// coordinate tooltip.js, main_map.js, timeselect.js

class Page1 {
  constructor(data, timeselect, tooltip) {
    console.log("Init Page 1");

    this.data = data;
    this.timeselect = timeselect;
    this.tooltip = tooltip;
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
  }
}
export { Page1 };
