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
        this.log("Init DepthChart");

        // Data processing
        let parseFeetFromString = x => parseFloat(x.slice(0, x.length - 1).replace(',', '') / (x.endsWith('"') ? 12 : 1));
        this.dateIndexedData = this.data.forEach((d) => d.depth = parseFeetFromString(d.depth));

        this.dateIndexedData = Array.from(d3.rollup(this.data, v => {
            let total = 0;
            let count = 0;
            let length = v.length;

            if (length == 0) return [0, 0];

            v.forEach((d) => {
                total += d.depth;
                count += 1;
            });
            return [total / length, count];
        }, d => d.date));

        //converting back to array of objects
        this.dateIndexedData = this.dateIndexedData.map((d) => {
            return {
                date: d[0],
                depth: d[1][0],
                count: d[1][1]
            };
        });

        this.dateIndexedData.sort((a, b) => a.date - b.date);
    }
    async render(div) {
        super.render(div)
        this.log("Render DepthChart");
        let margin = { top: 20, right: 20, bottom: 30, left: 50 };
        let dimensions = this.page.dimensions.depthchart;
        let location = this.page.positions.depthchart;
        this.log(dimensions, location);

        //Creating scales for bar chart
        let xScale = d3.scaleTime()
            .domain(d3.extent(this.dateIndexedData, d => d.date))
            .range([10, dimensions.width - margin.right]);

        let xBarScale = d3.scaleBand()
            .domain(this.dateIndexedData.map(d => d.date))
            .range([10, dimensions.width - margin.right])
            .padding(0.1);

        let yScale = d3.scaleSymlog()
            .domain([0, d3.max(this.dateIndexedData, d => d.depth)])
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

        /**
        * This function handles zooming in and out of the time selection component
        * @param {selection} svg 
        */
        let zoom = function (svg) {
            let extent = [
                [0, 0],
                [dimensions.width, dimensions.height]
            ];

            svg.call(d3.zoom()
                .scaleExtent([1, 60])
                .translateExtent(extent)
                .extent(extent)
                .on("zoom", zoomed));

            function zoomed(event) {
                xScale.range([10, dimensions.width - margin.right].map(d => event.transform.applyX(d)));
                if (event.transform.k < 10) {
                    svg.selectAll(".depth-bar").attr("x", d => xScale(d.date)).attr("width", xBarScale.bandwidth());
                    svg.selectAll("#dc-xaxis").call(xAxisLarge);
                }
                else if (event.transform.k >= 10 && event.transform.k <= 40) {
                    svg.selectAll(".depth-bar").attr("x", d => xScale(d.date)).attr("width", 1);
                    svg.selectAll("#dc-xaxis").call(xAxisMedium);
                }
                else if (event.transform.k > 40) {
                    svg.selectAll(".depth-bar").attr("x", d => xScale(d.date)).attr("width", 8);
                    svg.selectAll("#dc-xaxis").call(xAxisSmall);
                }
            }
        }

        let svg = this.div
            .append('svg')
            .attr('width', dimensions.width + margin.left + margin.right)
            .attr('height', dimensions.height + margin.top + margin.bottom)
            .call(zoom);

        let chart = svg
            .append("g")
            .attr('id', 'depthchart')
            .attr("transform", `translate(${location.x}, ${location.y})`);

        chart
            .append('svg')
            .attr('width', dimensions.width)
            .attr('x', margin.left)
            .selectAll("rect")
            .data(this.dateIndexedData)
            .join("rect")
            .attr("x", d => xScale(d.date))
            .attr("y", d => yScale(d.depth))
            .attr("width", xBarScale.bandwidth())
            .attr("height", d => yScale(0) - yScale(d.depth))
            .attr("fill", "steelblue")
            .classed("depth-bar", true);

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

        this.log("Rendered DepthChart");
    }

}
export { DepthChart };