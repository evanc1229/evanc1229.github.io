// time selection component in P1 and P2

import * as utils from "./utils.js";

/**
 *  This class creates a time selection component
 */
class TimeSelect {

    /**
     * This constructor creates a time selection component with the upper left corner at (x,y)
     * and a specified width and height. If no dimesions are specified, the default is (0,0)
     * for x,y and 500x500 for width and height.
     * 
     * @param {Array<utils.AvalancheData>} data 
     * @param {bool} verbose
     */
    constructor(data, verbose = false) {
        this.verbose = verbose
        this.dates = { date1: null, date2: null };
        this.margin_bottom = 18;
        this.margin_left = 15;
        this.data = data;

        //preprocess the data
        this.data.forEach((d) => {
            d.date = new Date(d.date) != "Invalid Date" ? new Date(d.date) : null; //first filter out invalid dates
        });

        //Group the data by length per date and convert to an array of objects
        this.data = Array.from(d3.rollup(this.data, v => v.length, d => d.date));

        this.data = this.data.map((d) => {
            return {
                date: (d[0]),
                count: d[1]
            };
        });

        //Filter out the null dates and dates prior to 2010
        this.data = this.data.filter((d) => d.date != null && d.date.getFullYear() >= 2010);

        //Adding missing dates by creating a new array of dates and joining it with the data
        let dates = d3.timeDays(d3.min(this.data, d => d.date), d3.max(this.data, d => d.date));

        dates.forEach((d) => {
            if (!this.data.some((e) => e.date.getTime() === d.getTime())) {
                this.data.push({ date: d, count: 0 });
            }
        });

        this.data = this.data.sort((a, b) => a.date - b.date);
    }

    log(...msg) {
        if (this.verbose)
            console.log(msg)
    }


    /**
     * This method draws the time selection component in the div specified
     * 
     * @param {d3.Selection} div 
     */
     async render(div) {
        this.log(div)
        this.dimensions = utils.getDimensions(div);
        console.log(this.dimensions);

        //Creating svg to hold the time selection component
        let svg = div
            .append('svg')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)
            .attr('id', 'timeselect');

        //Creating groups to hold sub components
        let chart = svg
            .append('g')
            .attr('id', 'ts-chart');

        let selectors = svg
            .append('g')
            .attr('id', 'ts-selectors');

        //Appending Line Selectors to the Selector Group
        selectors
            .append('line')
            .attr('id', 'ts-line1')
            .attr('x1', this.margin_left)
            .attr('y1', 0)
            .attr('x2', this.margin_left)
            .attr('y2', this.dimensions.height - this.margin_bottom)
            .attr('stroke', 'grey')
            .attr('stroke-width', 4)
            .attr('visibility', 'hidden');

        selectors
            .append('line')
            .attr('id', 'ts-line2')
            .attr('x1', this.margin_left)
            .attr('y1', 0)
            .attr('x2', this.margin_left)
            .attr('y2', this.dimensions.height - this.margin_bottom)
            .attr('stroke', 'grey')
            .attr('stroke-width', 4)
            .attr('visibility', 'hidden');

        //Creating scales
        let xScale = d3.scaleTime()
            .domain(d3.extent(this.data, d => d.date))
            .range([this.margin_left*2, this.dimensions.width - this.margin_left]);

        let yScale = d3.scaleLinear()
            .domain([0, Math.sqrt(d3.max(this.data, d => d.count))]) //Square root scale to make the graph more readable
            .range([this.dimensions.height - this.margin_bottom, 0]);

        let areaGenerator = d3.area()
            .x(d => xScale(d.date))
            .y1(d => yScale(d.count))
            .y0(yScale(0));

        //Adding Axis
        let xAxis = d3.axisBottom(xScale)
            .ticks(13)
            .tickFormat(d3.timeFormat("%Y"));

        chart
            .append('g')
            .attr('id', 'ts-xaxis')
            .attr('transform', `translate(0, ${this.dimensions.height - this.margin_bottom})`)
            .call(xAxis)
            .call(g => g.select(".domain").remove());

        //Adding a rect to the svg to add a border
        svg
            .append('rect')
            .attr('x', this.margin_left)
            .attr('y', 0)
            .attr('rx', 5)
            .attr('width', this.dimensions.width - this.margin_left)
            .attr('height', this.dimensions.height - this.margin_bottom)
            .attr('fill', 'none')
            .attr('stroke-width', 1)
            .attr('stroke', 'black');


        chart
            .append('path')
            .datum(this.data)
            .attr('d', areaGenerator)
            .attr('fill', 'lightblue')
            .attr('stroke', 'lightblue');

