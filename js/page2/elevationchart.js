// elevationchart component in P2

import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => { });

if (L === undefined) L = leaflet;

/**
 * This class creates a stacked bar chart representing the number of avalanches at each elevation
 * for any given date.
 * 
 * INSPIRED BY: https://bl.ocks.org/LemoNode/5a64865728c6059ed89388b5f83d6b67
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
    let parseFeetFromString = x => parseFloat(x.substring(0, x.length - 1).replace(',', '') / (x.endsWith('"') ? 12 : 1));
    this.dateIndexedData = this.data.forEach((d) => d.elevation = parseFeetFromString(d.elevation));

    this.dateIndexedData = Array.from(d3.rollup(this.data, v => {
      let totalNumberOfAvalanches = v.length;
      let avalanchesBelow8000ft = 0;
      let avalanchesAbove8000ft = 0;
      let avalanchesAbove9500ft = 0;

      if (totalNumberOfAvalanches == 0) return {
        totalNumberOfAvalanches: 0,
        avalanchesBelow8000ft: 0,
        avalanchesAbove8000ft: 0,
        avalanchesAbove9500ft: 0
      };

      v.forEach((d) => {
        if (d.elevation <= 8000) {
          avalanchesBelow8000ft += 1;
        } else if (d.elevation <= 9500 && d.elevation > 8000) {
          avalanchesAbove8000ft += 1;
        } else if (d.elevation > 9500) {
          avalanchesAbove9500ft += 1;
        } else {
          this.log(`Error in elevation calculation. Could not process the elevation of ${d.elevation} of type ${typeof (d.elevation)}`);
        }
      });

      return {
        totalNumberOfAvalanches: totalNumberOfAvalanches,
        avalanchesBelow8000ft: avalanchesBelow8000ft,
        avalanchesAbove8000ft: avalanchesAbove8000ft,
        avalanchesAbove9500ft: avalanchesAbove9500ft
      };
    }, d => d.date));

    //converting back to array of objects
    this.dateIndexedData = this.dateIndexedData.map((d) => {
      return {
        date: d[0],
        totalNumberOfAvalanches: d[1].totalNumberOfAvalanches,
        avalanchesBelow8000ft: d[1].avalanchesBelow8000ft,
        avalanchesAbove8000ft: d[1].avalanchesAbove8000ft,
        avalanchesAbove9500ft: d[1].avalanchesAbove9500ft
      };
    });

    this.dateIndexedData.sort((a, b) => a.date - b.date);

    this.log(this.dateIndexedData);
  }
  async render(div) {
    super.render(div);
    this.log("Render ElevationChart");
    let margin = { top: 20, right: 20, bottom: 30, left: 50 };
    let dimensions = this.page.dimensions.elevationchart;
    let location = this.page.positions.elevationchart;
    this.log(dimensions, location);

    //Creating scales for bar chart
    let xScale = d3.scaleTime()
      .domain(d3.extent(this.dateIndexedData, d => d.date))
      .range([10, dimensions.width - margin.right]);

    let xBarScale = d3.scaleBand()
      .domain(this.dateIndexedData.map(d => d.date))
      .range([10, dimensions.width - margin.right])
      .padding(.1);

    let yScale = d3.scaleSymlog()
      .domain([0, d3.max(this.dateIndexedData, d => d.totalNumberOfAvalanches)])
      .range([dimensions.height - margin.bottom, margin.top]);

    //Creating axes
    let xAxisLarge = d3.axisBottom(xScale)
      .tickFormat(d3.timeFormat("%Y"));

    let xAxisMedium = d3.axisBottom(xScale)
      .ticks(156)
      .tickFormat(d3.timeFormat("%m/%Y"));

    let xAxisSmall = d3.axisBottom(xScale)
      .ticks(1200)
      .tickFormat(d3.timeFormat("%d/%m"));

    let yAxis = d3.axisLeft(yScale)
      .tickFormat(d3.format(".1s"));
    
    let svg = this.div
      .append('svg')
      .attr('width', dimensions.width + margin.left + margin.right)
      .attr('height', dimensions.height + margin.top + margin.bottom);

    let chart = svg
      .append("g")
      .attr('id', 'elevationchart')
      .attr("transform", `translate(${location.x}, ${location.y})`);

    chart
      .append('svg')
      .attr('width', dimensions.width)
      .attr('x', margin.left)
      .selectAll("rect")
      .data(this.dateIndexedData)
      .join('rect')
      .attr('x', d => xBarScale(d.date))
      .attr('y', d => yScale(d.totalNumberOfAvalanches))
      .attr('width', xBarScale.bandwidth())
      .attr('height', d => yScale(0) - yScale(d.totalNumberOfAvalanches))
      .attr('fill', 'steelblue');

      // .join(enter => {

      //   //Under 8000ft
      //   enter
      //     .append("rect")
      //     .attr("x", d => xBarScale(d.date))
      //     .attr("y", d => yScale(d.avalanchesBelow8000ft))
      //     .attr("width", xBarScale.bandwidth())
      //     .attr("height", d => yScale(0) - yScale(d.avalanchesBelow8000ft))
      //     .attr("fill", "#1f77b4");

      //   //8000ft to 9500ft
      //   enter
      //     .append("rect")
      //     .attr("x", d => xBarScale(d.date))
      //     .attr("y", d => yScale(d.avalanchesBelow8000ft + d.avalanchesAbove8000ft))
      //     .attr("width", xBarScale.bandwidth())
      //     .attr("height", d => yScale(d.avalanchesBelow8000ft) - yScale(d.avalanchesBelow8000ft + d.avalanchesAbove8000ft))
      //     .attr("fill", "#ff7f0e");

      //   //Above 9500ft
      //   enter
      //     .append("rect")
      //     .attr("x", d => xBarScale(d.date))
      //     .attr("y", d => yScale(d.totalNumberOfAvalanches))
      //     .attr("width", xBarScale.bandwidth())
      //     .attr("height", d => yScale(d.avalanchesBelow8000ft + d.avalanchesAbove8000ft) - yScale(d.totalNumberOfAvalanches))
      //     .attr("fill", "#d62728");

      //   return enter;
      // });


    chart
      .append("g")
      .append('svg')
      .attr('width', dimensions.width)
      .attr('x', margin.left)
      .attr("transform", `translate(0, ${dimensions.height - margin.bottom})`)
      .attr("id", "dc-xaxis")
      .call(xAxisLarge);

    chart
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .attr("id", "dc-yaxis")
      .call(yAxis);


    chart
      .append("text")
      .attr("transform", `translate(${dimensions.width / 2}, ${dimensions.height})`)
      .style("text-anchor", "middle")
      .text("Date");

    chart
      .append("text")
      .attr("transform", `translate(${margin.left / 2}, ${dimensions.height / 2}) rotate(-90)`)
      .style("text-anchor", "middle")
      .text("Average Depth (ft)");

    chart
      .append("text")
      .attr("transform", `translate(${dimensions.width / 2}, ${margin.top})`)
      .style("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Average Depth of Avalanches by Year");
  }
}
export { ElevationChart };