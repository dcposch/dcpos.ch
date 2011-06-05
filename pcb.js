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

function pcb_traces() {

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
                if(x1 == x2){
                    if(y3 >= y1 && y3 <= y2) return true;
                    if(y4 >= y1 && y4 <= y2) return true;
                }
                else{
                    if(x3 >= x1 && x3 <= x2) return true;
                    if(x4 >= x1 && x4 <= x2) return true;
                }
                if(x3 == x4){
                    if(y1 >= y3 && y1 <= y4) return true;
                    if(y2 >= y3 && y2 <= y4) return true;
                }
                else{
                    if(x1 >= x3 && x1 <= x4) return true;
                    if(x2 >= x3 && x2 <= x4) return true;
                }
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
        for(var i in this.nets){
            var traces = this.nets[i][0];
            var holes = this.nets[i][1];

            for(var j in traces){
                if(this.traces_intersect([x1,y1,x2,y2],traces[j])){
                    ret.push(i);
                    break;
                }
            }
        }

        return ret;
    }

    this.net_find_intersections = function(x1,y1,x2,y2){
        var ret = [];
        var ixs = this.net_find_intersection_ixs(x1,y1,x2,y2);
        for(var i in ixs){
            ret.push(this.nets[i]);
        }
        return ret;
    }


    this.add_trace = function(x1,y1,x2,y2){
        if(this.find_trace(x1,y1,x2,y2) > -1)
            throw("pcb_trace: attempted double add.");
        var t = [x1,y1,x2,y2];
        this.traces.push(t);

        this.nets.push([[t],[]]);
    }

    this.find_intersections = function(x,y){
        var ret = [];

        for(var i in this.traces){
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
               ret.push(t);
        }

        return ret;
    }

    this.remove_trace = function(x1,y1,x2,y2){
        var ix = this.find_trace(x1,y1,x2,y2);
        if(ix < 0)
            throw("pcb_trace: trace not found");
        this.traces.removeAt(ix);
    }
}