        //TODO: Remove this once axis are added
        let text =
            svg.append('text')
                .attr('x', this.dimensions.width / 3)
                .attr('y', 20)
                .attr('id', 'timeselect-text')
                .attr('font-size', '10px')
                .attr('font-family', 'sans-serif')
                .attr('font-weight', 'bold')
                .attr('fill', 'black')
                .text(`(Demonstration Purposes Only) Click on a bar, then another bar`)
                .raise();

        svg.on('click', (e) => {
            let line1 = d3.select('#ts-line1');
            let line2 = d3.select('#ts-line2');
            if (e.offsetX > this.margin_left && e.offsetX < this.dimensions.width) {
                // Is timeselect in the default state?
                if (!line1.classed('active') && !line2.classed('active')) {
                    // If it is, when clicked we need to start moving select 1
                    if (!line1.classed('moving')) {
                        line1
                            .attr('x1', e.offsetX)
                            .attr('x2', e.offsetX)
                            .attr('visibility', 'visible')
                            .classed('moving', true);
                    }
                    else {
                        // If select 1 is already moving, stop and and grab the date
                        line1
                            .classed('moving', false)
                            .classed('active', true);
                        this.dates.date1 = xScale.invert(e.offsetX);
                    }
                }
                else if (line1.classed('active') && !line2.classed('active')) {

                    // If select 1 is active, but select 2 is not, when clicked we need to start moving select 2
                    if (!line2.classed('moving')) {
                        line2
                            .attr('x1', e.offsetX)
                            .attr('x2', e.offsetX)
                            .attr('visibility', 'visible')
                            .classed('moving', true);
                    }
                    else if (e.offsetX > line1.attr('x1')) {
                        // If select 2 is already moving, stop and and grab the date
                        line2
                            .classed('moving', false)
                            .classed('active', true)
                        this.dates.date2 = xScale.invert(e.offsetX);
                    }
                    else if (e.offsetX < line1.attr('x1')) {
                        // If select 2 is to the left of select 1, swap them
                        line2
                            .classed('moving', false)
                            .classed('active', true)
                        this.dates.date2 = this.dates.date1;
                        this.dates.date1 = xScale.invert(e.offsetX);
                    }
                    else {
                        // If select 2 and select 1 are the same then throw and error and do nothing
                        chart
                            .select('path')
                            .transition()
                            .duration(100)
                            .attr('stroke', 'red')
                            .attr('fill', 'red')
                            .transition()
                            .duration(100)
                            .attr('stroke', 'lightblue')
                            .attr('fill', 'lightblue');
                    }
                }
                else if (line1.classed('active') && line2.classed('active')) {
                    // If both are active, reset the chart
                    line1
                        .attr('x1', 0)
                        .attr('x2', 0)
                        .attr('visibility', 'hidden')
                        .classed('active', false)
                        .classed('moving', false);

                    line2
                        .attr('x1', 0)
                        .attr('x2', 0)
                        .attr('visibility', 'hidden')
                        .classed('active', false)
                        .classed('moving', false);
                    this.dates.date1 = null;
                    this.dates.date2 = null;
                }
                text
                    .text(`(Demonstration Purposes Only) Selection type: ${this.dates.date1 && this.dates.date2 ? 'range' : 'single'} , Start date: ${this.dates.date1 ? this.dates.date1.toDateString() : 'null'}, End date: ${this.dates.date2 ? this.dates.date2.toDateString() : 'null'}`)
                this.log(this.getDates());
            }

            // TODO: dispatch events, listeners should call .getDates() and update themselves
        });

        //Allows Selection elements to move when mouse is dragged and they are in the moving state
        svg.on('mousemove', (e) => {
            if (e.offsetX > this.margin_left && e.offsetX < this.dimensions.width) {
                if (d3.select('#ts-line1').classed('moving')) {
                    d3.select('#ts-line1')
                        .attr('x1', e.offsetX)
                        .attr('x2', e.offsetX);
                }
                else if (d3.select('#ts-line2').classed('moving')) {
                    d3.select('#ts-line2')
                        .attr('x1', e.offsetX)
                        .attr('x2', e.offsetX);
                }
            }
        });
    }

    /**
     * This method will return an object with the start and end dates of the time selection and a key
     * indicating the mode of the time selection. If the mode is single, the end date will be null.
     * 
     * @returns {Object} {mode: "single"|"range", start: Date, end: Date}
     */
    getDates() {
        if (this.dates.date1 == null) {
            return null;
        }
        else if (this.dates.date2 == null) {
            return {
                mode: "single",
                start: this.dates.date1,
                end: null
            };
        }
        else {
            return {
                mode: "range",
                start: this.dates.date1,
                end: this.dates.date2
            };
        }
    }






}
export { TimeSelect };