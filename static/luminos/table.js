/**
 * A table of measurement+value pairs
 */
function teeTable() {
    var title = 'UNTITLED'
    var measurements = []
    my.title = function(t){
        if(t === undefined) return title
        title = t
        return this
    }
    my.add = function(name, units, value, format){
        measurements.push({
            'name':name,
            'units':units,
            'value':value,
            'format':format
        })
        return this
    }
    
    function render(data){
        var div = d3.select(this)
        div.attr('class', 'tee-table')
        var header = div.select('h4')
        if(header.empty()) header = div.append('h4')
        header.text(title)

        var rows = div.selectAll('div')
            .data(measurements)
        var newRows = rows.enter().append('div')
        //newRows.append('span').attr('class', 'name') 
        newRows.append('span').attr('class', 'val') 
        newRows.append('span').attr('class', 'units')
        //rows.select('.name').text(function(d){
        //    return d.name
        //}).style('display',function(d){
        //    return d.name===null ? 'none' : 'inline-block'
        //})
        rows.select('.val').text(function(d){
            var val = d.value(data)
            return val.toFixed(d.format)
        })
        rows.select('.units').html(function(d){
            return d.units
        })
    }
    function my(sel){
        sel.each(render)
    }
    return my
}
