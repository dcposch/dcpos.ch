(function(){

/*** Ember ***/
Ember.Handlebars.registerBoundHelper('num', function(num){
    if(num == null){
        return '-'
    }
    return num.toFixed(2)
})
Ember.Handlebars.registerHelper('debug', function(optionalValue) {
  console.log('Current Context:')
  console.log(this)
  if (optionalValue) {
    console.log('Value:')
    console.log(optionalValue)
  }
})

App = Ember.Application.create()

App.Car = Ember.Object.extend({
    speedKph: null,
    speedMph: function(){
        return this.get('speedKph')*0.621371
    }.property('speedKph'),
    distM: 0,
    distKm: function(){
        return this.get('distM')*0.001
    }.property('distM')
})

var car = window.fuu = App.Car.create()
car.cells = []
App.IndexRoute = Ember.Route.extend({
    model: function(){
        return car
    }
})


/*** D3 ***/
var battery = batteryChart()
    .width(250)
    .height(350)
var power = powerChart()
function update(){
    d3.select('#battery').datum(car.cells).call(battery);
    d3.select('#power').datum(car).call(power);
}

/*** Mock data ***/
for(var i = 0; i < 35; i++){
    car.cells[i] = {
        voltage: 3.5,
        temperature: 48
    }
}
setInterval(function(){
    car.set('speedKph', 100+Math.random())
    car.set('distM', car.get('distM')+1)

    // battery
    var d = Math.random()-0.5;
    for(var i = 0; i < 35; i++){
        car.cells[i].voltage += (Math.random()-0.5)*0.001 + d*0.008+(i-15)*0.00001;
        car.cells[i].temperature += (Math.random()-0.5)*0.02 + d*0.07; 
    }

    // power
    car.arrayCurrent = -8 + Math.random();
    car.motorCurrent = 4 + 8*Math.random();
    car.busCurrent = car.arrayCurrent + car.motorCurrent;
    car.busVoltage = 0;
    for(var i = 0; i < 35; i++) car.busVoltage += car.cells[i].voltage;

    update();
}, 50)
})()
