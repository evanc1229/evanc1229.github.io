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

        // Data processing
        let parseFeetFromString = x => parseFloat(x.slice(0, x.length - 1).replace(',', '') / (x.endsWith('"') ? 12 : 1));
        this.dateIndexedData = data.forEach((d) => d.depth = parseFeetFromString(d.depth));

        this.dateIndexedData = Array.from(d3.rollup(this.data, v => {
            let total = 0;
            let length = v.length;

            if (length == 0) return 0;

            v.forEach((d) => {
                total += d.depth;
            });

            return total / length;
        }, d => d.date));

        //converting back to array of objects
        this.dateIndexedData = this.dateIndexedData.map((d) => {
            return {
                date: d[0],
                depth: d[1]
            };
        });

        this.dateIndexedData.sort((a, b) => a.date - b.date);
    }
    async render(div) {
        super.render(div)
        this.drawChart();
    }

    drawChart() {
        let dateFormater = d3.timeFormat("%Y");
        console.log(this.dateIndexedData);
        let svg = this.div
            .append('svg')
            .attr('width', this.dimensions.width + 50)
            .attr('height', this.dimensions.height + 50)
            .append("g");

        let x = d3.scaleTime()
            .domain(d3.extent(this.dateIndexedData.map((d) => d.date)))
            .range([50, this.dimensions.width]);

        let y = d3.scaleLinear()
            .domain(d3.extent(this.dateIndexedData, (d) => d.depth))
            .range([this.dimensions.height, 50]);

        let xAxis = d3.axisBottom()
            .scale(x)
            .tickFormat(dateFormater);

        let yAxis = d3.axisRight()
            .scale(y);

        let line = d3.line()
            .x((d) => x(d.date))
            .y((d) => y(d.depth));

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
            .datum(this.dateIndexedData)
            .attr("class", "line")
            .attr("d", line);


        let tool = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("background-color", "black")
            .style("color", "white");

    }

}
export { DepthChart };