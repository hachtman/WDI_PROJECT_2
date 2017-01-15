'use strict';

// @flow
console.log('linked');
//Create the app object.
var App = App || {};
var google = google;

//Create the street view map object.
App.streetView = {};
//Create the minimap object.
App.minimap = {};
//Create the results map object.
App.resultsMap = {};

//The initiliase function.
App.init = function () {
  //Generic Variables
  this.apiUrl = 'http://localhost:3000/api';
  this.apiKey = 'AIzaSyAS7TL1XkRnMQmOFFOuCMXZOQywapszR7A';

  this.$main = $('.main');

  //Login/logout control flow.
  this.$registerBtn = $('.register');
  this.$loginBtn = $('.login');

  this.$registerBtn.on('click', this.register.bind(this));

  this.gameType = 'world';
  //Coords.
  this.coords = {};
  this.guessCoords = {};
  this.svMaxDist = 1000; //it's over 9000!!!!!!


  //Control flow
  // this.createStreetViewMap();
  // this.createMinimap();
  // this.findNearestPanorama(this.randomCoordsEurope());
};

App.register = function (e) {
  if (e) e.preventDefault();
  this.$main.html('\n      <div class="logged-out register-form">\n        <h3>Register</h3>\n        <div class="row">\n          <div class="six columns"\n          <form method="post" action="/register">\n\n          </form>\n        </div>\n      </div>\n    ');
};

//Draw line btween two markers.
App.drawLineBetweenMarkers = function () {
  var resultsLine = new google.maps.PolyLine({
    path: [new google.maps.LatLng(App.coords), new google.maps.LatLng(App.guessCoords)],
    map: App.resultsMap,
    strokeColor: '#FFEEFF',
    strokeOpacity: 0.8,
    strokeWeight: 8
  });
};

//Show the results markers.
App.createResultsMarkers = function () {
  var userLatLng = new google.maps.LatLng(App.guessCoords.lat, App.guessCoords.lng);
  var actLatLng = new google.maps.LatLng(App.coords.lat, App.coords.lng);
  var userMarker = new google.maps.Marker({
    position: userLatLng,
    map: App.resultsMap,
    animation: google.maps.Animation.DROP
  });
  var actualMarker = new google.maps.Marker({
    position: actLatLng,
    map: App.resultsMap,
    animation: google.maps.Animation.DROP
  });
  console.log(userMarker, actualMarker);
};

//Create the results map.
App.showResults = function () {
  App.clearMaps();
  var resultsMapCanvas = document.createElement('div');
  resultsMapCanvas.setAttribute('id', 'results-map-canvas');
  resultsMapCanvas.setAttribute('class', 'results-map-canvas');
  App.$main.append(resultsMapCanvas);
  var resultsMapOptions = {
    center: new google.maps.LatLng(0, 0),
    zoom: 1,
    mapTypeControl: true,
    streetViewcontrol: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  App.resultsMap = new google.maps.Map(resultsMapCanvas, resultsMapOptions);
};

App.clearMaps = function () {
  $('main').empty();
};

//Calc radians.
App.radians = function (coord) {
  return coord * Math.PI / 180;
};

//Calc the dist between two points.
App.haversineDist = function () {
  console.log('haversine fired');
  var earthRadius = 6378137;
  var lng1 = App.coords.lng;
  var lng2 = App.guessCoords.lng;
  var lat1 = App.coords.lat;
  var lat2 = App.guessCoords.lat;

  var x1 = lat2 - lat1;
  var dLat = App.radians(x1);
  var x2 = lng2 - lng1;
  var dLng = App.radians(x2);

  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(App.radians(lat1)) * Math.cos(App.radians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var dist = earthRadius * c;
  console.log(dist);
  return dist; //In meters.
};

//Add click listener.
App.addMiniMapEventListener = function () {
  App.minimap.addListener('click', function (e) {
    var lat = parseFloat(e.latLng.lat());
    var lng = parseFloat(e.latLng.lng());
    // App.guessCoords = 'latlng=' + lat +', ' + lng;
    App.guessCoords = { lat: lat, lng: lng };
    console.log(App.guessCoords);
    App.haversineDist();
  });
};

App.createMinimap = function () {
  var mmCanvas = document.createElement('div');
  mmCanvas.setAttribute('id', 'minimap-canvas');
  mmCanvas.setAttribute('class', 'minimap-canvas');
  // $('.minimap-holder').append(mmCanvas);
  App.$main.append(mmCanvas);
  console.log(mmCanvas);
  var mmOptions = {
    center: new google.maps.LatLng(0, 0),
    zoom: 2,
    mapTypeControl: true,
    streetViewcontrol: false,
    fullscreenControl: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  App.minimap = new google.maps.Map(mmCanvas, mmOptions);
  App.addMiniMapEventListener();
};

//Render the street view map.
App.createStreetViewMap = function () {
  var svCanvas = document.createElement('div');
  svCanvas.setAttribute('id', 'street-view-canvas');
  svCanvas.setAttribute('class', 'street-view-canvas');
  App.$main.append(svCanvas);
  App.streetView = new google.maps.StreetViewPanorama(svCanvas, {
    position: { lat: 0, lng: 0 },
    addressControl: false,
    linksControl: false,
    pov: {
      heading: 30,
      pitch: -10,
      zoom: 1
    }
  });
};

//Find the nearest panorama. Working, though not toally random. Bonus to fix using recursive function.
App.findNearestPanorama = function (coords) {
  var svService = new google.maps.StreetViewService();
  var latLng = new google.maps.LatLng(coords.lat, coords.lng);
  svService.getPanorama({ location: latLng, radius: App.svMaxDist }, function (data, status) {
    console.log(data);
    if (status === 'OK') {
      var panoLat = data.location.latLng.lat();
      var panoLng = data.location.latLng.lng();
      App.coords = { lat: panoLat, lng: panoLng };
      App.setPosition();
    } else {
      App.svMaxDist = App.svMaxDist * 1.2;
      console.log(App.svMaxDist);
      App.findNearestPanorama(App.randomCoordsEurope());
    }
  });
};

//Pick random Europe.
App.randomCoordsEurope = function () {
  var ranLat = App.getRandomBetweenRange(-10, 70);
  var ranLng = App.getRandomBetweenRange(30, 70);
  var coords = { lat: ranLat, lng: ranLng };
  return coords;
};

App.randomCoordsUSA = function () {
  var ranLat = App.getRandomBetweenRange(-125, 25);
  var ranLng = App.getRandomBetweenRange(-66, 49);
  var coords = { lat: ranLat, lng: ranLng };
  return coords;
};

//Pick random coordinates.
App.randomCoordsWorld = function () {
  var ranLat = App.getRandomBetweenRange(-170, 170);
  var ranLng = App.getRandomBetweenRange(-170, 170);
  var coords = { lat: ranLat, lng: ranLng };
  return coords;
};

App.setPosition = function () {
  App.streetView.setPosition(App.coords);
};

//GEN FUNCTIONS
//Pull random between range quick.
App.getRandomBetweenRange = function (min, max) {
  return Math.random() * (max - min) + min;
};

$(App.init.bind(App));