// @flow
console.log('linked');
//Create the app object.
const App      = App || {};
const google   = google;

//Create the street view map object.
App.streetView  = {};
//Create the minimap object.
App.minimap     = {};

//The initiliase function.
App.init = function() {
  //Generic Variables
  this.apiUrl       = 'http://localhost:3000/api';
  this.apiKey       = 'AIzaSyAS7TL1XkRnMQmOFFOuCMXZOQywapszR7A';


  this.$main        = $('.main');
  this.$registerBtn = $('.register');
  this.$loginBtn    = $('.login');

  this.gameType     = 'world';
  //Coords.
  this.coords       = {};
  this.guessCoords  = {};

  //Control flow
  this.createStreetViewMap();
  this.createMinimap();

  this.findNearestPanorama(this.randomCoordsEurope());
};

//Calc radius.
App.radians = function(coord) {
  return coord * Math.PI / 180;
};

App.haversineDist = function(coords, guessCoords) {
  const earthRadius = 6378137;
  const lng1 = coords.lng;
  const lng2 = guessCoords.lng;
  const lat1 = coords.lat;
  const lat2 = guessCoords.lat;

  const x1 = lat2 - lat1;
  const dLat = App.radians(x1);
  const x2 = lng2 - lng1;
  const dLng = App.radians(x2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(App.radians(lat1)) * Math.cos(App.radians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = earthRadius * c;
  return dist;
};



//Add click listener.
App.addMiniMapEventListener = function() {
  App.minimap.addListener('click', function(e) {
    const lat = parseFloat(e.latLng.lat());
    const lng = parseFloat(e.latLng.lng());
    // App.guessCoords = 'latlng=' + lat +', ' + lng;
    App.guessCoords = {lat: lat, lng: lng};
    console.log(App.guessCoords);
    App.haversineDist(App.coords, App.guessCoords);
  });
};

App.createMinimap = function() {
  const mmCanvas  = document.createElement('div');
  mmCanvas.setAttribute('id', 'minimap-canvas');
  mmCanvas.setAttribute('class', 'minimap-canvas');
  // $('.minimap-holder').append(mmCanvas);
  App.$main.append(mmCanvas);
  console.log(mmCanvas);
  const mmOptions = {
    center: new google.maps.LatLng(0, 0),
    zoom: 2,
    mapTypeControl: false,
    streetViewcontrol: false,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  App.minimap = new google.maps.Map(mmCanvas, mmOptions);
  App.addMiniMapEventListener();
};

//Render the street view map.
App.createStreetViewMap = function() {
  const svCanvas = document.createElement('div');
  svCanvas.setAttribute('id', 'street-view-canvas');
  svCanvas.setAttribute('class', 'street-view-canvas');
  App.$main.append(svCanvas);
  App.streetView = new google.maps.StreetViewPanorama(
    svCanvas,
    {
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

//Pull a random landmark.
// https://maps.googleapis.com/maps/api/place/radarsearch/json?location=51.503186,-0.126446&radius=5000&type=museum&key=YOUR_API_KEY

//Find the nearest panorama. Working, though not toally random. Bonus to fix using recursive function.
App.findNearestPanorama = function(coords) {
  const svService   = new google.maps.StreetViewService();
  const svMaxDist = 10000000000000; //it's over 9000!!!!!!
  const latLng = new google.maps.LatLng(coords.lat, coords.lng);
  svService.getPanorama({location: latLng, radius: svMaxDist}, function(data, status) {
    console.log(data);
    if (status === 'OK') {
      const panoLat = data.location.latLng.lat();
      const panoLng = data.location.latLng.lng();
      App.coords    = { lat: panoLat, lng: panoLng };
      App.setPosition();
    } else {
      return 'find nearest broke.';
    }
  });
};

//Pick random Europe.
App.randomCoordsEurope = function() {
  const ranLat = App.getRandomBetweenRange(-10, 70);
  const ranLng = App.getRandomBetweenRange(30, 70);
  const coords = { lat: ranLat, lng: ranLng };
  return coords;
};

//Pick random coordinates.
App.randomCoordsWorld = function() {
  const ranLat = App.getRandomBetweenRange(-80, 100);
  const ranLng = App.getRandomBetweenRange(-80, 100);
  const coords = { lat: ranLat, lng: ranLng };
  return coords;
};

App.setPosition = function() {
  App.streetView.setPosition(App.coords);
};

//GEN FUNCTIONS
//Pull random between range quick.
App.getRandomBetweenRange = function(min, max) {
  return (Math.random() * (max - min) + min);
};

$(App.init.bind(App));
