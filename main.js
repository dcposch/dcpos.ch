
//globals
var vp = document.getElementById('viewport');
var ctx;
var width, height;

//constants
var grid_spacing = 20; //px

function view_clear(){
    ctx.fillStyle='#000';
    ctx.fillRect(0,0,width,height);

    //draw gridlines
    ctx.strokeStyle='#333';
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

function view_draw_cursor(x,y){
    x = Math.floor((x+grid_spacing/2)/grid_spacing)*grid_spacing;
    y = Math.floor((y+grid_spacing/2)/grid_spacing)*grid_spacing;

    ctx.lineWidth=1;
    ctx.strokeStyle='#ff0';
    ctx.beginPath();
    ctx.moveTo(x-grid_spacing/2,y);
    ctx.lineTo(x+grid_spacing/2,y);
    ctx.moveTo(x,y-grid_spacing/2);
    ctx.lineTo(x,y+grid_spacing/2);
    ctx.stroke();
}

$(function(){
    
    //setup header links
    
    //set up model

    //set up controller


    //load default design
    ctx = vp.getContext('2d');
    width = $(vp).width();
    height = $(vp).height();
    //global translate so that coords are pixel-_centered_
    ctx.translate(0.5,0.5);
    view_clear();


    //set up mouse events
    $(vp).mousemove(function(evt){
        var mx = evt.pageX - $(vp).offset().left;
        var my = evt.pageY - $(vp).offset().top;
        view_clear();
        view_draw_cursor(mx,my);
        });
});
