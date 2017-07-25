var ctx;
var pixels;

var w = 212 * 2;
var h = 120 * 2;

var map = new Array(64 * 64 * 64);
var texmap = new Array(16 * 16 * 3 * 16);
var vel = {
    x:0, y:0, z:0
};
var loc = {
    x: 32.5,
    y: 32.5,
    z: 32.5
}; 
var rot = {
    x:Math.PI/2, 
    y:0
};
var fisheye = false;


document.getElementById("fullscreen").addEventListener("click", function(){
    var gelem = document.getElementById("game");
    gelem.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT);
    gelem.webkitRequestPointerLock();
});

document.addEventListener("mousemove", function(e) {
    var mx = e.movementX || e.webkitMovementX;
    var my = e.movementY || e.webkitMovementY;
    if(!mx && !my){
        return;
    }
    if(!document.webkitPointerLockElement){
        return;
    }
    var sens = 0.005;
    rot.x += mx * sens;
    rot.y -= my * sens;
});

var pressed = {};
document.body.addEventListener("keydown", function(e){
    pressed[e.which] = true;
});
document.body.addEventListener("keyup", function(e){
    delete pressed[e.which];
});

function updateKeys() {
    fisheye = document.getElementById("fisheye").checked;

    var eps = 0.15, reps = 0.05;
    var cx = rot.xCos*eps;
    var sx = rot.xSin*eps;
    var vx = 0, vz = 0;
    if(pressed[37]) { // left
        rot.x -= reps;
    }
    if(pressed[39]) { // right
        rot.x += reps;
    } 
    if(pressed[38]) { // up
        rot.y += reps;
    }
    if(pressed[40]) { // down
        rot.y -= reps;
    } 
    if(pressed[87]) { // W
        vx += sx;
        vz += cx;
    } 
    if(pressed[65]) { // A
        vx -= cx;
        vz += sx;
    } 
    if(pressed[83]) { // S
        vx -= sx;
        vz -= cx;
    } 
    if(pressed[68]) { // D 
        vx += cx;
        vz -= sx;
    }
    if(vx || vz) {
        vel.x = vx;
        vel.z = vz;
    }
}

function init() {
    for ( var i = 1; i < 16; i++) {
        var br = 255 - ((Math.random() * 96) | 0);
        for ( var y = 0; y < 16 * 3; y++) {
            for ( var x = 0; x < 16; x++) {
                var color = 0x966C4A;
                if (i == 4)
                    color = 0x7F7F7F;
                if (i != 4 || ((Math.random() * 3) | 0) == 0) {
                    br = 255 - ((Math.random() * 96) | 0);
                }
                if ((i == 1 && y < (((x * x * 3 + x * 81) >> 2) & 3) + 18)) {
                    color = 0x6AAA40;
                } else if ((i == 1 && y < (((x * x * 3 + x * 81) >> 2) & 3) + 19)) {
                    br = br * 2 / 3;
                }
                if (i == 7) {
                    color = 0x675231;
                    if (x > 0 && x < 15
                            && ((y > 0 && y < 15) || (y > 32 && y < 47))) {
                        color = 0xBC9862;
                        var xd = (x - 7);
                        var yd = ((y & 15) - 7);
                        if (xd < 0)
                            xd = 1 - xd;
                        if (yd < 0)
                            yd = 1 - yd;
                        if (yd > xd)
                            xd = yd;

                        br = 196 - ((Math.random() * 32) | 0) + xd % 3 * 32;
                    } else if (((Math.random() * 2) | 0) == 0) {
                        br = br * (150 - (x & 1) * 100) / 100;
                    }
                }

                if (i == 5) {
                    color = 0xB53A15;
                    if ((x + (y >> 2) * 4) % 8 == 0 || y % 4 == 0) {
                        color = 0xBCAFA5;
                    }
                }
                if (i == 9) {
                    color = 0x4040ff;
                }
                var brr = br;
                if (y >= 32)
                    brr /= 2;

                if (i == 8) {
                    color = 0x50D937;
                    if (((Math.random() * 2) | 0) == 0) {
                        color = 0;
                        brr = 255;
                    }
                }

                var col = (((color >> 16) & 0xff) * brr / 255) << 16
                        | (((color >> 8) & 0xff) * brr / 255) << 8
                        | (((color) & 0xff) * brr / 255);
                texmap[x + y * 16 + i * 256 * 3] = col;
            }
        }
    }

    ctx = document.getElementById('game').getContext('2d');

    for ( var x = 0; x < 64; x++) {
        for ( var y = 0; y < 64; y++) {
            for ( var z = 0; z < 64; z++) {
                var i = z << 12 | y << 6 | x;
                var yd = (y - 32.5) * 0.4;
                var zd = (z - 32.5) * 0.4;
                map[i] = (Math.random() * 16) | 0;
                if (Math.random() > Math.sqrt(Math.sqrt(yd * yd + zd * zd)) - 0.8)
                    map[i] = 0;
            }
        }
    }

    pixels = ctx.createImageData(w, h);
    for ( var i = 0; i < w * h; i++) {
        pixels.data[i * 4 + 3] = 255;
    }

    clock();
};

