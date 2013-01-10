var margin = {top: 20, right: 20, bottom: 100, left: 50},
	margin2 = {top: 430, right: 10, bottom: 20, left: 50},
	width = 1060 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom,
	height2 = 500 - margin2.top - margin2.bottom;

var parseDate = d3.time.format("%Y%m").parse;

var x = d3.time.scale().range([0, width]),
	x2 = d3.time.scale().range([0, width]),
	y = d3.scale.linear().range([height, 0]),
	y2 = d3.scale.linear().range([height2, 0]);

var xAxis = d3.svg.axis().scale(x).orient("bottom"),
	xAxis2 = d3.svg.axis().scale(x2).orient('bottom'),
	yAxis = d3.svg.axis().scale(y).orient("left");

var line = d3.svg.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.v); }),
	line2 = d3.svg.line()
		.x(function(d) { return x2(d.date); })
		.y(function(d) { return y2(d.v); });

var svg = d3.select("#lineGraph").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	
var focus = svg.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
		.attr('id','transform');

var context = svg.append("g")
		.attr("transform", "translate(" + margin2.left + "," + margin2.top + ")");


var tooltip = d3.select("body")
		.append("div")
		.attr("id","tooltip");

var brush = d3.svg.brush()
		.x(x2)
		.on("brush", brush);

function brush() {
	x.domain(brush.empty() ? x2.domain() : brush.extent());
	//focus.select("path").attr("d", area);
	for (var i = 0; i < lineArray.length; i++){
		lineArray[i].attr("d", line);
	}

	focus.select("#xaxis").call(xAxis);
}

//loads unemployment data in rawdata and attaches a date object 
var rawData;
d3.json("serieses.json", function(error, input) {
	input.forEach(function(d) {
		d['data'].forEach(function(d) {
			d.date = parseDate(d.t);
		})
	});
	rawData = input;
	draw(parseDate('200101'), parseDate('201212'));
});


//draws axis labels and lines
//called on every date range change

//contains all lines
var lineArray;
function draw(minDate, maxDate) {	

	var wrapper = document.getElementById('transform');
	while (wrapper.lastChild) {
 	   wrapper.removeChild(wrapper.lastChild);
	}
	x.domain([minDate, maxDate]);
	x2.domain([minDate, maxDate]);
	y.domain([0,15]);
	y2.domain([3,10]);

	focus.append("g")
			.attr("class", "x axis")
			.attr("id", 'xaxis')
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
			
	focus.append("g")			
			.attr("class", "y axis")
			.call(yAxis)
		.append("text")
			.attr("transform", "rotate(-90)")
			.attr("y", 6)
			.attr("dy", ".71em")
			.style("text-anchor", "end")
			.text("Unemployment Rate (%)");

	context.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + height2 + ")")
			.call(xAxis2);

	lineArray = [];
	for (var i = 0; i < rawData.length; i++){
		lineArray.push(drawLine(rawData[i], minDate, maxDate));
	}

	updateGraph();

	context.append("g")
		.attr("class", "x brush")
		.call(brush)
	.selectAll("rect")
		.attr("y", -6)
		.attr("height", height2 + 7);
}

function drawLine(series, minDate, maxDate){
	var data = [];
	for (var i = 0; i < series['data'].length; i++){
		if (minDate < series['data'][i]['date'] && series['data'][i]['date'] < maxDate){
			data.push(series['data'][i]);
		}
	}
	
	//draws rate on small display iff it is the over all rate 
	if (isOverallRate(series)){
		context.append("path")
			.datum(data)
			.attr("class", "line")
			.attr("d", line2)
			.attr("stroke", 'black')
			.attr('stroke-width', '1.5');
	}

	return focus.append("path")
		.attr("id", series['id'])
		.datum(data)
		.attr("class", "line")
		.attr("d", line)
		.attr("stroke", 'black')
		.attr('stroke-width', '1.5')
		.on("mousemove", function(){
				tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");});
}

function setColors(red, blue){
	var maxY = 0;
	for (var i = 0; i < lineArray.length; i++){
		var series = rawData[i];
		if (isSubset(series, red)['exactMatch'] || isSubset(series, blue)['exactMatch'] || isOverallRate(series)){
			console.log(series);
			seriesMaxY = 0;
			for (var j = 0; j < series['data'].length; j++){
				seriesMaxY = Math.max(seriesMaxY, series['data'][j]['v'])
			}
			maxY = Math.max(maxY, seriesMaxY);
		}
	}
	console.log(maxY);
	y.domain([0,maxY]);
	line = d3.svg.line()
		.x(function(d) { return x(d.date); })
		.y(function(d) { return y(d.v); })
	focus.select(".y.axis").call(yAxis);

	for (var i = 0; i < lineArray.length; i++){
		setLineColor(rawData[i], lineArray[i], red, blue);
	}
}

function setLineColor(series, drawnLine, red, blue){
	var isRed = isSubset(series, red);
	var isBlue = isSubset(series, blue);
	var lineColor;
	var opacity;
	var width;
	if (isOverallRate(series)){
		//line is overall employment rate, make black and bold
		lineColor = 'black';
		opacity = 1; 
	}
	else{
		//otherwise set to another color and thickness
		if (isBlue.subset){
			if (isRed.subset){
				lineColor = 'purple';
			}
			else{
				lineColor = 'blue';
			}
		}
		else{
			if (isRed.subset){
				lineColor = 'red';
			}
			else{
				lineColor = 'grey';
			}
		}	
		//solid line iff exact match to selection or overall rate
		opacity = (isBlue.exactMatch || isRed.exactMatch) ? 1 : .1;
	}
	opacity = opacity - ((lineColor == 'grey') ? .03 : 0);
	width = (opacity == 1) ? 3.0 : 1.5; 

	drawnLine		
		.on('mouseover', function(){	
			if (lineColor != 'grey'){	 		
				tooltip.text(series['description']);
			 	tooltip.style("visibility", "visible");
				d3.select(this)
					.attr('stroke-opacity', opacity + .6)
					.attr('stroke-width', width + 1);
				};})
		.on('mouseout', function(){
		 	tooltip.style("visibility", "hidden");
			d3.select(this)
				.attr('stroke-opacity', opacity)
				.attr('stroke-width', width);})
		.transition()
			.duration(500)
			.attr('stroke', lineColor)
			.attr('stroke-opacity', opacity)
			.attr('stroke-width', width)
			.attr("d", line);
			console.log(width);


}

//rv.subset is true if it is subset
//rv.exactMatch is also true if it is an exact match
function isSubset(series, description){
	var subset = true;
	var exactMatch = true;
	demoCodes = ['age', 'edu', 'race', 'sex'];
	for (var i = 0; i < demoCodes.length; i++){
		var demoCode = demoCodes[i];
		subset = (subset) ? (description[demoCode] == 0 || description[demoCode] == series[demoCode]) : false;
		exactMatch = (exactMatch) ? description[demoCode] == series[demoCode] : false; 
	}

	return {subset: subset, exactMatch: exactMatch};
}

function isOverallRate(series){
	return series['description'] == "(Unadj) Unemployment Rate";
}
