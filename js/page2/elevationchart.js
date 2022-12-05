// elevationchart component in P2

import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => {});

if (L === undefined) L = leaflet;

/**
 * This class creates a stacked bar chart representing the number of avalanches at each elevation
 * for any given date.
 *
 */
class ElevationChart extends Component {
  /**
   *
   * @param {Page} page
   * @param {Array<utils.AvalancheData>} data
   * @param {bool} verbose
   */
  constructor(page, data, verbose = false) {
    super(page, data, verbose);

    this.log("Init ElevationChart");
    // Data processing
    this.dateIndexedData = this.data;

    //Convert string elevation to number
    this.dateIndexedData = this.data;

    // this.dateIndexedData = Array.from(d3.rollup(this.data, v => {
    //   let totalNumberOfAvalanches = 0;
    //   let avalanchesBelow8000ft = 0;
    //   let avalanchesBelow9500ft = 0;

    //   v.forEach((d) => {
    //     if (d.elevation < 8000) {
    //       avalanchesBelow8000ft += 1;
    //     }
    //     if (d.elevation < 9500) {
    //       avalanchesBelow9500ft += 1;
    //     }
    //     totalNumberOfAvalanches += 1;
    //   });

    //   return {
    //     totalNumberOfAvalanches: totalNumberOfAvalanches,
    //     avalanchesBelow8000ft: avalanchesBelow8000ft,
    //     avalanchesBelow9500ft: avalanchesBelow9500ft
    //   };
    // }, d => d.date));

    //converting back to array of objects
    // this.dateIndexedData = this.dateIndexedData.map((d) => {
    //   return {
    //     date: d[0],
    //     totalNumberOfAvalanches: d[1].totalNumberOfAvalanches,
    //     avalanchesBelow8000ft: d[1].avalanchesBelow8000ft,
    //     avalanchesBelow9500ft: d[1].avalanchesBelow9500ft
    //   };
    // });

    const aggBy = (func, prop) => (vals) =>
      R.reduce(
        (current, val) => R.evolve({ [prop]: func(val[prop]) }, current),
        R.head(vals),
        R.tail(vals)
      );

    const groupAggBy = R.curry((groupOn, aggOn, aggFunc, vals) =>
      R.values(R.map(aggBy(aggFunc, aggOn))(R.groupBy(groupOn, vals)))
    );

    this.dateIndexedData = groupAggBy(
      (d) => moment(d.date).week(),
      "elevation",
      R.append,
      R.sortBy((d) => d.date, this.data)
    );
    this.dateIndexedData = this.dateIndexedData.map((d) => {
      return {
        date: d.date,
        totalNumberOfAvalanches: d.elevation.length,
        avalanchesBelow8000ft: R.filter((e) => e < 8000, d.elevation).length,
        avalanchesAbove8000ft: R.filter(
          (e) => (e < 9500) & (e >= 8000),
          d.elevation
        ).length,
        avalanchesBelow9500ft: R.filter((e) => e > 9500, d.elevation).length,
      };
    });

    // Creating a list of all the dates in the data set + missing dates
    // let dates = d3.timeWeeks(d3.min(this.dateIndexedData, d => d.date), d3.max(this.dateIndexedData, d => d.date));

    // // Joining the dataset with the list of all dates
    // dates.forEach((d) => {
    //   if (!this.dateIndexedData.some((e) => e.date.getTime() === d.getTime())) {
    //     this.dateIndexedData.push({
    //       date: d,
    //       totalNumberOfAvalanches: 0,
    //       avalanchesBelow8000ft: 0,
    //       avalanchesAbove8000ft: 0,
    //       avalanchesAbove9500ft: 0
    //     });
    //   }
    // });

    // this.dateIndexedData.sort((a, b) => a.date - b.date);
    this.log(this.dateIndexedData);
  }
  async render(div) {
    super.render(div);
    this.log("Render ElevationChart");
    let margin = { top: 20, right: 20, bottom: 30, left: 50 };
    let dimensions = this.page.config.elevationchart;

    //Creating scales for bar chart
    let xScale = d3
      .scaleTime()
      .domain(d3.extent(this.dateIndexedData, (d) => d.date))
      .range([10, dimensions.width - margin.right]);

    let xBarScale = d3
      .scaleBand()
      .domain(this.dateIndexedData.map((d) => d.date))
      .range([10, dimensions.width - margin.right])
      .padding(0.1);

    let yScale = d3
      .scaleSymlog()
      .domain([
        0,
        d3.max(this.dateIndexedData, (d) => d.totalNumberOfAvalanches),
      ])
      .range([dimensions.height - margin.bottom, margin.top]);

    //Creating axes
    let xAxisLarge = d3.axisBottom(xScale).tickFormat(d3.timeFormat("%Y"));

    let xAxisMedium = d3
      .axisBottom(xScale)
      .ticks(156)
      .tickFormat(d3.timeFormat("%m/%Y"));

    let xAxisSmall = d3
      .axisBottom(xScale)
      .ticks(1200)
      .tickFormat(d3.timeFormat("%d/%m"));

    let yAxis = d3.axisLeft(yScale).tickFormat(d3.format(".1s"));

    /**
     * This function handles zooming in and out of the time selection component
     * @param {selection} svg
     */
    let zoom = function (svg) {
      let extent = [
        [0, 0],
        [dimensions.width, dimensions.height],
      ];

      svg.call(
        d3
          .zoom()
          .scaleExtent([1, 60])
          .translateExtent(extent)
          .extent(extent)
          .on("zoom", zoomed)
      );

      function zoomed(event) {
        xScale.range(
          [10, dimensions.width - margin.right].map((d) =>
            event.transform.applyX(d)
          )
        );
        if (event.transform.k < 10) {
          svg
            .selectAll(".elevation-bar")
            .attr("x", (d) => xScale(d.date))
            .attr("width", xBarScale.bandwidth());
          svg.selectAll("#ec-xaxis").call(xAxisLarge);
        } else if (event.transform.k >= 10 && event.transform.k <= 40) {
          svg
            .selectAll(".elevation-bar")
            .attr("x", (d) => xScale(d.date))
            .attr("width", 1);
          svg.selectAll("#ec-xaxis").call(xAxisMedium);
        } else if (event.transform.k > 40) {
          svg
            .selectAll(".elevation-bar")
            .attr("x", (d) => xScale(d.date))
            .attr("width", 4);
          svg.selectAll("#ec-xaxis").call(xAxisSmall);
        }
      }
    };

    let svg = this.div
      .append("svg")
      .attr("width", dimensions.width + margin.left + margin.right)
      .attr("height", dimensions.height + margin.top + margin.bottom)
      .call(zoom);

    let chart = svg
      .append("g")
      .attr("id", "elevationchart")
      .attr("transform", "translate(0, 0)");

    let allAvalanchesChart = chart
      .append("svg")
      .attr("width", dimensions.width)
      .attr("x", margin.left)
      .selectAll("rect")
      .data(this.dateIndexedData)
      .join("rect")
      .attr("x", (d) => xBarScale(d.date))
      .attr("y", (d) => yScale(d.totalNumberOfAvalanches))
      .attr("width", xBarScale.bandwidth())
      .attr("height", (d) => yScale(0) - yScale(d.totalNumberOfAvalanches))
      .attr("fill", "#D82E3F")
      .attr("class", "elevation-bar");

    let below9500ftChart = chart
      .append("svg")
      .attr("width", dimensions.width)
      .attr("x", margin.left)
      .selectAll("rect")
      .data(this.dateIndexedData)
      .join("rect")
      .attr("x", (d) => xBarScale(d.date))
      .attr("y", (d) => yScale(d.avalanchesBelow9500ft))
      .attr("width", xBarScale.bandwidth())
      .attr("height", (d) => yScale(0) - yScale(d.avalanchesBelow9500ft))
      .attr("fill", "#FEA135")
      .attr("class", "elevation-bar");

    let below8000ftChart = chart
      .append("svg")
      .attr("width", dimensions.width)
      .attr("x", margin.left)
      .selectAll("rect")
      .data(this.dateIndexedData)
      .join("rect")
      .attr("x", (d) => xBarScale(d.date))
      .attr("y", (d) => yScale(d.avalanchesBelow8000ft))
      .attr("width", xBarScale.bandwidth())
      .attr("height", (d) => yScale(0) - yScale(d.avalanchesBelow8000ft))
      .attr("fill", "#3581D8")
      .attr("class", "elevation-bar");

    chart
      .append("g")
      .append("svg")
      .attr("width", dimensions.width)
      .attr("x", margin.left)
      .attr("transform", `translate(0, ${dimensions.height - margin.bottom})`)
      .attr("id", "ec-xaxis")
      .call(xAxisLarge);

    chart
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("id", "ec-yaxis")
      .call(yAxis);

    chart
      .append("text")
      .attr(
        "transform",
        `translate(${dimensions.width / 2}, ${dimensions.height})`
      )
      .style("text-anchor", "middle")
      .text("Date");

    chart
      .append("text")
      .attr(
        "transform",
        `translate(${margin.left / 2}, ${dimensions.height / 2}) rotate(-90)`
      )
      .style("text-anchor", "middle")
      .text("Number of avalanches");

    chart
      .append("text")
      .attr("transform", `translate(${dimensions.width / 2}, ${margin.top})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Number of Avalanches by Elevation per Week");

    //Legend
    let legend = chart
      .append("g")
      .attr("transform", `translate(${dimensions.width - 100}, ${margin.top})`);

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "#D82E3F");

    legend.append("text").attr("x", 15).attr("y", 10).text(">9500ft");

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 20)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "#FEA135");

    legend.append("text").attr("x", 15).attr("y", 30).text("8000ft to 9500ft");

    legend
      .append("rect")
      .attr("x", 0)
      .attr("y", 40)
      .attr("width", 10)
      .attr("height", 10)
      .attr("fill", "#3581D8");

    legend.append("text").attr("x", 15).attr("y", 50).text("<8000ft");
  }
}
export { ElevationChart };
