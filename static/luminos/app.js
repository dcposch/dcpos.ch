(function(){

/***** Views *****/
var battery = batteryChart()
    .width(250)
    .height(272)
var power = powerChart()
var speedTable = teeTable()
    .title('SPEED/DIST')
    .add(null,'kph', function(d){
        return d.speedKph
    }, 1)
    .add(null,'mph', function(d){
        return d.speedKph*0.6214
    }, 1)
    .add(null,'km', function(d){
        return d.distM*0.001
    }, 2)
var batteryTable = teeTable()
    .title('BATTERY')
    .add('', 'Ah &Sigma;I dt', function(d){
        return d.busAmpHours
    }, 3)
    .add('', 'W &nbsp;bus IV', function(d){
        return d.busVoltage*d.busCurrent
    }, 0)
    .add('', 'A &nbsp;bus', function(d){
        return d.busCurrent
    }, 2)
    .add('', 'V &nbsp;bus', function(d){
        return d.busVoltage
    }, 1)
    .add('', 'V &nbsp;&Sigma;cell', function(d){
        return d.cells.reduce(function(a,b){return a+b.voltage}, 0)
    }, 1)
var lowPowerTable = teeTable()
    .title('28V SYSTEM')
    .add('', 'V', function(d){
        return d.lowPowerVoltage
    }, 2)
    .add('', 'mA', function(d){
        return d.lowPowerCurrent*1000
    }, 0)
    .add('', 'W', function(d){
        return d.lowPowerCurrent*d.lowPowerVoltage
    }, 2)


/***** Model *****/
var car = {
    speedKph: 0,
    distM: 0,
    cells: [],
    busVoltage: 0,
    busCurrent: 0,
    motorCurrent: 0,
    arrayCurrent: 0,
    busAmpHours: 0,
    lowPowerVoltage: 28,
    lowPowerCurrent: 0.3
}


/***** Controller *****/
function update(){
    // charts
    d3.select('#battery').datum(car.cells).call(battery)
    d3.select('#power').datum(car).call(power)
    d3.select('#speedTable').datum(car).call(speedTable)
    d3.select('#batteryTable').datum(car).call(batteryTable)
    d3.select('#lowPowerTable').datum(car).call(lowPowerTable)
}


/***** Fake data for testing *****/
for(var i = 0; i < 35; i++){
    car.cells[i] = {
        voltage: 3.5,
        temperature: 48
    }
}
car.cells[23].voltage -= 0.2
setInterval(function(){
    car.speedKph = 100+Math.random()
    car.distM += 1

    // battery
    var d = Math.random()-0.5
    for(var i = 0; i < 35; i++){
        car.cells[i].voltage += (Math.random()-0.5)*0.001 
            + d*0.008+(i-25)*0.00001
        car.cells[i].temperature += (Math.random()-0.5)*0.2 
            + d*0.7+(i-20)*0.0005
    }

    // power
    car.arrayCurrent = -8 + Math.random()
    car.motorCurrent = 4 + 8*Math.random()
    car.busCurrent = car.arrayCurrent + car.motorCurrent
    car.busVoltage = car.cells.reduce(function(a,b){return a+b.voltage},0)-0.2
    car.busAmpHours += car.busCurrent*0.05/3600

    // 28v
    car.lowPowerVoltage = 28 + (Math.random()-0.5)/2
    car.lowPowerCurrent *= Math.exp((Math.random()-0.5)/10)

    update()
}, 100)
})()