var frameTime = Date.now(), frameCount = 0;
function clock() {
    updateKeys();
    updatePhysics();
    renderMinecraft();
    ctx.putImageData(pixels, 0, 0);
    requestAnimationFrame(clock);
    showStats();
};

function showStats(){
    if(++frameCount % 10 == 0) {
        var now = Date.now();
        var fps = 1000 * 10 / (now - frameTime);
        frameTime = now;
        document.getElementById("status").textContent =
            "loc "+rnd(loc.x)+" "+rnd(loc.y)+" "+rnd(loc.z)+
            "  vel "+rnd(vel.x)+" "+rnd(vel.y)+" "+rnd(vel.z)+
            "  "+rnd(fps)+" fps";
    }
}

function rnd(x){
    return Math.round(x*100)/100;
}

function updatePhysics(){
    var eps = 0.3, epss = 0.3001;
    loc.x += vel.x;
    loc.y += vel.y;
    loc.z += vel.z;
    /*loc.x = loc.x % 64;
    loc.y = loc.y % 64;
    loc.z = loc.z % 64;
    if(isBlocked(loc.x+eps, loc.y, loc.z) || isBlocked(loc.x+eps, loc.y + 1, loc.z)){
        vel.x = Math.min(vel.x, 0);
        loc.x = (loc.x|0)+1-epss;
    } else if(isBlocked(loc.x-eps, loc.y, loc.z) || isBlocked(loc.x-eps, loc.y + 1, loc.z)){
        vel.x = Math.max(vel.x, 0);
        loc.x = (loc.x|0)+epss;
    }
    if(isBlocked(loc.x, loc.y+1.5, loc.z)){
        vel.y = Math.min(vel.y, 0);
        loc.y = (loc.y|0) + 0.499999999999;
    } else if(isBlocked(loc.x, loc.y-eps, loc.z)){
        vel.y = Math.max(vel.y, 0);
        loc.y = (loc.y|0)+epss;
    } 
    if(isBlocked(loc.x, loc.y, loc.z+eps) || isBlocked(loc.x, loc.y + 1, loc.z+eps)){
        vel.z = Math.min(vel.z, 0);
        loc.z = (loc.z|0)+1-epss;
    } else if(isBlocked(loc.x, loc.y, loc.z-eps) || isBlocked(loc.x, loc.y + 1, loc.z-eps)){
        vel.z = Math.max(vel.z, 0);
        loc.z = (loc.z|0)+epss;
    }
    vel.y += 0.03;*/
    vel.x *= 0.9;
    vel.z *= 0.9;
}

function isBlocked(x, y, z) {
    var ix = x|0, iy = y|0, iz = z|0;
    return map[iz<<12 | iy<<6 | ix] > 0;
}

