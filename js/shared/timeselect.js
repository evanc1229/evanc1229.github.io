// time selection component in P1 and P2

/**
 *  This class creates a time selection component
 */
class TimeSelect {

    /**
     * This constructor creates a time selection component with the upper left corner at (x,y)
     * and a specified width and height. If no dimesions are specified, the default is (0,0)
     * for x,y and 500x500 for width and height.
     * 
     * @param {int} x 
     * @param {int} y 
     * @param {int} width 
     * @param {int} height 
     */
    constructor(data, x = 0, y = 0, width = 1000, height = 100) {
        this.dimensions = this.x = {
            x: x,
            y: y,
            width: width,
            height: height
        };

        this.dates = {date1: null, date2: null};

        this.margin = { top: 10, right: 10, bottom: 10, left: 10 };
        this.mode = { single: true, start: null, end: null };
        this.data = data.avalanches;

        //////////////////////////////////////
        ////////Pre-process the data//////////
        //////////////////////////////////////

        this.data.forEach((d) => {
            d.Date = new Date(d.Date) != "Invalid Date" ? new Date(d.Date) : null; //first filter out invalid dates
        });

        //Group the data by length per date and convert to an array of objects
        this.data = Array.from(d3.rollup(this.data, v => v.length, d => d.Date));

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

        this.draw();

        // TODO: initialize new Event "timeUpdate" (or something like that)

    }

    // TODO: add function for registering new listeners to "timeUpdate"


    /**
     * This method draws the time selection component on the page.
     */
    draw() {
        // let data = [...this.data];
        //Creating svg to hold the time selection component
        let svg = d3.select('body')
            .append('svg')
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)
            .attr('x', this.dimensions.x)
            .attr('y', this.dimensions.y)
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
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', this.dimensions.height)
            .attr('stroke', 'grey')
            .attr('stroke-width', 4)
            .attr('visibility', 'hidden');

        selectors
            .append('line')
            .attr('id', 'ts-line2')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', this.dimensions.height)
            .attr('stroke', 'grey')
            .attr('stroke-width', 4)
            .attr('visibility', 'hidden');


        //Creating scales
        let xScale = d3.scaleTime()
            .domain(d3.extent(this.data, d => d.date))
            .range([this.margin.left, this.dimensions.width - this.margin.right]);

        let yScale = d3.scaleLinear()
            .domain([0, Math.sqrt(d3.max(this.data, d => d.count))]) //Square root scale to make the graph more readable
            .range([this.dimensions.height, this.margin.top]);

        let areaGenerator = d3.area()
            .x(d => xScale(d.date))
            .y1(d => yScale(d.count))
            .y0(yScale(0));

        //Adding a rect to the svg to add a border
        svg
            .append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('rx', 5)
            .attr('width', this.dimensions.width)
            .attr('height', this.dimensions.height)
            .attr('fill', 'none')
            .attr('stroke-width', 3)
            .attr('stroke', 'black');


        chart
            .append('path')
            .datum(this.data)
            .attr('d', areaGenerator)
            .attr('fill', 'lightblue')
            .attr('stroke', 'lightblue');

        let text =
            svg.append('text')
                .attr('x', this.dimensions.x + this.dimensions.width / 3)
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
            if(!line1.classed('active') && !line2.classed('active')) {
                line1
                    .attr('x1', e.offsetX)
                    .attr('x2', e.offsetX)
                    .attr('visibility', 'visible')
                    .classed('moving', true)
                    .classed('active', true);
                this.dates.date1 = xScale.invert(e.offsetX - this.dimensions.x);
            }
            else if(line1.classed('active') && !line2.classed('active')) {
                if(e.offsetX > line1.attr('x1')) {
                    line1
                        .classed('moving', false);
                    
                    line2
                        .attr('x1', e.offsetX)
                        .attr('x2', e.offsetX)
                        .attr('visibility', 'visible')
                        .classed('active', true)
                        .classed('moving', true);
                    this.dates.date2 = xScale.invert(e.offsetX - this.dimensions.x);
                }
                else {
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
            else if(line1.classed('active') && line2.classed('active')) {
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
            console.log(this.getDates());
            
            // TODO: dispatch events, listeners should call .getDates() and update themselves
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
export {TimeSelect};