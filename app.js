(function(){

Ember.Handlebars.registerBoundHelper("num", function(num){
    if(num == null){
        return "-";
    }
    return num.toFixed(2);
});
Ember.Handlebars.registerHelper("debug", function(optionalValue) {
  console.log("Current Context");
  console.log("====================");
  console.log(this);
 
  if (optionalValue) {
    console.log("Value");
    console.log("====================");
    console.log(optionalValue);
  }
});

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

var car = App.Car.create()
App.IndexRoute = Ember.Route.extend({
    model: function(){
        return car
    }
})

setInterval(function(){
    car.set('speedKph', 100+Math.random())
    car.set('distM', car.get('distM')+1)
}, 50)
})()
