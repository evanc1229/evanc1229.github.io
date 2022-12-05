// tooltip component in P1

import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";

let leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => {});

if (L === undefined) L = leaflet;

class ToolTipConfig {
  constructor(
    width = 300,
    height = 300,
    offsetX = 0,
    offsetY = 0,
    padding = 10,
    opacity = 0.8
  ) {
    this.width = width;
    this.height = height;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    this.padding = padding;
    this.opacity = opacity;
  }
}
class ToolTip extends Component {
  /**
   *
   * @param {Component|Page} parent
   * @param {ToolTipConfig} config
   */
  constructor(parent, config = new ToolTipConfig()) {
    super(parent, parent.data, parent.verbose);
    this.parent = parent;
    this.config = config;

    this.loc = {
      x: parent.dimensions.left,
      y: parent.dimensions.top,
    };

    this.pinned = false;
  }

  togglePin() {
    this.pinned = !this.pinned;
    this.tooltipRect.attr("fill", this.pinned ? "#cccccc" : "#ffffff");
    this.update();
  }

  /**
   *
   * @param {d3.Selection} div
   */
  async render(div) {
    // init tooltip structure
    this.tooltipGroup = div
      .append("g")
      .attr("id", "gp-tt")
      .on("click", () => this.togglePin());

    this.tooltipRect = this.tooltipGroup
      .append("rect")
      .attr("id", "tt-rect")
      .attr("x", this.loc.x)
      .attr("y", this.loc.y)
      .attr("width", this.config.width)
      .attr("height", this.config.height)
      .attr("rx", "20")
      .attr("ry", "20")
      .attr("opacity", 0)
      .attr("stroke", "black")
      .attr("fill", "white");

    this.tooltipText = this.tooltipGroup
      .append("text")
      .text("")
      .attr("x", this.loc.x)
      .attr("y", this.loc.y)
      .attr("id", "tt-text")
      .attr("text-anchor", "middle")
      .attr("opacity", 0);

    this.tooltipPlot = this.tooltipGroup
      // .append("svg")
      // .attr("width", this.config.width - 2*this.config.padding)
      // .attr("height", 4*(this.config.height/5) - 2*this.config.padding)
      .append("svg")
      .attr("id", "tt-plots")
      .attr("x", this.loc.x)
      .attr("y", this.loc.y);
    // .attr("transform", `translate(${this.loc.x},${this.loc.y})`)
    // .attr(
    //   "transform",
    //   `translate(${this.config.padding},${this.config.padding})`
    // );
    this.config["plotConfig"] = {
      x: this.loc.x,
      y: this.loc.y,
      width: this.config.width - this.config.padding,
      height: (4 * this.config.height) / 5,
      boxWidth: this.config.width / 8,
      axisMargin: -(this.config.width / 8 + 20),
      margin: { top: 10, right: 30, bottom: 30, left: 40 },
    };
    this.tooltipGroup.style("display", "none");
  }

  setLoc(loc) {
    this.loc = loc;
  }

  async update() {
    let aidFocus = this.parent.getFocus();

    // pass if no focus or tooltip is pinned
    if (aidFocus === null || aidFocus === undefined || this.pinned) {
      if (!this.pinned) this.tooltipGroup.style("display", "none");
      // this.tooltipGroup.select("#tt-plots").remove();
      return;
    }

    let d = d3.filter(this.parent.data, (d) => d.aid == aidFocus)[0];

    // pass if focus cant be found
    if (d === undefined) return;

    this.tooltipGroup.style("display", "block");
    let tooltipX = this.loc.x + this.config.offsetX;
    let tooltipY = this.loc.y + this.config.offsetY;
    let plot = {
      width: this.config.width - 2 * this.config.padding,
      height: (4 * this.config.height) / 5 - 2 * this.config.padding,
      x: tooltipX + this.config.padding,
      y: tooltipY + this.config.padding + this.config.height / 5,
    };
    let victim_str = [...Object.keys(d.victim_status)]
      .filter((e) => d.victim_status[e].length > 0)
      .map((e) => `${e}:${d.victim_status[e]}`)
      .join("|");
    let tooltipTextString =
      `Avalanche ${d.aid} occured on ${d.date} in ${d.region} ` +
      (victim_str.length
        ? `with the victim being ${victim_str}`
        : "\nThe victim was unharmed");

    // update tooltip rect
    (async () => {
      this.tooltipRect
        .attr("width", this.config.width)
        .attr("height", this.config.height)
        .transition()
        .duration(100)
        .attr("opacity", this.config.rectOpacity)
        .attr("x", tooltipX)
        .attr("y", tooltipY);
    })();

    (async () => {
      this.tooltipPlot
        .attr("width", plot.width)
        .attr("height", plot.height)
        .transition()
        .duration(100)
        .attr("opacity", 1)
        .attr("x", plot.x)
        .attr("y", plot.y);
    })();

    // update tooltip text
    (async () => {
      this.tooltipText.selectAll("tspan").remove();
      this.tooltipText
        .attr("text-anchor", "left")
        .transition()
        .duration(100)
        .attr("x", tooltipX)
        .attr("y", tooltipY + 20)
        .attr("opacity", 0)
        .on("end", () => {
          this.tooltipText
            .text(tooltipTextString)
            .call(utils.wrapText, this.tooltipRect)
            .attr("opacity", 1);
        });

      this.makeTooltipPlots();
    })();
  }

