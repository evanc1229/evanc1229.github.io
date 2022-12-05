// time selection component in P1 and P2
import * as utils from "./utils.js";
import { Page, Component } from "./prototype.js";

/**
 *  This class creates a time selection component
 */
class TimeSelect extends Component {
    /**
     * This constructor creates a time selection component with the upper left corner at (x,y)
     * and a specified width and height. If no dimesions are specified, the default is (0,0)
     * for x,y and 500x500 for width and height.
     * 
     * @param {Page} page
     * @param {Array<utils.AvalancheData>} data 
     * @param {bool} verbose
     */
    constructor(page, data, verbose = false, flipped = false) {
        super(page, data, verbose)

        this.aidSelection = this.data.map(d=>d.aid);
        this.page.setSelection(this.aidSelection);

        this.margin_bottom = 18;
        this.margin_left = 15;

        //Grouping the data by length per date and convert to an array of objects
        this.dateIndexedData = Array.from(d3.rollup(this.data, v => {
            let aids = [];
            v.forEach(d => aids.push(d.aid));
            return [v.length, aids];
        }, d => d.date));

        //Converting this.dateIndexedData back to a list of objects
        this.dateIndexedData = this.dateIndexedData.map((d) => {
            return {
                date: (d[0]),
                aids: d[1][1],
                count: d[1][0]
            };
        });

        // Creating a list of all the dates in the data set + missing dates
        let dates = d3.timeDays(d3.min(this.dateIndexedData, d => d.date), d3.max(this.dateIndexedData, d => d.date));

        // Joining the dataset with the list of all dates
        dates.forEach((d) => {
            if (!this.dateIndexedData.some((e) => e.date.getTime() === d.getTime())) {
                this.dateIndexedData.push({ date: d, aids: [], count: 0 });
            }
        });

        // Sorting the data by date
        this.dateIndexedData = this.dateIndexedData.sort((a, b) => a.date - b.date);
    }

