//Dan Posch
//webpcb
//
//Main model class.
//Represents a circuit board, along with parts and metadata.
//
//Provides
// * Persistance and serialization (JSON).
// * Import/export into other formats (eg netlist).
//
//Does not provide:
// * Simulation
// * User interaction (see controller)
// * Display (see view)
//

var eps = 0.000000001;

function pcb_model() {

    this.traces = [];
    this.holes = [];
    this.nets = [];

    this.find_trace = function(x1,y1,x2,y2){
        for(var i = 0; i < this.traces.length; i++){
            if(
                this.traces[i][0] == x1 &&
                this.traces[i][1] == y1 &&
                this.traces[i][2] == x2 &&
                this.traces[i][3] == y2){
                return i;
            }
        }
        return -1;
    }

    this.traces_intersect = function(t1,t2){
        var x1 = t1[0];
        var y1 = t1[1];
        var x2 = t1[2];
        var y2 = t1[3];

        var x3 = t2[0];
        var y3 = t2[1];
        var x4 = t2[2];
        var y4 = t2[3];

        var numa = (x4-x3)*(y1-y3) - (y4-y3)*(x1-x3);
        var numb = (x2-x1)*(y1-y3) - (y2-y1)*(x1-x3);
        var denom = (y4-y3)*(x2-x1) - (x4-x3)*(y2-y1);

        //parallel
        if(Math.abs(denom) < eps){
            //coincident
            if(Math.abs(numa) < eps && Math.abs(numb) < eps){

                //normalize
                var xn1 = Math.min(x1,x2);
                var xn2 = Math.max(x1,x2);
                var xn3 = Math.min(x3,x4);
                var xn4 = Math.max(x3,x4);
                var yn1 = Math.min(y1,y2);
                var yn2 = Math.max(y1,y2);
                var yn3 = Math.min(y3,y4);
                var yn4 = Math.max(y3,y4);

                if(!(yn3 >= yn1-eps && yn3 <= yn2+eps ||
                    yn4 >= yn1-eps && yn4 <= yn2+eps ||
                    yn1 >= yn3-eps && yn1 <= yn4+eps ||
                    yn2 >= yn3-eps && yn2 <= yn4+eps))
                    return false;

                if(!(xn3 >= xn1-eps && xn3 <= xn2+eps ||
                    xn4 >= xn1-eps && xn4 <= xn2+eps ||
                    xn1 >= xn3-eps && xn1 <= xn4+eps ||
                    xn2 >= xn3-eps && xn2 <= xn4+eps))
                    return false;

                return true;
            }
            return false; 
        }

        //nonparallel. lines intersect. do segments intersect?
        var u_a = numa / denom;
        var u_b = numb / denom;
        if(u_a < -eps || u_a > 1+eps || u_b < -eps || u_b > 1+eps)
            return false;

        return true;
    }

    this.net_find_intersection_ixs = function(x1,y1,x2,y2){
        var ret = [];
        for(var i = 0; i < this.nets.length; i++){
            var trace_ixs = this.nets[i][0];
            var hole_ixs = this.nets[i][1];

            for(var j = 0; j < trace_ixs.length; j++){
                var trace = this.traces[trace_ixs[j]];
                if(this.traces_intersect([x1,y1,x2,y2],trace)){
                    ret.push(i);
                    break;
                }
            }
        }

        return ret;
    }

    this.net_find_intersections = function(x1,y1,x2,y2){
        if(typeof x2 == 'undefined')
            x2 = x1;
        if(typeof y2 == 'undefined')
            y2 = y1;

        var ret = [];
        var ixs = this.net_find_intersection_ixs(x1,y1,x2,y2);
        for(var i = 0; i < ixs.length; i++){
            ret.push(this.nets[i]);
        }
        return ret;
    }

    this.add_hole = function(x,y){
        var hole_ix = this.holes.length;
        this.holes.push([x,y]);

        var is = this.net_find_intersection_ixs(x,y,x,y);
        if(is.length > 1){
            throw "WARNING: new hole intersects more than one existing net";
        }
        else if(is.length == 0){
            //add new net
            this.nets.push([[],[hole_ix]]);
        }
        else{
            //add to existing net
            this.nets[i][1].push(hole_ix);
        }
    }

    this.add_trace = function(x1,y1,x2,y2){

        if(this.find_trace(x1,y1,x2,y2) > -1)
            throw("pcb_trace: attempted double add.");
        var trace = [x1,y1,x2,y2];
        var trace_ix = this.traces.length;
        this.traces.push(trace);

        //find all nets that this trace intersects (which we'll bridge)
        var is = this.net_find_intersection_ixs(x1,y1,x2,y2);
        if(is.length > 0){
            var net0 = this.nets[is[0]];
            console.log("MERGE");
            console.log(net0);

            //combine all wires and traces into a single net (net0)
            for(var i = is.length-1; i >= 1; i--){
                var net = this.nets[is[i]];
                net0[0] = net0[0].concat(net[0]);
                net0[1] = net0[1].concat(net[1]);

                this.nets = this.nets.remove(is[i]);
            }

            //add new trace to that net
            net0[0].push(trace_ix);

            console.log(net0);
        }
        else{
            //add new net
            this.nets.push([[trace_ix],[]]);
        }

        //DEBUG
        console.log("FINISHED ADD_TRACE:");
        console.log(this.nets);
    }

    this.find_intersection_ixs = function(x,y){
        var ret = [];

        for(var i = 0; i < this.traces.length; i++){
            var t = this.traces[i];
            x1 = t[0];
            y1 = t[1];
            x2 = t[2];
            y2 = t[3];

            var tx = (x - x1)/(x2-x1);
            if(!isNaN(tx)){
                if(tx < 0) continue;
                if(tx > 1) continue;
            }
            var ty = (y - y1)/(y2-y1);
            if(isNaN(ty) || isNaN(tx) || tx == ty)
               ret.push(i);
        }

        return ret;
    }

    this.remove_trace = function(x1,y1,x2,y2){
        var ix = this.find_trace(x1,y1,x2,y2);
        if(ix < 0)
            throw("pcb_trace: trace not found");
        this.traces.remove(ix);
    }
}

