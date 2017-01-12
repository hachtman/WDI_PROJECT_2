'use strict';

console.log('linked');
//Create the app object.
var App = App || {};
var google = google;

//Create the street view map object.
App.streetView = {};
//Create the minimap object.
App.minimap = {};

//The initiliase function.
App.init = function () {
  //Gen Variables
  App.apiUrl = 'http://localhost:3000/api';
  App.$main = $('.main');
  App.$registerBtn = $('.register');
  App.$loginBtn = $('.login');
  //Coords.
  App.coords = {};
  App.guessCoords = {};
  //Control flow
  this.createStreetViewMap();
  this.createMinimap();
};

//Street view map control flow. Creates the street view panorama using random data.
App.createStreetViewMap = function () {
  var svCanvas = document.createElement('div');
  svCanvas.setAttribute('id', 'street-view-canvas');
  svCanvas.setAttribute('class', 'street-view-canvas');
  var position = { lat: 42.345573, lng: -71.098326 };
  App.$main.append(svCanvas);
  App.streetView = new google.maps.StreetViewPanorama(svCanvas, {
    position: position,
    addressControl: false,
    linksControl: false,
    pov: {
      heading: 30,
      pitch: -10,
      zoom: 1
    }
  });
};

//Create the mini map
App.createMinimap = function () {
  var mmCanvas = document.createElement('div');
  mmCanvas.setAttribute('id', 'minimap-canvas');
  mmCanvas.setAttribute('class', 'minimap-canvas');
  App.$main.append(mmCanvas);
  console.log(mmCanvas);
  var mmOptions = {
    center: new google.maps.LatLng(0, 0),
    zoom: 1,
    mapTypeControl: false,
    streetViewcontrol: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  App.minimap = new google.maps.Map(mmCanvas, mmOptions);
};

//User marker/coords picker.
App.userMarker = new google.maps.marker({
  map: App.minimap,
  draggable: false
});

//Pick random coordinates.
App.randomCoords = function () {};

App.register = function (e) {
  e.preventDefault();
};

//Run the init function on DOM content loaded.
$(App.init.bind(App));