var f = 0;
function renderMinecraft() {
    var rx = rot.x, ry = rot.y;
    rot.xCos = Math.cos(rx);             
    rot.xSin = Math.sin(rx);
    rot.yCos = Math.cos(ry);
    rot.ySin = Math.sin(ry);
    f++;
    var aa = 1;
    for ( var x = 0; x < w; x++) {
        for ( var y = 0; y < h; y++) {
            var r = 0, g = 0, b = 0;
            for (var a = 0; a < aa; a++){
                var xoff = x + a*0.5;
                var yoff = y + a*0.5;
                var pix = trace(xoff, yoff);
                r += pix.r;
                g += pix.g;
                b += pix.b;
            }
            r /= aa;
            g /= aa;
            b /= aa;

            pixels.data[(x + y * w) * 4 + 0] = r;
            pixels.data[(x + y * w) * 4 + 1] = g;
            pixels.data[(x + y * w) * 4 + 2] = b;
        }
    }
}

function trace(x, y) {
    var xSin = rot.xSin;
    var ySin = rot.ySin;
    var xCos = rot.xCos;
    var yCos = rot.yCos;

    var ___xd = (x - w / 2) / h;
    var __yd = (y - h / 2) / h;
    if(fisheye) {
        var dilate = 0.8 + (___xd*___xd + __yd*__yd)*2;
        ___xd *= dilate;
        __yd *= dilate;
    }
    var __zd = 1;

    var ___zd = __zd * yCos + __yd * ySin;
    var _yd = __yd * yCos - __zd * ySin;

    var _xd = ___xd * xCos + ___zd * xSin;
    var _zd = ___zd * xCos - ___xd * xSin;

    var col = 0;
    var br = 255;
    var ddist = 0;

    var closest = 32;
    for ( var d = 0; d < 3; d++) {
        var dimLength = _xd;
        if (d == 1)
            dimLength = _yd;
        if (d == 2)
            dimLength = _zd;

        var ll = 1 / (dimLength < 0 ? -dimLength : dimLength);
        var xd = (_xd) * ll;
        var yd = (_yd) * ll;
        var zd = (_zd) * ll;

        var initial;
        if (d == 0) {
            initial = loc.x - (loc.x | 0);
        } else if (d == 1) {
            initial = loc.y - (loc.y | 0);
        } else {
            initial = loc.z - (loc.z | 0);
        }
        if (dimLength > 0) {
            initial = 1 - initial;
        }

        var dist = ll * initial;

        var xp = loc.x + xd * initial;
        var yp = loc.y + yd * initial;
        var zp = loc.z + zd * initial;

        if (dimLength < 0) {
            if (d == 0)
                xp--;
            if (d == 1)
                yp--;
            if (d == 2)
                zp--;
        }

        while (dist < closest) {
            var tex = map[(zp & 63) << 12 | (yp & 63) << 6 | (xp & 63)];

            if (tex > 0) {
                var u = ((xp + zp) * 16) & 15;
                var v = ((yp * 16) & 15) + 16;
                if (d == 1) {
                    u = (xp * 16) & 15;
                    v = ((zp * 16) & 15);
                    if (yd < 0)
                        v += 32;
                }

                var cc = texmap[u + v * 16 + tex * 256 * 3];
                if (cc > 0) {
                    col = cc;
                    ddist = 255 - ((dist / 32 * 255) | 0);
                    br = 255 * (255 - ((d + 2) % 3) * 50) / 255;
                    closest = dist;
                }
            }
            xp += xd;
            yp += yd;
            zp += zd;
            dist += ll;
        }
    }

    return {
        r: ((col >> 16) & 0xff) * br * ddist / (255 * 255),
        g: ((col >> 8) & 0xff) * br * ddist / (255 * 255),
        b: ((col) & 0xff) * br * ddist / (255 * 255)
    };
}

init();

