// tooltip component in P1

var leaflet = await import("https://cdn.skypack.dev/leaflet");
import("leaflet").catch((e) => { });

if (L === undefined) L = leaflet;

class ToolTip {
  constructor(data, width = 600, height = 600) {
    this.width = width;
    this.height = height;

    this.data = data.avalanches;
    


    this.drawbubble();
    
  }

  drawbubble() {
    let data = [...this.data]
    let parseFeetFromString = x => parseFloat(x.slice(0, x.length - 1).replace(',', '') / (x.endsWith('"') ? 12 : 1));

    
    let svg2 = d3.select('body')
        .append('svg')
        .attr('width', this.width+100)
        .attr('height', this.height+100)
        .attr('id', 'tooltip');
    //let sortedWidth = widthData.sort(d3.ascending)
    Array.from(['Width', 'Vertical']).reduce((obj, k) => {
      let dk = data.map(d => parseFeetFromString(d[k]))
      dk.sort(d3.ascending)
      console.log(dk)
      obj[k] = {
        q1: d3.quantile(dk, .25)/5,
        q2: d3.quantile(dk, .5)/5,
        q3: d3.quantile(dk, .75)/5
      }
      console.log(obj[k].q1)
      console.log(obj[k].q2)
      console.log(obj[k].q3)
      let interQuantileRange= obj[k].q3-obj[k].q1
      let min = obj[k].q1 -1.5 *interQuantileRange
      let max=  obj[k].q3 + 1.5 * interQuantileRange
      console.log(interQuantileRange)
      console.log(min)
      console.log(max)
      

      
      // Show the X scale
      var x = d3.scaleBand()
        .range([0, this.width])
        .domain(["Width", "Vertical"])
        .paddingInner(1)
        .paddingOuter(.5)
      svg2.append("g")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(x).tickValues(x.domain()).tickSizeOuter(0).tickSizeInner(0))

      // Show the Y scale
      var y = d3.scaleLinear()
        .domain([-150,210])
        .range([this.height, 0])
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

        var jitterWidth = 50
        
      svg2
        .selectAll("indPoints")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d){return(x(k))})
        .attr("cy", function(d){return(y(dk[3000]))})
        .attr("r", 4)
        .style("fill", "white")
        .attr("stroke", "black")
        
      return obj
    }, {})

  }

}
export { ToolTip };