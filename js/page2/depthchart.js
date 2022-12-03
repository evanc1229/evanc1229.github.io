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
        this.data = data;

        // Data processing
        let parseFeetFromString = x => parseFloat(x.slice(0, x.length - 1).replace(',', '') / (x.endsWith('"') ? 12 : 1));
        this.dateIndexedData = this.data.forEach((d) => d.depth = parseFeetFromString(d.depth));

        this.dateIndexedData = Array.from(d3.rollup(this.data, v => {
            let total = 0;
            let count = 0;
            let length = v.length;

            if (length == 0) return [0,0];

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
        this.log(this.dateIndexedData);
        let margin = { top: 20, right: 20, bottom: 30, left: 50 };
        let dimensions = this.page.dimensions.depthchart;
        let location = this.page.positions.depthchart;
        this.log(dimensions, location);
        
        //Creating scales for bar chart
        let x = d3.scaleTime()
            .domain(d3.extent(this.dateIndexedData, d => d.date))
            .range([margin.left, dimensions.width - margin.right]);
        
        let xBar = d3.scaleBand()
            .domain(this.dateIndexedData.map(d => d.date))
            .range([margin.left, dimensions.width - margin.right])
            .padding(0.1);
        
        let y = d3.scaleSymlog()
            .domain([0, d3.max(this.dateIndexedData, d => d.depth)])
            .range([dimensions.height - margin.bottom, margin.top]);

        let svg = this.div
            .append('svg')
            .attr('width', dimensions.width + margin.left + margin.right)
            .attr('height', dimensions.height + margin.top + margin.bottom)
        
        let chart = svg
            .append("g")
            .attr('id', 'depthchart')
            .attr("transform", `translate(${location.x}, ${location.y})`);
        
        let xAxis = d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%Y"));
        
        let yAxis = d3.axisLeft(y)
            .tickFormat(d3.format(".1s"));
        
        chart
            .append("g")
            .attr("transform", `translate(0, ${dimensions.height - margin.bottom})`)
            .call(xAxis);
        
        chart
            .append("g")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis);

        chart
            .append("text")
            .attr("transform", `translate(${dimensions.width / 2}, ${dimensions.height})`)
            .style("text-anchor", "middle")
            .text("Year");
        
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

        chart
            .selectAll("rect")
            .data(this.dateIndexedData)
            .join("rect")
            .attr("x", d => xBar(d.date))
            .attr("y", d => y(d.depth))
            .attr("width", xBar.bandwidth())
            .attr("height", d => y(0) - y(d.depth))
            .attr("fill", "steelblue");
            
        









    }

}
export { DepthChart };