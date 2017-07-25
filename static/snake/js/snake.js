//
// SNAKE
// by DC
//

var GRID_SIZE = 15;

var snake = [{x:0,y:0},{x:0,y:1},{x:0,y:1}]; // list of coordinates
var dir = {x:0,y:1}, lastDir, nextDir;
var score = 0;
var isGameOver = false;

$(main);

function main(){
    createGrid();
    bindKeys();
    bindMouse();
    genFood();
    setInterval(gameStep, 180);
}

function genFood(){
    while(true){
        var i = (Math.random()*GRID_SIZE)|0;
        var j = (Math.random()*GRID_SIZE)|0;
        var elem = $("#"+i+"-"+j);
        if(!elem.hasClass("snake-body")){
            elem.addClass("snake-food");
            return;
        }
    }
}

function createGrid(){
    var table = $("<table />");
    for(var i = 0; i < GRID_SIZE; i++){
        var tr = $("<tr />");
        for(var j = 0; j < GRID_SIZE; j++){
            var td = $("<td />");
            td.prop("id", j+"-"+i);
            if(i < j && i < GRID_SIZE-j){
                td.addClass("up");
            } else if(i > j && i > GRID_SIZE-j){
                td.addClass("down");
            } else if(j < i && j < GRID_SIZE-i){
                td.addClass("left");
            } else if(j > i && j > GRID_SIZE-i){
                td.addClass("right");
            }
            tr.append(td);
        }
        table.append(tr);
    }
    $("#snake-grid").html(table);
}

function bindKeys() {
    $(document).keydown(function(e){
        var d;
        if(e.which == 37) {
            d = {x:-1, y:0}; // left
        } else if (e.which == 38) {
            d = {x:0, y:-1}; // up
        } else if (e.which == 39) {
            d = {x:1, y:0}; // right
        } else if (e.which == 40) {
            d = {x:0, y:1}; // down
        }
        if(!d) return;
        setDir(d);
    });
}

function bindMouse(){
    $("td").click(function(e){
        var elem = $(e.currentTarget);
        var d, cls;
        if(elem.hasClass("left")){
            d = {x:-1, y:0};
            cls = "left";
        } else if(elem.hasClass("up")){
            d = {x:0, y:-1};
            cls = "up";
        } else if(elem.hasClass("right")){
            d = {x:1, y:0};
            cls = "right";
        } else if(elem.hasClass("down")){
            d = {x:0, y:1};
            cls = "down";
        }
        if(!d) return;
        setDir(d);
    });
}

function setDir(d) {
    // Double-tap dir change
    if(isPerp(d, lastDir)){
        dir = d;
        nextDir = null;
    } else if(!isEqual(dir,lastDir)) {
        nextDir = d;
    }
}

function isPerp(a, b) {
    return Math.abs(a.x) != Math.abs(b.x);
}

function isEqual(a, b) {
    return a.x==b.x && a.y==b.y;
}

function gameStep(){
    if(isGameOver) return;
    var head = snake[snake.length-1];        
    var tail = snake[0];
    var newHead = {x:(head.x+dir.x), y:(head.y+dir.y)};

    // Support double-tap dir change
    lastDir = dir;
    if(nextDir) {
        dir = nextDir;
    }
    nextDir = null;

    // No crashes into the wall
    if(newHead.x < 0 || newHead.x >= GRID_SIZE ||
       newHead.y < 0 || newHead.y >= GRID_SIZE){
       return gameOver();
    }
    // ...or into the snake
    var elemNew = $("#"+newHead.x+"-"+newHead.y);
    if(elemNew.hasClass("snake-body")){
        return gameOver();
    }

    // Remove the tail?
    var elemTail = $("#" + tail.x + "-" + tail.y);
    if(elemNew.hasClass("snake-food")){
        elemNew.removeClass("snake-food");
        $("#snake-status").text("Score: "+ (++score));
        genFood();
    } else {
        elemTail.removeClass("snake-body");
        snake = snake.slice(1);
    }

    // Add the head
    elemNew.addClass("snake-body");
    snake.push(newHead);
}

function gameOver(){
    isGameOver = true;
    var msg;
    if (isSpiral(snake)){
        if(score > 100) {
            msg = "Flawless Victory";
        } else {
            msg = "Flawless Finish";
        }
    } else {
        msg = "Game Over";
    }
    $("#snake-status").text(msg+". Scored "+score);
}

function isSpiral(snake){
    if(snake.length < 4) {
        return false;
    }
    var r = snake.slice(0).reverse();
    var d1 = getDir(r, 1), d2 = getDir(r, 2);
    var rix = 0, rlen = 4;
    for(var i = 3; i < r.length; i++){
        if(rix == 0){
            var dN = {x:-d1.x,y:-d1.y};
            d1 = d2;
            d2 = dN;
        }
        var dirR = getDir(r, i);
        if(dirR.x != d2.x || dirR.y != d2.y) {
            return false;
        }
        if(++rix == ((rlen/2)|0)){
            rix = 0;
            rlen++;
        }
    }
    return true;
}

function getDir(r, i) {
    return {x:(r[i].x-r[i-1].x), y:(r[i].y-r[i-1].y)};
}

