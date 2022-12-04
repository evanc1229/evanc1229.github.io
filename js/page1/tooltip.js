// tooltip component in P1

import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
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

  toggle_pin() {
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
      .on("click", () => this.toggle_pin());

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
      return;
    }

    let d = d3.filter(this.parent.data, (d) => d.aid == aidFocus)[0];

    // pass if focus cant be found
    if (d === undefined) return;

    this.tooltipGroup.style("display", "block");
    let tooltipX = this.loc.x + this.config.offsetX;
    let tooltipY = this.loc.y + this.config.offsetY;

    let victim_str = [...Object.keys(d.victim_status)].filter(e=>d.victim_status[e].length>0).map(e=>`${e}:${d.victim_status[e]}`).join('|')
    let tooltipTextString =
      `Avalanche ${d.aid} occured on ${d.date} in ${d.region} ` +
      (victim_str.length ? `with the victim being ${victim_str}`:"\nThe victim was unharmed");

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
    })();
  }

  init_tooltips(nodes) {
    let rectOpacity = 0.8;
    let rectWidth = 180;
    let rectHeight = 120;
    let tooltipOffsetY = 16;
    let tooltipOffsetX = 0;
    let focusFadeOpacity = 0.9;
    let nodeColorShift = (rgb) => rgb.map((e) => Math.round(Math.pow(e, 1.1)));

    // let nodeGroups = svg.selectAll(".gp-node");
    // let nodeGroups = svg.selectAll(".gp-node");

    // init tooltip structure
    let tooltipGroup = nodes
      .append("g")
      .classed("gp-tt", true)
      .attr("id", (d) => `gp-tt${d.aid}`);

    let tooltipRect = tooltipGroup
      .append("rect")
      .attr("id", (d) => `ttRect${d.aid}`)
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 0)
      .attr("height", 0)
      .attr("rx", "20")
      .attr("ry", "20")
      .attr("opacity", "0")
      .attr("stroke", "black")
      .attr("fill", "white");

    var tooltipText = tooltipGroup
      .append("text")
      .text((d) => ``)
      .attr("x", 0)
      .attr("y", 0)
      .attr("id", (d) => `ttText${d.aid}`)
      // .attr("text-anchor", "middle")
      .attr("opacity", 0);

    const getTooltip = (nodeId) => {
      nodeId = nodeId.split("node")[1];
      let nodeGroup = d3.select(`#node${nodeId}`);
      let tooltipRect = nodeGroup.select("rect");
      let tooltipText = nodeGroup.select("text");
      return [nodeGroup, tooltipRect, tooltipText];
    };

    // trigger functions for mouseover and mouseout
    const tooltipMouseover = (e) => {
      let nodeCircle = d3.select(e.target);
      let [nGroup, ttRect, ttText] = getTooltip(nodeCircle.attr("id"));

      let d;
      try {
        d = ttText.datum();
      } catch (e) {
        console.log(e);
        return;
      }

      let x = parseFloat(nodeCircle.attr("cx")) + tooltipOffsetX;
      let y = parseFloat(nodeCircle.attr("cy")) + tooltipOffsetY;
      let fill = nodeCircle.attr("fill");

      // try {
      //   category = ttText.datum().category;
      //   phrase = this.toTitleCase(ttText.datum().phrase);
      //   party = ttText.datum().party;
      //   lean_perc = ttText.datum().lean_perc;
      //   speech_perc = ttText.datum().speech_perc;
      // } catch (error) {
      //   return;
      // }

      // adjust x value based on the side of the bubble chart we're on
      // if (party == "R") {
      //   x += -2 * tooltipOffsetX + -rectWidth;
      // }

      // if (!this.state.brushing)
      // this.setFocusNodes([nodeCircle.attr("id")], true, focusFadeOpacity);

      nodes
        .transition()
        .duration(200)
        .attr("opacity", (d) =>
          d.id == nodeCircle.attr("id").replace("node", "")
            ? 1
            : focusFadeOpacity
        )
        .select(`#${nodeCircle.attr("id")}`);
      // .attr("fill", utils.shiftColor(fill, nodeColorShift));

      // make tooltip rect and text appear
      ttRect
        .attr("x", x)
        .attr("y", y)
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("stroke-width", 2)
        .transition()
        .duration(200)
        .attr("opacity", rectOpacity);

      ttText
        .attr("x", x + rectWidth / 2)
        .attr("y", y)
        .transition()
        .duration(200)
        .text(`Hello from node:${d.aid}`)
        .attr("opacity", "1");

      // // absolutely unreasonable amount of code to populate a tooltip with structured text
      // if (phrase.includes("/")) {
      //   phrase = this.rsplit(phrase, "/", 1);
      // } else {
      //   let phrase_split = this.rsplit(phrase, " ", 1);
      //   if (phrase_split.length == 1) phrase = [phrase, undefined];
      //   else phrase = phrase_split;
      // }
      // let lines = [
      //   {
      //     html: phrase[0],
      //     fontSize: 16,
      //     style: "font-weight: bold;",
      //     gap: phrase[1] === undefined ? 12 : 8,
      //   },
      //   {
      //     html: phrase[1],
      //     fontSize: 16,
      //     style: "font-weight: bold;",
      //     gap: 12,
      //   },
      //   {
      //     html: `${party}+ ${lean_perc}%`,
      //     fontSize: 14,
      //     style: "",
      //     gap: 8,
      //   },
      //   {
      //     html: `In ${speech_perc}% of speeches`,
      //     fontSize: 12,
      //     style: "",
      //     gap: 8,
      //   },
      // ];
      // var dy = 12;
      // lines.forEach((l, i) => {
      //   if (l.html !== undefined) {
      //     dy += l.fontSize;
      //     ttText
      //       .append("tspan")
      //       .html(l.html)
      //       .attr("x", ttText.attr("x"))
      //       .attr("y", ttText.attr("y"))
      //       .attr("dy", `${parseInt(dy)}px`)
      //       .attr("opacity", "1")
      //       .attr("style", `font-size: ${l.fontSize}pt;` + l.style);
      //   }
      //   dy += l.gap;
      // });

      // raise this node group above the others
      nGroup.raise();
    };

    const tooltipMouseout = (e) => {
      let nodeCircle = d3.select(e.target);
      let [nGroup, ttRect, ttText] = getTooltip(nodeCircle.attr("id"));

      // if (!this.DEBUG.tooltip) {
      // hide text and rect, delete tspans
      ttText.transition().duration(100).attr("opacity", "0");
      ttText.attr("x", 0).attr("y", 0);
      ttRect.transition().duration(100).attr("opacity", "0");
      ttRect.attr("x", 0).attr("y", 0).attr("width", 0).attr("height", 0);
      ttText.selectAll("tspan").remove();
      // }

      // if (!this.state.brushing)
      // this.setFocusNodes([nodeCircle.attr("id")], false);
    };

    this.tooltipMouseover = tooltipMouseover;
    this.tooltipMouseout = tooltipMouseout;

    // nodeGroups
    //   .selectAll("circle")
    //   .on("mouseover", tooltipMouseover)
    //   .on("mouseout", tooltipMouseout);
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

  /**
   *
   * @param {d3.Selection} div
   */
  async _render(div) {
    // super.render(div);
    // let svg = div.append("svg")
    // .attr("width", `100%`)
    // .attr("height", "100%")
    // .classed("container-svg", true);
    // let s = new Set(this.page.getSelection())
    // this.data = d3.filter(this.baseData, d=>s.has(d.aid));
    // let nodeGroups = svg.selectAll('g')
    //                .data(this.data)
    //                .join("g")
    //                .attr("id", (d) => {
    //                   // console.log('A', d);
    //                   return `gp-node${d.aid}`;
    //                })
    //                 .classed("gp-node", true);
    // let nodes = nodeGroups
    //                 .append("circle")
    //                 .attr("id", (d) => `node${d.aid}`)
    //                 .attr("r", (d) => 5)
    //                 .attr("cx", (d) => d.aid*3)
    //                 .attr("cy", (d) => d.aid*4)
    //                 // .attr("category", (d) => d.category)
    //                 .attr("stroke", "black")
    //                 .attr("stroke-width", 1)
    //                 .attr("fill", (d) => 'red')
    // First, select the element that you want to add the tooltip to
    // const element = d3.select("#tooltip").append("button").text("hello there");
    // // Next, create the tooltip using the `tooltip` function
    // const tooltip = d3
    //   .select("body")
    //   .append("div")
    //   .attr("class", "tooltip-div")
    //   .style("opacity", 0)
    //   .raise();
    // // Then, add an event listener to the element to show the tooltip on hover
    // element
    //   .on("mouseover", () => {
    //     tooltip.transition().duration(200).style("opacity", 1);
    //   })
    //   .on("mouseout", () => {
    //     // tooltip
    //     //   .transition()
    //     //   .duration(200)
    //     //   .style('opacity', 0);
    //   })
    //   .on("mousemove", (e) => {
    //     let target = d3.select(e.target);
    //     let dims = utils.getDimensions(target);
    //     tooltip
    //       .style("position", "absolute")
    //       .style("top", `${dims.y + 10}px`)
    //       .style("left", `${dims.x + 10}px`)
    //       .text("My tooltip text")
    //       .raise();
    //   });
    // this.drawbubble();
  }

  drawbubble() {
    let data = this.data;

    let parseFeetFromString = (x) =>
      parseFloat(
        x.slice(0, x.length - 1).replace(",", "") / (x.endsWith('"') ? 12 : 1)
      );

    let svg2 = this.div
      .append("svg")
      .attr("width", this.dimensions.width + 100)
      .attr("height", this.dimensions.height + 100)
      .attr("id", "tooltip_svg");
    //let sortedWidth = widthData.sort(d3.ascending)
    Array.from(["elevation", "width", "vertical"]).reduce((obj, k) => {
      let dk1 = data.map((d) => parseFeetFromString(d[k]));
      let toRemove = [0];
      let dk = dk1.filter(function (el) {
        return !toRemove.includes(el);
      });
      dk.sort(d3.ascending);
      this.log(dk);
      obj[k] = {
        q1: d3.quantile(dk, 0.25),
        q2: d3.quantile(dk, 0.5),
        q3: d3.quantile(dk, 0.75),
      };
      this.log(obj[k].q1);
      this.log(obj[k].q2);
      this.log(obj[k].q3);
      let interQuantileRange = obj[k].q3 - obj[k].q1;
      let min = obj[k].q1 - 1.5 * interQuantileRange;
      let max = obj[k].q3 + 1.5 * interQuantileRange;
      this.log(interQuantileRange);
      this.log(min);
      this.log(max);

      // Show the X scale
      var x = d3
        .scaleBand()
        .range([0, this.dimensions.width])
        .domain(["elevation", "width", "vertical"])
        .paddingInner(1)
        .paddingOuter(0.5);
      svg2
        .append("g")
        .attr("transform", "translate(0," + this.dimensions.height + ")")
        .call(
          d3
            .axisBottom(x)
            .tickValues(x.domain())
            .tickSizeOuter(0)
            .tickSizeInner(0)
        );

      // Show the Y scale
      var y = d3
        .scaleLinear()
        .domain([min - 10, max + 10])
        .range([this.dimensions.height, 0]);
      svg2
        .append("g")
        .call(
          d3
            .axisLeft(y)
            .tickValues(y.domain())
            .tickSizeOuter(0)
            .tickSizeInner(0)
        );

      // Show the main vertical line
      svg2
        .selectAll("vertLines")
        .data(dk)
        .enter()
        .append("line")
        .attr("x1", function (d) {
          return x(k);
        })
        .attr("x2", function (d) {
          return x(k);
        })
        .attr("y1", function (d) {
          return y(min);
        })
        .attr("y2", function (d) {
          return y(max);
        })
        .attr("stroke", "black")
        .style("width", 40);

      // Show the box
      var boxWidth = 100;
      svg2
        .selectAll("boxes")
        .data(dk)
        .enter()
        .append("rect")
        .attr("x", function (d) {
          return x(k) - boxWidth / 2;
        })
        .attr("y", function (d) {
          return y(obj[k].q3);
        })
        .attr("height", function (d) {
          return y(obj[k].q1) - y(obj[k].q3);
        })
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .style("fill", "#69b3a2");

      svg2
        .selectAll("toto")
        .data([min, obj[k].q2, max])
        .enter()
        .append("line")
        .attr("x1", function (d) {
          return x(k) - boxWidth / 2;
        })
        .attr("x2", function (d) {
          return x(k) + boxWidth / 2;
        })
        .attr("y1", function (d) {
          return y(d);
        })
        .attr("y2", function (d) {
          return y(d);
        })
        .attr("stroke", "black");

      svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) {
          return x(k) - 50;
        })
        .attr("y", function (d) {
          return y(min);
        })
        .style("fill", "black")
        .text(function (d) {
          return Math.trunc(min);
        });

      svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) {
          return x(k) - 50;
        })
        .attr("y", function (d) {
          return y(max) + 13;
        })
        .style("fill", "black")
        .text(function (d) {
          return Math.trunc(max);
        });

      svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) {
          return x(k) - 50;
        })
        .attr("y", function (d) {
          return y(obj[k].q2);
        })
        .style("fill", "black")
        .text(function (d) {
          return Math.trunc(obj[k].q2);
        });

      svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) {
          return x(k) - 50;
        })
        .attr("y", function (d) {
          return y(obj[k].q1);
        })
        .style("fill", "black")
        .text(function (d) {
          return Math.trunc(obj[k].q1);
        });

      svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) {
          return x(k) - 50;
        })
        .attr("y", function (d) {
          return y(obj[k].q3);
        })
        .style("fill", "black")
        .text(function (d) {
          return Math.trunc(obj[k].q3);
        });

      var jitterWidth = 50;

      svg2
        .selectAll("indPoints")
        .data(dk)
        .enter()
        .append("circle")
        .attr("cx", function (d) {
          return x(k);
        })
        .attr("cy", function (d) {
          return y(dk[3000]);
        })
        .attr("r", 5)
        .style("fill", "white")
        .attr("stroke", "black");

      svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) {
          return x(k) + 10;
        })
        .attr("y", function (d) {
          return y(dk[3000]);
        })
        .style("fill", "black")
        .text(function (d) {
          return Math.trunc(dk[3000]);
        });

      return obj;
    }, {});
  }
}
export { ToolTip };
