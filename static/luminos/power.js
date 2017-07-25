
/**
 * Shows bus current and power breakdown.
 */
function powerChart(){
    // Configuration
    var width = 160, height = 260
    var powerMin = -2000, powerMax = 3000 // watts
    var margin = {top:10, right:0, bottom:20, left:50}
    
    // Rendering
    function createAxes(svg){
        svg.append('g')
            .attr('id','xaxis')
            .attr('class','axis')
            .attr('transform', 'translate(0,'+(height-margin.bottom+10)+')')
        svg.append('g')
            .attr('id','lyaxis')
            .attr('class','axis')
            .attr('transform', 'translate('+margin.left+','+margin.top+')')
        svg.append('g')
            .attr('id','ryaxis')
            .attr('class','axis')
            .attr('transform', 'translate('+(width-margin.right)+','+margin.top+')')
        svg.append('line')
            .attr('id', 'yzero')
            .attr('x1', margin.left)
            .attr('x2', width-margin.right)
            .style('stroke','gray')
            .style('stroke-dasharray','1,1')
        svg.append('text')
            .attr('dx', 5).attr('dy', 10)
            .text('Watts');
        svg.append('text')
            .attr('dx', width).attr('dy', 10)
            .text('Amps');
    }
    function render(car){
        var busVoltage = car.busVoltage
        var busCurrent = car.busCurrent
        var motorCurrent = car.motorCurrent
        var arrayCurrent = car.arrayCurrent

        // Axes
        var svg = d3.select(this)
        if(svg.selectAll("g").empty()) {
            createAxes(svg);
        }
        var powerScale = d3.scale.linear()
            .domain([powerMin, powerMax])
            .range([height-margin.bottom,margin.top])
        var currentScale = d3.scale.linear()
            .domain([powerMin/busVoltage, powerMax/busVoltage])
            .range([height-margin.bottom,margin.top])
        var l = margin.left + 15, r = margin.right + 15;
        var xScale = d3.scale.ordinal()
            .domain(['Bus', 'Motor', 'Array'])
            .range([l,(l+width-r)/2,width-r])

        var xaxis = svg.select("#xaxis");
        xaxis.call(d3.svg.axis()
            .orient('bottom')
            .scale(xScale))
        var lyaxis = svg.select("#lyaxis");
        lyaxis.call(d3.svg.axis()
            .orient('left')
            .scale(powerScale));
        var ryaxis = svg.select("#ryaxis");
        ryaxis.call(d3.svg.axis()
            .orient('right')
            .scale(currentScale));

        // Plot the bars
        var data = [
            {name:"Bus", current:busCurrent},
            {name:"Motor", current:motorCurrent},
            {name:"Array", current:arrayCurrent}]
        var bars = svg.selectAll("rect")
            .data(data)
        bars.enter().append("rect")
            .attr('x', function(d){ return xScale(d.name)-4 })
            .attr('width', 10)
            .attr('fill', 'blue')
        var yzero = powerScale(0)
        bars.attr('y', function(d){
            return Math.min(yzero,currentScale(d.current))
        })
        bars.attr('height', function(d){
            return Math.abs(yzero-currentScale(d.current))
        })

        var yzeroLine = svg.select("#yzero")
        yzeroLine.attr('y1',yzero).attr('y2',yzero)
    }
    function my(selection){
        selection.each(render)
    }

    return my
}
