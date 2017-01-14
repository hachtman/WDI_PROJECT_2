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
  this.apiUrl = 'http://localhost:3000/api';
  this.apiKey = 'AIzaSyDdKSPNiR7eqLvLm9-TE4C6jTHqIP9zmMk';

  this.$main = $('.main');
  this.$registerBtn = $('.register');
  this.$loginBtn = $('.login');
  //Can be landmark. Will dictate which random coordinate function is used.
  this.gameType = 'world';
  //Coords.
  this.coords = {};
  this.guessCoords = {};
  //Control flow
  this.createStreetViewMap(App.randomCoordsWorld());
  this.createMinimap();
  this.addMiniMapEventListener();
};

//Street view map control flow. Creates the street view panorama using random data.
App.createStreetViewMap = function (coords) {
  var svCanvas = document.createElement('div');
  svCanvas.setAttribute('id', 'street-view-canvas');
  svCanvas.setAttribute('class', 'street-view-canvas');
  var position = coords;
  //39.21368134863543, -41.484375
  App.$main.append(svCanvas);
  App.streetView = new google.maps.StreetViewPanorama(svCanvas, {
    position: { lat: App.panorama.lat(), lng: App.panorama.lng() },
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

//Add click listener.
App.addMiniMapEventListener = function () {
  App.minimap.addListener('click', function (e) {
    var lat = e.latLng.lat();
    var lng = e.latLng.lng();
    // App.guessCoords = 'latlng=' + lat +', ' + lng;
    App.guessCoords = lat + ', ' + lng;
    console.log(e);
  });
};

App.testRandomCoords = function (coords) {
  console.log(coords);
  var ssService = new google.maps.StreetViewService();
  var svMaxDist = 100000000000000000000; //it's over 9000!!!!!!
  var latLng = new google.maps.LatLng(coords.lat, coords.lng);
  console.log('alfredo hehe', coords.lat);
  ssService.getPanorama({ location: latLng, radius: svMaxDist }, function (data, status) {
    console.log(status);
    console.log(data);
    if (status === 'OK') {
      App.panorama = data.location.latLng;

      console.log(coords, 'ping');
    } else {
      console.log('false');
    }
  });
};

//Pick random coordinates.
App.randomCoordsWorld = function () {
  var ranLat = App.getRandomBetweenRange(-180, 180);
  var ranLng = App.getRandomBetweenRange(-180, 180);
  var coords = { lat: ranLat, lng: ranLng };
  return coords;
};

//Pull random between range quick.
App.getRandomBetweenRange = function (min, max) {
  return Math.random() * (max - min) + min;
};

App.randomCoordsLandmarks = function () {};

//Authentication.
App.register = function (e) {
  e.preventDefault();
};

//Run the init function on DOM content loaded.
$(App.init.bind(App));