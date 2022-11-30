// depthchart component in P2

import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";



class DepthChart extends Component {
    /**
     * 
     * @param {Page} page
     * @param {Array<utils.AvalancheData>} data 
     * @param {bool} verbose 
     */
    constructor(page, data, verbose = false) {
        super(page, data, verbose);
        this.page = page
        this.dimensions = {};
        this.data = data;
        this.verbose = verbose
    }
    async render(div) {
        super.render(div)
        this.drawChart();
    }

    drawChart() {
        let data = this.data;
        let svg = this.div
            .append('svg')
            .attr('width', this.dimensions.width + 50)
            .attr('height', this.dimensions.height + 50)
            .append("g");


        //let parseDate = d3.timeParse("%-m/%-d/%-Y");
        let parseFeetFromString = x => parseFloat(x.slice(0, x.length - 1).replace(',', '') / (x.endsWith('"') ? 12 : 1));

        let dateFormater = d3.timeFormat("%Y");


        data.forEach((d) => d.depth = parseFeetFromString(d.depth));

        data.sort((a, b) => a.date - b.date);

        let x = d3.scaleTime()
            .domain(d3.extent(data.map((d) => d.date)))
            .range([50, this.dimensions.width]);

        let y = d3.scaleLinear()
            .domain(d3.extent(data,(d) => d.depth))
            .range([this.dimensions.height, 50]);

        let xAxis = d3.axisBottom()
            .scale(x)
            .tickFormat(dateFormater);

        let yAxis = d3.axisRight()
            .scale(y);

        let line = d3.line()
            .x((d) => x(d.date))
            .y((d) => y(d.depth));
        console.log(data);

        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + this.dimensions.height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)
            .append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", 6)
            .attr("dy", ".71em")
            .style("text-anchor", "end")
            .text("Depth (inches)");

        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line)
            .on("mouseover", function (e, d) {
                tool.transition()
                    .duration(200)
                    .style("opacity", .9);
                tool.html("Date: " + d.date + "<br/>" + "Depth: " + d.depth + " ft")
                    .style("left", d3.select(this).attr("cx") + "px")
                    .style("top", d3.select(this).attr("cy") + "px");
            })
            .on("mouseout", function (d) {
                tool.transition()
                    .duration(500)
                    .style("opacity", 0);
            });


        let tool = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "black")
            .style("color", "white");

    }

}
export { DepthChart };