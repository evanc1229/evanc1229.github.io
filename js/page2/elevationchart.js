// elevationchart component in P2

import * as utils from "../shared/utils.js";
import { Page,Component } from "../shared/prototype.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => { });

if (L === undefined) L = leaflet;

class ElevationChart extends Component {
  /**
   * 
   * @param {Page} page
   * @param {Array<utils.AvalancheData>} data 
   * @param {bool} verbose 
   */
  constructor(page, data, verbose=false){
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
  drawChart()
  {
    
        let data = this.data;
        let svg = this.div
            .append('svg')
            .attr('width', this.dimensions.width +50 )
            .attr('height', this.dimensions.height +50)
            .append("g");
           
        
        let dateFormater = d3.timeFormat("%Y");
        let x = d3.scaleTime().range([50, this.dimensions.width]);
        let y = d3.scaleLinear().range([this.dimensions.height, 50]);
    
        let xAxis = d3.axisBottom().scale(x).tickFormat(dateFormater);
        let yAxis = d3.axisRight().scale(y);
    
        let line = d3.line().x(function(d) {return x(d.date);})
                            .y(function(d){return(y(d.elevation));});
        
        data.sort(function(a,b){return a.date - b.date;});
        
        x.domain(d3.extent([data[0].date, data[data.length-1].date]));
        y.domain(d3.extent(data, function(d) {return d.elevation;}));
    
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
            .text("Elevation (inches)");
    
        svg.append("path")
            .datum(data)
            .attr("class", "line")
            .attr("d", line)
            .on("mouseover", function(e,d) {
                tool.transition()
                    .duration(200)
                    .style("opacity", .9);
                tool.html("Date: " + d.date + "<br/>" + "Elevation: " + d.elevation + " ft")
                    .style("left", d3.select(this).attr("cx") + "px")
                    .style("top", d3.select(this).attr("cy") + "px");
            })
            .on("mouseout", function(d) {
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
export {ElevationChart };