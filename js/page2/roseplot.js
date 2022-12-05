// roseplot component in P2

import * as utils from "../shared/utils.js";
import { Page, Component } from "../shared/prototype.js";

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => { });

if (L === undefined) L = leaflet;

class RosePlot extends Component {
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
    this.drawRosePlot();
  }

  //Method to draw a rose plot
  drawRosePlot() {
    let data = this.data;

    //Count the number of avalanches in each direction
    let totalNorth = data.reduceRight(function (count, entry) {
      return count + (entry.aspect == "North" ? 1 : 0);
    }, 0);
    let totalSouth = data.reduceRight(function (count, entry) {
      return count + (entry.aspect == "South" ? 1 : 0);
    }, 0);
    let totalEast = data.reduceRight(function (count, entry) {
      return count + (entry.aspect == "East" ? 1 : 0);
    }, 0);
    let totalWest = data.reduceRight(function (count, entry) {
      return count + (entry.aspect == "West" ? 1 : 0);
    }, 0);
    let totalNorthEast = data.reduceRight(function (count, entry) {
      return count + (entry.aspect == "Northeast" ? 1 : 0);
    }, 0);
    let totalNorthWest = data.reduceRight(function (count, entry) {
      return count + (entry.aspect == "Northwest" ? 1 : 0);
    }, 0);
    let totalSouthEast = data.reduceRight(function (count, entry) {
      return count + (entry.aspect == "Southeast" ? 1 : 0);
    }, 0);
    let totalSouthWest = data.reduceRight(function (count, entry) {
      return count + (entry.aspect == "Southwest" ? 1 : 0);
    }, 0);

    //Create an array of objects with the new data
    let newData = [{ axis: "North", value: totalNorth }, { axis: "Northeast", value: totalNorthEast }, { axis: "East", value: totalEast }, { axis: "Southeast", value: totalSouthEast }, { axis: "South", value: totalSouth },  { axis: "Southwest", value: totalSouthWest },  { axis: "West", value: totalWest }, { axis: "Northwest", value: totalNorthWest }];
    
    //choose a color for the graph
    let color = d3.scaleOrdinal()
      .range(["#00A0B0"]);

    //Find the maximum value in the data
    let maxValue = Math.max(totalNorth, totalSouth, totalEast, totalWest, totalNorthEast, totalNorthWest, totalSouthEast, totalSouthWest);
    
    //Set the dimensions of the graph
    let radarChartOptions = {
      w: 500,
      h: 500,
      margin: 70,
      maxValue: maxValue,
      levels: 5,
      roundStrokes: true,
      color: color
    };

    //add default options
      var cfg = {
        w: 600,				
        h: 600,				
        margin: { top: 20, right: 20, bottom: 20, left: 20 }, 
        levels: 1,				
        maxValue: maxValue, 			
        labelFactor: 1.25, 
        wrapWidth: 60, 		
        opacityArea: 0.35, 	
        dotRadius: 4, 			
        opacityCircles: 0.1, 	
        strokeWidth: 2, 		
        roundStrokes: true,	
        color: d3.scaleOrdinal(d3.schemeCategory10),	
      };

      //make sure all options are acounted for
      if ('undefined' !== typeof radarChartOptions) {
        for (var i in radarChartOptions) {
          if ('undefined' !== typeof radarChartOptions[i]) { cfg[i] = radarChartOptions[i]; }
        }
      }
      //Get the values for the axis
      //allAxis: (9) ["North", "Northeast", "East", "Southeast", "South", "Southwest", "West", "Northwest", "North"]
      let allAxis = (newData.map(function (i, j) { return i.axis })),
        total = allAxis.length,
        radius = Math.min(cfg.w / 2, cfg.h / 2),
        Format = d3.format(''),
        angleSlice = Math.PI * 2 / total;

      //Scale for the radius
      let rScale = d3.scaleLinear()
        .range([0, radius])
        .domain([0, maxValue]);

      //Create the container for the graph
      let svg = this.div.append("svg")
        .attr("width", 700)
        .attr("height", 700)
        .attr("class", "radar");

      //Append a title element
      svg.append("text")
        .attr("x", 20)
        .attr("y", 20 )
        .attr("text-anchor", "left")
        .style("font-size", "16px")
        .style("text-decoration", "underline")
        .text("# of Avalanches by Direction");

      //Append a g element
      let g = svg.append("g")
        .attr("transform", "translate(" + (330) + "," + (320) + ")");

      //Create the filter for the glow effect
      let filter = g.append('defs').append('filter').attr('id','glow'),
        feGaussianBlur = filter.append('feGaussianBlur').attr('stdDeviation','2.5').attr('result','coloredBlur'),
        feMerge = filter.append('feMerge'),
        feMergeNode_1 = feMerge.append('feMergeNode').attr('in','coloredBlur'),
        feMergeNode_2 = feMerge.append('feMergeNode').attr('in','SourceGraphic');

      //Create the circular grid lines
      let axisGrid = g.append("g").attr("class", "axisWrapper");

      //Append the lines for the grid
      axisGrid.selectAll(".levels")
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter()
        .append("circle")
        .attr("class", "gridCircle")
        .attr("r", function (d, i) { return radius / cfg.levels * d; })
        .style("fill", "#CDCDCD")
        .style("stroke", "#CDCDCD")
        .style("fill-opacity", cfg.opacityCircles)
        .style("filter" , "url(#glow)");
        

      //Append the labels at each axis
      axisGrid.selectAll(".axisLabel")
        .data(d3.range(1, (cfg.levels + 1)).reverse())
        .enter().append("text")
        .attr("class", "axisLabel")
        .attr("x", 4)
        .attr("y", function (d) { return -d * radius / cfg.levels; })
        .attr("dy", "0.4em")
        .style("font-size", "10px")
        .attr("fill", "#737373")
        .text(function (d, i) { return Format(maxValue * d / cfg.levels); });

      //Create the container for the axis
      let axis = axisGrid.selectAll(".axis")
        .data(allAxis)
        .enter()
        .append("g")
        .attr("class", "axis");

      //Append the lines for the axis
      axis.append("line")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", function (d, i) { return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("y2", function (d, i) { return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2); })
        .attr("class", "line")
        .style("stroke", "white")
        .style("stroke-width", "2px");

      //Append the labels for the axis
      axis.append("text")
        .attr("class", "legend")
        .style("font-size", "11px")
        .attr("text-anchor", "middle")
        .attr("dy", "0.35em")
        .attr("x", function (d, i) { return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("y", function (d, i) { return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2); })
        .text(function (d) { return d })
        .call(wrap, cfg.wrapWidth);

      //The radial line function
      let radarLine = d3.lineRadial()
        .angle(function (d, i) { return i * angleSlice; })
        .curve(d3.curveLinearClosed);

      //The radial area function
      let radarArea = d3.areaRadial()
        .angle(function (d, i) { return i * angleSlice; })
        .curve(d3.curveLinearClosed);

      //Create a wrapper for the blobs
      let blobWrapper = g.selectAll(".radarWrapper")
        .data(newData)
        .enter().append("g")
        .attr("class", "radarWrapper");

      //Append the backgrounds
      blobWrapper
        .append("path")
        .attr("class", "radarArea")
        .attr("d", radarArea.innerRadius(0).outerRadius(d => rScale(d.value))(newData))
        .style("fill", function(d,i) { return cfg.color(i); })
        .style("fill-opacity", cfg.opacityArea)
        .on('mouseover', function (d, i) {
          d3.selectAll(".radarArea")
            .transition().duration(200)
            .style("fill-opacity", 0.1);
          d3.select(this)
            .transition().duration(200)
            .style("fill-opacity", 0.6);
        })
        .on('mouseout', function () {
          d3.selectAll(".radarArea")
            .transition().duration(200)
            .style("fill-opacity", cfg.opacityArea);
        });

      //Create the outlines
      blobWrapper.append("path")
        .attr("class", "radarStroke")
        .attr("d", radarLine.radius(d => rScale(d.value))(newData))
        .style("stroke-width", cfg.strokeWidth + "px")
        .style("stroke", function(d,i) { return cfg.color(i); })
        .style("fill", "none")
        .style("filter" , "url(#glow)");
        
        
      //Append the circles
      blobWrapper.selectAll(".radarCircle")
        .data(newData)
        .enter().append("circle")
        .attr("class", "radarCircle")
        .attr("r", cfg.dotRadius)
        .attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
        .style("fill", function(d,i,j) { return cfg.color(j); })
        .style("fill-opacity", 1)
        .raise();

      //Create a wrapper for the invisible circles for tooltip
      let blobCircleWrapper = g.selectAll(".radarCircleWrapper")
        .data(newData)
        .enter().append("g")
        .attr("class", "radarCircleWrapper");

      //Append a set of invisible circles on top for the mouseover pop-up
      blobCircleWrapper.selectAll(".radarInvisibleCircle")
        .data(newData )
        .enter().append("circle")
        .attr("class", "radarInvisibleCircle")
        .attr("r", cfg.dotRadius * 1.5)
        .attr("cx", function (d, i) { return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2); })
        .attr("cy", function (d, i) { return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2); })
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function (e, d) {
          let newX = parseFloat(d3.select(this).attr('cx')) - 10;
          let newY = parseFloat(d3.select(this).attr('cy')) - 10;
          
          tooltip
            .attr('x', newX)
            .attr('y', newY)
            .html(d.value)
            .transition().duration(200)
            .style('opacity', 1);
        })
        .on("mouseout", function () {
          tooltip.transition().duration(200)
            .style("opacity", 0);
        });
      //Set up the small tooltip for when you hover over a circle
      let tooltip = g.append("text")
        .attr("class", "tooltip")
        .style("opacity", 0);

      //Method to wrap the text in the labels
      function wrap(text, width) {
        text.each(function () {
          let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.4, // ems
            y = text.attr("y"),
            x = text.attr("x"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
          while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width) {
              line.pop();
              tspan.text(line.join(" "));
              line = [word];
              tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
          }
        });

      }
    

  }
}
export { RosePlot };