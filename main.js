//Dan Posch
//June 2011
//WPCB 
//


//model
pcb = new pcb_traces();


//globals
var vp = document.getElementById('viewport'); //viewport (<canvas>)
var ctx; //canvas context
var width, height; //viewport size, px
var mx, my; //mouse location
var dstartx, dstarty;
dstartx = dstarty = null;

//ui state
var tool = null;
var current_trace = null;


//constants
var grid_spacing = 20; //px
var snap_to_grid = true;

var color_background = '#000';
var color_grid = '#333';
var color_trace = '#bb0';
var color_trace_highlight = '#ddd';



function view_clear(){
    ctx.fillStyle=color_background;
    ctx.fillRect(0,0,width,height);

    //draw gridlines
    ctx.strokeStyle=color_grid;
    ctx.lineWidth=1;
    ctx.beginPath();
    for(var x = 0; x < width; x += grid_spacing){
        for(var y = 0; y < height; y += grid_spacing){
            ctx.moveTo(0, y);
            ctx.lineTo(width,y);
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
        }
    }
    ctx.stroke();
}

function view_draw_crosshair(x,y,snap_to_grid){
    if(snap_to_grid){
        loc = snap_location(x,y);
        x = loc[0];
        y = loc[1];
    }

    ctx.lineWidth=1;
    ctx.strokeStyle='#ff0';
    ctx.beginPath();
    ctx.moveTo(x-grid_spacing/2,y);
    ctx.lineTo(x+grid_spacing/2,y);
    ctx.moveTo(x,y-grid_spacing/2);
    ctx.lineTo(x,y+grid_spacing/2);
    ctx.stroke();
}

function view_redraw(){
    view_clear();
    if(tool=='traces')
        view_draw_crosshair(mx,my,true);
    else if(tool==null)
        view_draw_crosshair(mx,my,false);

    //draw traces
    for(var i = 0; i < pcb.traces.length; i++){
        draw_trace(pcb.traces[i], color_trace);
    }

    //highlight traces
    loc = snap_location(mx,my);

    if(dstartx == null){
        trace_ixs = pcb.find_intersection_ixs(loc[0],loc[1]);
        for(var i = 0; i < trace_ixs.length; i++){
            draw_trace(pcb.traces[trace_ixs[i]], color_trace_highlight);
        }
    }
    else{
        ints = pcb.net_find_intersections(dstartx,dstarty,loc[0],loc[1]);
        for(var ix = 0; ix < ints.length; ix++){
            var ts = ints[ix][0];
            for(var i = 0; i < ts.length; i++){
                draw_trace(ts[i], color_trace_highlight);
            }
        }
    }    

    if(current_trace != null){
        draw_trace(current_trace,color_trace_highlight);
    }

    //draw pads
    //TODO
}



function set_tool(t){
    tool = t;
    $('#toolbox li').removeClass('selected');
    if(t != null)
        $("#"+t).addClass('selected');
}

function snap_location(x,y){
    x = Math.floor((x+grid_spacing/2)/grid_spacing)*grid_spacing;
    y = Math.floor((y+grid_spacing/2)/grid_spacing)*grid_spacing;
    return [x,y];
}

function snap_direction(){
    var dx = mx - dstartx;
    var dy = my - dstarty;
    if(Math.abs(dx) > 2*Math.abs(dy)){
        //horizontal
        dy = 0;
    }
    else if(Math.abs(dy) > 2*Math.abs(dx)){
        //vertical
        dx = 0;
    }
    else{
        //diagonal
        var davg = (Math.abs(dx)+Math.abs(dy))/2;
        dx = (dx > 0) ? davg : -davg;
        dy = (dy > 0) ? davg : -davg;
    }
    return snap_location(dstartx + dx, dstarty + dy);
}

function draw_trace(trace, color){
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(trace[0], trace[1]);
    ctx.lineTo(trace[2], trace[3]);

    ctx.stroke();
}

function tool_start(){

}
function tool_update(){
    if(tool == "traces"){
        var msnap = snap_direction();
        current_trace = [dstartx,dstarty,msnap[0],msnap[1]];
    }
}
function tool_finish(){
    if(tool=="traces"){
        if(current_trace != null)
            pcb.add_trace(
                current_trace[0],
                current_trace[1],
                current_trace[2],
                current_trace[3]);
        current_trace = null;
    }
}



function setup_menus(){
    $('#toolbox li').click(function(evt){
        if(evt.currentTarget.id != tool)
            set_tool(evt.currentTarget.id);
        else
            set_tool(null);
    });
}

function setup_vp_mouse(){

    //set up mouse events
    $(vp).mousemove(function(evt){
        mx = evt.pageX - $(vp).offset().left;
        my = evt.pageY - $(vp).offset().top;

        if(dstartx != null)
            tool_update();
        view_redraw();
        });
    $(vp).mousedown(function(evt){
        mx = evt.pageX - $(vp).offset().left;
        my = evt.pageY - $(vp).offset().top;
        var loc = snap_location(mx,my);
        dstartx = loc[0];
        dstarty = loc[1];

        tool_start();
        tool_update();
        view_redraw();
        });
    $(vp).mouseup(function(evt){
        mx = evt.pageX - $(vp).offset().left;
        my = evt.pageY - $(vp).offset().top;

        tool_finish();
        view_redraw();

        dstartx = dstarty = null;
        });
}




$(function(){
    
    //setup header links
    
    //set up model

    //set up controller
    setup_menus();
    setup_vp_mouse();


    //load default design
    ctx = vp.getContext('2d');
    width = $(vp).width();
    height = $(vp).height();
    //global translate so that coords are pixel-_centered_
    ctx.translate(0.5,0.5);
    view_clear();

    set_tool("traces");

});


// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
      var rest = this.slice((to || from) + 1 || this.length);
      this.length = from < 0 ? this.length + from : from;
      return this.push.apply(this, rest);
};

