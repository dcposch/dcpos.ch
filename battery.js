
/**
 * Shows cell voltages and temperatures for a LiPo battery pack.
 * See http://bost.ocks.org/mike/chart/ for the general implementation idea.
 */
function batteryChart(){
    // Configuration
    var width = 200, height = 200;
    var margin = {top:10, right:10, bottom:20, left:30};
    my.width = function(w){
        if(w === undefined) return width;
        width = w;
        return this;
    }
    my.height = function(h){
        if(h === undefined) return height;
        height = h;
        return this;
    }

    // Rendering
    function createAxes(svg, xscale, yscale){
        svg.attr('width', width+'px')
            .attr('height', height+'px')
    
        var xaxis = svg.select('#xaxis')
            .attr('transform', 'translate('+margin.left+','+(height-margin.bottom)+')')
        xaxis.call(d3.svg.axis()
            .orient('bottom')
            .scale(xscale)
            .tickValues([3,3.5,4]))
        var ytop = -height+margin.top+margin.bottom - 5;
        xaxis.append('line')
            .attr('x1', xscale(2.8)).attr('y1',ytop)
            .attr('x2', xscale(2.8)).attr('y2',0)
            .style('stroke','red')
            .style('stroke-dasharray','1,1')
        xaxis.append('line')
            .attr('x1', xscale(4.2)).attr('y1',ytop)
            .attr('x2', xscale(4.2)).attr('y2',0)
            .style('stroke','#ee0000')
            .style('stroke-dasharray','1,1')

        var yaxis = svg.select('#yaxis')
            .attr('transform', 'translate('+margin.left+',0)')
        yaxis.call(d3.svg.axis()
            .orient('left')
            .scale(yscale)
            .tickValues([0,5,10,15,20,25,30,34])
            .tickFormat(Math.floor))
    }

    function render(cells){
        var svg = d3.select(this);
        var xscale = d3.scale.linear()
            .domain([2.5,4.5]) // volts
            .range([0, width-margin.right-margin.left]) // bar width in pixels
        var yscale = d3.scale.linear()
            .domain([0,cells.length-0.5]) // index
            .range([margin.top, height-margin.bottom]) // y in pixels
        if(svg.selectAll('g')[0].length == 0){
            svg.append('g').attr('id','xaxis').attr('class','axis');
            svg.append('g').attr('id','yaxis').attr('class','axis');
            createAxes(svg, xscale, yscale);

            svg.append('g').attr('id','voltage');
            svg.append('g').attr('id','temperature');
        }

        // bars (voltage)
        var color = d3.scale.linear()
            .domain([2.8, 3.1, 3.5, 3.9, 4.2]) // volts
            .range(['red', '#ff4444', '#bbbb00', '#44bb44', 'green'])
        var bars = svg.select('#voltage').selectAll('rect')
            .data(cells)
        bars.enter().append('rect')
            .attr('x', margin.left)
            .attr('height', 6)
            .attr('y', function(d,i){return yscale(i)-3})
        bars
            .attr('width', function(d){return xscale(d.voltage)})
            .attr('fill', function(d){return color(d.voltage)})

        // text (temperature)
        var tempColor = d3.scale.threshold()
            .domain([50,60])
            .range(['black', 'orange', 'red']);
        var labels = svg.select('#temperature').selectAll('text')
            .data(cells)
        labels.enter().append('text')
            .attr('dx', width)
            .attr('dy', function(d,i){return yscale(i)})
            .attr('width', 30)
            .attr('height', 10)
            .style('text-anchor', 'end');
        labels
            .attr('fill', function(d){return tempColor(d.temperature)})
            .text(function(d){return Math.round(d.temperature)+' C'})
    }
    function my(selection){
        selection.each(render);
    };

    return my;
}
