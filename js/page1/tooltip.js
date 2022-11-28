// tooltip component in P1

import * as utils from "../shared/utils.js";
import { Page,Component } from "../shared/prototype.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => { });

if (L === undefined) L = leaflet;

class ToolTip extends Component {
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

    this.drawbubble();
  }

  update() {}


  drawbubble() {
    let data = this.data;

    let parseFeetFromString = x => parseFloat(x.slice(0, x.length - 1).replace(',', '') / (x.endsWith('"') ? 12 : 1));

    
    let svg2 = this.div
        .append('svg')
        .attr('width', this.dimensions.width+100)
        .attr('height', this.dimensions.height+100)
        .attr('id', 'tooltip_svg');
    //let sortedWidth = widthData.sort(d3.ascending)
    Array.from(['elevation','width', 'vertical']).reduce((obj, k) => {
      let dk1 = data.map(d => parseFeetFromString(d[k]))
      let toRemove = [0]
      let dk = dk1.filter(function(el){return !toRemove.includes(el) })
      dk.sort(d3.ascending)
      this.log(dk)
      obj[k] = {
        q1: d3.quantile(dk, .25),
        q2: d3.quantile(dk, .5),
        q3: d3.quantile(dk, .75)
      }
      this.log(obj[k].q1)
      this.log(obj[k].q2)
      this.log(obj[k].q3)
      let interQuantileRange= obj[k].q3-obj[k].q1
      let min = obj[k].q1 -1.5 *interQuantileRange
      let max=  obj[k].q3 + 1.5 * interQuantileRange
      this.log(interQuantileRange)
      this.log(min)
      this.log(max)
      

      
      // Show the X scale
      var x = d3.scaleBand()
        .range([0, this.dimensions.width])
        .domain(["elevation","width", "vertical"])
        .paddingInner(1)
        .paddingOuter(.5)
      svg2.append("g")
        .attr("transform", "translate(0," + this.dimensions.height + ")")
        .call(d3.axisBottom(x).tickValues(x.domain()).tickSizeOuter(0).tickSizeInner(0))

      // Show the Y scale
      var y = d3.scaleLinear()
        .domain([min-10,max+10])
        .range([this.dimensions.height, 0])
      svg2.append("g").call(d3.axisLeft(y).tickValues(y.domain()).tickSizeOuter(0).tickSizeInner(0))


      // Show the main vertical line
      svg2
        .selectAll("vertLines")
        .data(dk)
        .enter()
        .append("line")
        .attr("x1", function (d) { return (x(k)) })
        .attr("x2", function (d) { return (x(k)) })
        .attr("y1", function (d) { return (y(min)) })
        .attr("y2", function (d) { return (y(max)) })
        .attr("stroke", "black")
        .style("width", 40)
        

      // Show the box
      var boxWidth = 100
      svg2
        .selectAll("boxes")
        .data(dk)
        .enter()
        .append("rect")
        .attr("x", function (d) { return (x(k) - boxWidth / 2) })
        .attr("y", function (d) { return (y(obj[k].q3)) })
        .attr("height", function (d) { return (y(obj[k].q1) - y(obj[k].q3)) })
        .attr("width", boxWidth)
        .attr("stroke", "black")
        .style("fill", "#69b3a2")

      svg2
        .selectAll("toto")
        .data([min, obj[k].q2, max])
        .enter()
        .append("line")
        .attr("x1", function(d){return(x(k) - boxWidth/2)})
        .attr("x2", function(d){return(x(k)+boxWidth/2)})
        .attr("y1", function(d){return(y(d))})
        .attr("y2", function(d){return(y(d))})
        .attr("stroke", "black")
        
      svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) { return (x(k)-50)})
        .attr("y", function (d) { return (y(min)) })
        .style("fill", "black")
        .text(function(d){return(Math.trunc(min))}) 

        svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) { return (x(k)-50)})
        .attr("y", function (d) { return (y(max))+13 })
        .style("fill", "black")
        .text(function(d){return(Math.trunc(max))}) 
      
        svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) { return (x(k)-50)})
        .attr("y", function (d) { return (y(obj[k].q2)) })
        .style("fill", "black")
        .text(function(d){return(Math.trunc(obj[k].q2))})
        
        svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) { return (x(k)-50)})
        .attr("y", function (d) { return (y(obj[k].q1)) })
        .style("fill", "black")
        .text(function(d){return(Math.trunc(obj[k].q1))}) 

        svg2
        .append("text")
        .data(dk)
        .attr("x", function (d) { return (x(k)-50)})
        .attr("y", function (d) { return (y(obj[k].q3)) })
        .style("fill", "black")
        .text(function(d){return(Math.trunc(obj[k].q3))}) 

        var jitterWidth = 50
        
      svg2
        .selectAll("indPoints")
        .data(dk)
        .enter()
        .append("circle")
        .attr("cx", function(d){return(x(k))})
        .attr("cy", function(d){return(y(dk[3000]))})
        .attr("r", 5)
        .style("fill", "white")
        .attr("stroke", "black")

      svg2
        .append("text")
        .data(dk)
        .attr("x", function(d){return(x(k)+10)})
        .attr("y", function(d){return(y(dk[3000]))})
        .style("fill", "black")
        .text(function(d){return(Math.trunc(dk[3000]))})
        
      return obj
    }, {})

  }

}
export { ToolTip };