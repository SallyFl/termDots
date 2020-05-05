var width = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var height = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;

var chart_width     =   width;
var chart_height    =   height;
var padding = 50;

const svg_dx = 50;
const svg_dy = 50;

const margin = { top: 20, right: 20, bottom: 30, left: 20 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;


var time_parse = d3.timeParse('%Y');
var time_format = d3.timeFormat('%Y')

//create svg element
var svg = d3.select("#chart")
  .append("svg")
  .attr("width", chart_width)
  .attr("height", chart_height);

//define clip path
svg.append('defs')
    .append('clipPath')
    .attr('id', 'clip-path')
    .append('rect')
    .attr('x', 0)
    .attr('y', 0)
    .attr('width', innerWidth)
    .attr('height', innerHeight)
    .attr("fill", "red");

//scales
var x_scale = d3.scaleTime()
  .range([padding, width - padding * 2]);

var y_scale = d3.scaleLinear()
    .range([height - padding, padding]);

var a_scale = d3.scaleSqrt()
.range([0,25]);

var color = d3.scaleOrdinal()
//All colours
.range([ "#00709b","#40010D",  "#B0C1D9", "#D2D904", "#F2D649", "#F2594B", "#CDD977","#BDBF75","#F2B279", "#A6A4A4", "#D97B73","#6960EC", "#87AFC7","#2B547E","#0B615E","#0B3861","#B45F04","#0B173B","#0B3B39","#0B3B24","#0B0B3B","#173B0B","#B40431","#FA5858","#FA8258","#FE9A2E","#FACC2E","#F7FE2E","#C8FE2E","#9AFE2E","#2EFE2E","#2EFE64","#2EFE9A","#2EFEC8","#2EFEF7","#2ECCFA","#2E9AFE","#2E2EFE","#642EFE","#9A2EFE","#CC2EFA","#FE2EF7","#FE2EC8","#FE2E64","#FF4000","#FF8000","#FFBF00","#FFFF00","#BFFF00","#80FF00","#00FF40","#00FF80","#00FFBF",
  "#00FFFF","#00BFFF","#0080FF","#0040FF","#0000FF","#4000FF","#8000FF","#BF00FF","#FF00FF","#FF00BF","#FF0080","#FF0040"])

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0)
    .attr("class", "tooltip")

//get data
d3.json("data/objects.json").then(function(data){

//Format data
data.forEach((d) => {
  d.year = d.date;
  d.date = time_parse(d.date);
  d.count = +d.count;
  //d.TermID = d.TermID;
  d.ThesXrefTypeID = d.ThesXrefTypeID;
  d.type = d.ThesXrefType;
  d.TermMasterID = d.TermMasterID;
  d.endDate = d.endDate;
});

//extent of zoom function and call zoom
svg.call(d3.zoom()

  .extent([[svg_dx, svg_dy], [width-(svg_dx*2), height-svg_dy]])
  .scaleExtent([1, 10])
  .translateExtent([[svg_dx,svg_dy], [width-(svg_dx*2), height-svg_dy]])
  .on('zoom', zoomed));

//domains
x_scale.domain(d3.extent(data, function(d) {return (d.date);}))
y_scale.domain([0,  d3.max(data, function(d){return d.count;})])
a_scale.domain([0,  d3.max(data, function(d){return d.count;})])

//x axis
var x_axis = d3.axisBottom(x_scale)
  .tickFormat(time_format)

var x_axisGroup = svg.append('g')
  .attr('class', 'axis-x')
  .call(x_axis)
  .attr('transform', `translate(0 ${innerHeight})`);

//create circles
var circles = svg.append('g')
  .attr('clip-path', 'url(#clip-path)')

var tooltip = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

circles
    .selectAll( 'circle' )
    .data(data)
    .enter()
    .append("circle")
    .attr("class", "circle")
    .attr("stroke-width", 1)
    .attr("stroke", "#F2F2F2")
    .attr('clip-path', 'url(#clip-path)')
    .attr("cx", function(d){return x_scale(d.date);})
    .attr("cy", function(d){return y_scale(d.count);})
    .attr("fill", function(d){ return color(d.date)})
    .attr("r", function(d){return a_scale(d.count)})
    .on("mouseover", function(d) {
      tooltip.transition().duration(200).style("opacity", .9);
      tooltip.html(d.count +" objects related to " + d.word +" from " + d.year )
        .style("left", (d3.event.pageX +50) + "px")
        .style("top", (d3.event.pageY - 28) + "px");
    })
    .on("mouseout", function(d) {
      tooltip.transition().duration(500).style("opacity", 0);
    })
    .on("click", function(d){

      //seems to need TermMasterID
         window.open( 'http://collections.anmm.gov.au/advancedsearch/objects/beginDate%253A'+d.year+'%253BendDate%253A'+d.endDate+'%253Bthesadvsearch%253A'+d.TermMasterID, 'location=yes,height=600,width=960,scrollbars=yes,status=yes')

      d3.select(this)
          .style("fill", "red")
          .attr("stroke-width", 2)
          .style("stroke", "red");

    });


// //zoom
function zoomed() {

  //get the new scale
  var newX = d3.event.transform.rescaleX(x_scale);
  var newY = d3.event.transform.rescaleY(y_scale);

  //update axes with new boundaries
  x_axisGroup.call(d3.axisBottom(newX))

  circles
    .selectAll("circle")
    .attr('cx', function(d) {return newX(d.date)})
    .attr('cy', function(d) {return newY(d.count)});

}

})
