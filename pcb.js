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

function pcb_traces() {

    this.traces = [];

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

    this.add_trace = function(x1,y1,x2,y2){
        if(this.find_trace(x1,y1,x2,y2) > -1)
            throw("pcb_trace: attempted double add.");
        this.traces.push([x1,y1,x2,y2]);
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