  makeTooltipPlots() {
    let svg = this.tooltipPlot;

    let config = this.config.plotConfig;
    let width = config.width - config.margin.left - config.margin.right;
    let height = config.height - config.margin.top - config.margin.bottom;
    let boxWidth = config.boxWidth;

    let keys = ["elevation", "depth", "vertical", "width"];

    let ss = this.getStats(this.data, keys, config);
    let sumstat = R.valuesIn(ss).map((e) => {
      return { key: e.key, value: e };
    });

    // Show the X scale
    let xS = d3
      .scaleBand()
      .range([0, width])
      .domain(keys)
      .paddingInner(1)
      .paddingOuter(0.5);

    svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xS));

    // Show the Y scale
    // let yS = d3.scaleLinear().domain([3, 9]).range([height, 0]);

    let yS = {};
    R.forEachObjIndexed((v, k) => {
      yS[k] = v.yS;
      svg
        .append("g")
        .call(d3.axisLeft(yS[k]))
        .attr("transform", `translate(${xS(k) + config.axisMargin},0)`);
    }, ss);

    // Show the main vertical line
    svg
      .selectAll("vertLines")
      .data(sumstat)
      .join("line")
      .attr("x1", (d) => xS(d.key))
      .attr("x2", (d) => xS(d.key))
      .attr("y1", (d) => yS[d.key](d.value.min))
      .attr("y2", (d) => yS[d.key](d.value.max))
      .attr("stroke", "black")
      .style("width", 40);

    // rectangle for the main box
    svg
      .selectAll("boxes")
      .data(sumstat)
      .join("rect")
      .attr("x", (d) => xS(d.key) - boxWidth / 2)
      .attr("y", (d) => yS[d.key](d.value.q3))
      .attr("height", (d) => yS[d.key](d.value.q1) - yS[d.key](d.value.q3))
      .attr("width", boxWidth)
      .attr("stroke", "black")
      .style("fill", "#69b3a2");

    // Show the median
    svg
      .selectAll("medianLines")
      .data(sumstat)
      .join("line")
      .attr("x1", (d) => xS(d.key) - boxWidth / 2)
      .attr("x2", (d) => xS(d.key) + boxWidth / 2)
      .attr("y1", (d) => yS[d.key](d.value.median))
      .attr("y2", (d) => yS[d.key](d.value.median))
      .attr("stroke", "black")
      .style("width", 80);

    // Show the min/max
    svg
      .selectAll("minLines")
      .data(sumstat)
      .join("line")
      .attr("x1", (d) => xS(d.key) - boxWidth / 2)
      .attr("x2", (d) => xS(d.key) + boxWidth / 2)
      .attr("y1", (d) => yS[d.key](d.value.min))
      .attr("y2", (d) => yS[d.key](d.value.min))
      .attr("stroke", "black")
      .style("width", 80);

    svg
      .selectAll("maxLines")
      .data(sumstat)
      .join("line")
      .attr("x1", (d) => xS(d.key) - boxWidth / 2)
      .attr("x2", (d) => xS(d.key) + boxWidth / 2)
      .attr("y1", (d) => yS[d.key](d.value.max))
      .attr("y2", (d) => yS[d.key](d.value.max))
      .attr("stroke", "black")
      .style("width", 80);
  }

  getStats(data, keys, config) {
    return R.reduce(
      (obj, key) => {
        const v = R.map(R.prop(key), data);
        let stats = {
          key: key,
          mean: d3.mean(v),
          q1: d3.quantile(v, 0.25),
          q2: d3.quantile(v, 0.5),
          q3: d3.quantile(v, 0.75),
        };
        let iqr = stats.q3 - stats.q1;
        stats = {
          ...stats,
          iqr: iqr,
          min: Math.max(stats.q3 - 1.5 * iqr, 0),
          max: stats.q1 + 1.5 * iqr,
        };
        if (config !== undefined && config.height !== undefined) {
          let yS = d3
            .scaleLinear()
            .domain([stats.min, stats.max])
            .range([config.height, 0]);
          let histogram = d3
            .bin(v)
            .domain(yS.domain())
            .thresholds(yS.ticks(20))
            .value((d) => d);
          stats = {
            ...stats,
            yS: yS,
            histogram: histogram,
          };
        }
        return R.assoc(key, stats, obj);
      },
      {},
      keys
    );
  }

  setFocusNodes(nodeIds, setFocused, focusFadeOpacity, nodeColorShift) {
    // satisfy defaults
    setFocused = setFocused === undefined ? true : setFocused;
    focusFadeOpacity = focusFadeOpacity === undefined ? 0.7 : focusFadeOpacity;
    nodeColorShift =
      nodeColorShift === undefined
        ? (rgb) => rgb.map((e) => Math.round(Math.pow(e, 1.1)))
        : nodeColorShift;

    // let nodeGroups = d3.selectAll(".node");

    let nodeMap = {};
    let nodes = Array.from(nodeIds).map((e) => {
      let node = nodeGroups.select(`#${e}`).classed("focus", setFocused);
      nodeMap[parseInt(e.replace("node", ""))] = node;
      return node;
    });

    let currentFocused = d3.selectAll("circle.focus");
    if (currentFocused.length == 0) setFocused = false;

    // reset to default state
    nodeGroups
      .selectAll("circle")
      // .attr("fill", (d) => d.fill)
      .classed("focus", false);

    if (setFocused) {
      // fade out other nodes, recolor focused node
      nodeGroups.transition().duration(200).attr("opacity", focusFadeOpacity);

      currentFocused
        .attr("opacity", "1")
        // .attr("originalFill", (d, i) => {
        //   nodeMap[d.aid].attr("fill");
        // })
        // .attr("fill", (d, i) => {
        //   return utils.shiftColor(nodeMap[d.aid].attr("fill"), nodeColorShift);
        // })
        .classed("focus", true);
    } else {
      // restore opacity and color of all nodes
      nodeGroups.transition().duration(200).attr("opacity", "1");
    }
  }
}
export { ToolTip };