    /**
     * This method draws the time selection component in the div specified
     * 
     * @param {d3.Selection} div 
     */
    async render(div) {
        super.render(div);
        let dimensions = this.dimensions;
        let margin_left = this.margin_left;

        //Creating scales
        let xScale = d3.scaleTime()
            .domain(d3.extent(this.dateIndexedData, d => d.date))
            .range([this.margin_left * 2, this.dimensions.width - this.margin_left]);

        //Using sysmlog scale to make the bars more visible and because zero is a part of the dataset 
        let yScale = d3.scaleSymlog()
            .domain([0, d3.max(this.dateIndexedData, d => d.count)]) //Square root scale to make the graph more readable
            .range([this.dimensions.height - this.margin_bottom, 0]);

        let xBarScale = d3.scaleBand()
            .domain(this.dateIndexedData.map(d => d.date))
            .range([this.margin_left * 2, this.dimensions.width - this.margin_left])
            .padding(0.1);

        //Creating axes
        let xAxisLarge = d3.axisBottom(xScale)
            .ticks(13)
            .tickFormat(d3.timeFormat("%Y"));

        let xAxisMedium = d3.axisBottom(xScale)
            .ticks(156)
            .tickFormat(d3.timeFormat("%m/%Y"));

        let xAxisSmall = d3.axisBottom(xScale)
            .ticks(1200)
            .tickFormat(d3.timeFormat("%d/%m"));

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
                xScale.range([margin_left * 2, dimensions.width - margin_left].map(d => event.transform.applyX(d)));
                if (event.transform.k < 10) {
                    svg.selectAll(".ts-bar").attr("x", d => xScale(d.date)).attr("width", xBarScale.bandwidth());
                    svg.selectAll("#ts-xaxis").call(xAxisLarge);
                }
                else if (event.transform.k >= 10 && event.transform.k <= 40) {
                    svg.selectAll(".ts-bar").attr("x", d => xScale(d.date)).attr("width", 1);
                    svg.selectAll("#ts-xaxis").call(xAxisMedium);
                }
                else if (event.transform.k > 40) {
                    svg.selectAll(".ts-bar").attr("x", d => xScale(d.date)).attr("width", 8);
                    svg.selectAll("#ts-xaxis").call(xAxisSmall);
                }
            }
        }

        //Creating svg to hold the time selection component
        let svg = div
            .append('svg')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)
            .attr('viewBox', [0, 0, this.dimensions.width, this.dimensions.height])
            .attr('id', 'ts-svg')
            .call(zoom)
            .on("mousedown.zoom", null) // Removeing some zoom functionality to make it compatible with brushing
            .on("touchstart.zoom", null)
            .on("touchmove.zoom", null)
            .on("touchend.zoom", null);

        //Creating groups to hold sub components
        let chart = svg
            .append('g')
            .attr('height', this.dimensions.height)
            .attr('id', 'ts-chart')
            .attr("transform", `translate(${location.x}, ${location.y})`);

        let brush = svg
            .append('g')
            .attr('id', 'ts-brush');

        let labels = brush
            .append('g')
            .attr('id', 'ts-labels');
        
        let axis = svg
            .append('svg')
            .attr('width', this.dimensions.width - this.margin_left)
            .attr('x', this.margin_left)
            .attr('id', 'ts-xaxis');

        labels
            .append('text')
            .attr('id', 'ts-label1')
            .attr('x', this.margin_left)
            .attr('y', this.dimensions.height / 2)
            .attr('visibility', 'hidden')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .text('Start Date');

        labels
            .append('text')
            .attr('id', 'ts-label2')
            .attr('x', this.margin_left)
            .attr('y', this.dimensions.height / 2)
            .attr('visibility', 'hidden')
            .attr('font-size', '12px')
            .attr('fill', 'black')
            .text('End Date');

        chart
            .append('g')
            .append('svg')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)
            .attr('id', 'ts-xaxis')
            .attr('transform', `translate(0, ${this.dimensions.height - this.margin_bottom})`)
            .call(xAxisLarge);

        //Plotting the bars
        chart
            .append('svg')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)
            .selectAll('rect')
            .data(this.dateIndexedData)
            .join('rect')
            .classed('ts-bar', true)
            .attr('x', d => xBarScale(d.date))
            .attr('y', d => yScale(d.count) - 1)
            .attr('width', xBarScale.bandwidth())
            .attr('height', d => this.dimensions.height - this.margin_bottom - yScale(d.count))
            .attr('fill', 'lightblue')
            .attr('stroke', 'lightblue');

        //Adding a brush to the chart
        let brusher = d3.brushX()
            .extent([[this.margin_left * 2, 0], [this.dimensions.width - this.margin_left, this.dimensions.height - this.margin_bottom - 1]])
            .on('brush', (event) => {
                let label1 = d3.select('#ts-label1');
                let label2 = d3.select('#ts-label2');
                let selection = event.selection;

                if (selection) {
                    let [x1, x2] = selection;
                    let l1 = label1.node().getBBox();
                    let l2 = label2.node().getBBox();
                    label1
                        .attr('x', x1 > this.margin_left + 200 ? x1 - l1.width : x1)
                        .attr('visibility', 'visible')
                        .text(d3.timeFormat("%B %d, %Y")(xScale.invert(x1)));
                    label2
                        .attr('x', x2 < this.dimensions.width - 200 ? x2 : x2 - l2.width)
                        .attr('visibility', 'visible')
                        .text(d3.timeFormat("%B %d, %Y")(xScale.invert(x2)));
                }
            })
            .on('end', (event) => {
                let selection = event.selection;
                let label1 = d3.select('#ts-label1');
                let label2 = d3.select('#ts-label2');
                let aids = [];
                if (selection) {
                    //Getting the selected dates and getting rid of time values
                    let date1 = new Date(xScale.invert(selection[0]).toDateString());
                    let date2 = new Date(xScale.invert(selection[1]).toDateString());

                    let date1Index = this.dateIndexedData.findIndex((d) => d.date.getTime() === date1.getTime());
                    let date2Index = this.dateIndexedData.findIndex((d) => d.date.getTime() === date2.getTime());

                    for (let i = date1Index; i <= date2Index; i++) {
                        aids = aids.concat(this.dateIndexedData[i].aids);
                    }
                }
                this.log('The selected AIDs are:');
                this.log(aids);
                label1
                    .attr('visibility', 'hidden');

                label2
                    .attr('visibility', 'hidden');
                this.page.setSelection(aids);
            });
        brush.call(brusher);
        brush.on('wheel', () => brush.call(brusher.move, null));
    }
}
export { TimeSelect };