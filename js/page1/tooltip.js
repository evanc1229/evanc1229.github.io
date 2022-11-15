// tooltip component in P1

import * as utils from "../shared/utils.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => {});

if (L === undefined) L = leaflet;

class ToolTip{
  constructor(data){
    this.dimensions = {};
    this.data = data.avalanches;
  }

  render(div) {
    this.div = div;
    this.dimensions = utils.getDimensions(div);

    this.drawbubble();
    this.drawTable();
  }

  drawbubble() {
    this.data.forEach(function(d){d.Width =parseInt(d.Width)});
    let data = [...this.data];
    let widthData = data.map(function(d){return d.Width});
      
    let center =100;
    let width2 = 100;
      let sortedWidth = widthData.sort(d3.ascending)
      let q1 = d3.quantile(sortedWidth, .25)/5
      let median = d3.quantile(sortedWidth, .5)/5
      let q3 = d3.quantile(sortedWidth, .75)/5
      console.log(q3)
      let interQuantileRange = q3 - q1
      let min = q1 -1.5 * interQuantileRange
      let max = q1 + 1.5 * interQuantileRange

      let y = d3.scaleLinear()
        .domain([0,100])
        .range([400, 0]);
      
      let svg2 = this.div
        .append('svg')
        .attr('width', this.dimensions.width)
        .attr('height', this.dimensions.height)
        .attr('id', 'tooltip-svg');
      // Show the main vertical line
      svg2
      .append("line")
      .attr("x1", center)
      .attr("x2", center)
      .attr("y1", y(min) )
      .attr("y2", y(max) )
      .attr("stroke", "black")
      
// Show the box
      svg2
      .append("rect")
      .attr("x", center - width2/2)
      .attr("y", y(q3) )
      .attr("height", (y(q1)-y(q3)) )
      .attr("width", width2 )
      .attr("stroke", "black")
      .style("fill", "#69b3a2")

// show median, min and max horizontal lines
      svg2
      .selectAll("toto")
      .data([min, median, max])
      .enter()
      .append("line")
      .attr("x1", center-width2/2)
      .attr("x2", center+width2/2)
      .attr("y1", function(d){ return(y(d))} )
      .attr("y2", function(d){ return(y(d))} )
      .attr("stroke", "black")

      var jitterWidth = 50
    svg2
      .selectAll("indPoints")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx",100)
      // .attr("cy", d=>(y(d.Width))/10+500)
      .attr("cy", (d,i)=>i*5)
      .attr("r", 4)
      .style("fill", "white")
      .attr("stroke", "black")
      .on("mouseover", (e,d)=>{
        console.log(d.Width)
      })
    }

    drawTable()
    {
      let data = [...this.data];
      this.data = this.data.filter(function(d){d.Region = "Ogden";})
      
      let columns = ['Region', 'Place', 'Trigger', 'Depth', 'Width', 'Vertical', 'Aspect', 'Elevation'];
        let table = this.div.append('table');
    
        let thead = table.append('thead');
        let tbody = table.append('tbody');
    
        thead.append('tr')
            .selectAll('th')
            .data(["Region", "Place", "Trigger","Depth", "Width", "Vertical", "Aspect", "Elevation"])
            .enter()
            .append('th')
            .style('border', '1px solid black')
            .text(function(column){
                return column;
            });
        let rows =  tbody.selectAll('tr')
            .data(data.filter(function(d,i) {return i<10}))
            .enter()
            .append('tr')
            .style('border', '1px solid black')
            ;
        
        let cells = rows.selectAll('td')
            .data(function(row){
                return columns.map(function(column){
                    return{
                        column: column,
                        value: row[column]
                    };
                });
            })
            .enter()
            .append('td')
            .style('border', '1px solid black')
            .text(function(d){
                return d.value;
            });
    }

  

}
export{ToolTip};