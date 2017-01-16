// @flow
console.log('linked');
//Create the app object.
const App      = App || {};
const google   = google;

//Create the street view map object.
App.streetView = {};
//Create the minimap object.
App.minimap    = {};
//Create the results map object.
App.resultsMap = {};

//The initiliase function.
App.init = function() {
  //Generic Variables
  this.apiUrl       = 'http://localhost:3000/api';
  this.apiKey       = 'AIzaSyAS7TL1XkRnMQmOFFOuCMXZOQywapszR7A';

  this.$main        = $('.main');
  this.gameType     = '';

  //Login/logout control flow.
  this.$registerBtn = $('.register');
  this.$register    = $('.register-form');
  this.$loginBtn    = $('.login');
  this.$logoutBtn   = $('.logout');
  this.$registerBtn.on('click', this.register.bind(this));
  this.$loginBtn.on('click', this.login.bind(this));
  this.$logoutBtn.on('click', this.logout.bind(this));
  $('body').on('submit', 'form', this.handleForm);

  //Coords.
  this.coords       = {};
  this.guessCoords  = {};
  this.svMaxDist    = 1000; //it's over 9000!!!!!!
  if (this.getToken()) {
    this.loggedinState();
  } else {
    this.loggedOutState();
  }
  this.startOptions();
};

App.startOptions = function() {
  App.$main.css({ 'height': '500px', 'vertical-align': 'middle'});
  if (this.getToken()) {
    App.$main.html(`
      <div class="container start-options logged-in">
        <div class="row">
          <h1 class="title">want to get <strong>lost?</strong></h1>
          <h3 class="subtitle">choose the world or narrow the scope</h3>
        </div>
        <div class="row button-row">
          <div class="four columns">
            <button class="the-world start-button">the world</button>
          </div>
          <div class="four columns">
            <button class="london start-button">london</button>
          </div>
          <div class="four columns">
            <button class="coming-soon start-button">coming soon</button>
          </div>
        </div>
      </div>
    `);
    $('.start-button').on('click', function() {
      if (this.classList.contains('the-world')) {
        $('body').css({ 'background-image': 'none' });
        App.$main.html('');
        App.createStreetViewMap();
        App.createMinimap();
        App.findNearestPanorama(App.randomCoordsEurope());
      } else if (this.classList.contains('london')) {
        App.gameType = 'london';
        App.$main.html('');
        App.createStreetViewMap();
        App.createMinimap();
        App.findNearestPanorama(App.randomCoordsLondon());
      }
    });
  } else {
    App.$main.html(`
    <div class="container start-options logged-out">
      <div class="row">
        <h1 class="title">want to get <strong>lost?</strong></h1>
        <h3 class="subtitle">sign up below to play</h3>
      </div>
      <div class="row">
        <div class="four columns">
          <button class="about">about</button>
        </div>
        <div class="four columns">
          <button class="the-code">the code</button>
        </div>
        <div class="four columns">
          <button class="coming-soon start-button">ways to play</button>
        </div>
      </div>
    </div>
  `);
  }
};

//Draw line btween two markers.
App.drawLineBetweenMarkers = function() {
  const resultsLine = new google.maps.PolyLine({
    path: [
      new google.maps.LatLng(App.coords),
      new google.maps.LatLng(App.guessCoords)
    ],
    map: App.resultsMap,
    strokeColor: '#FFEEFF',
    strokeOpacity: 0.8,
    strokeWeight: 8
  });

};

//Show the results markers.
App.createResultsMarkers = function() {
  const userLatLng = new google.maps.LatLng(App.guessCoords.lat, App.guessCoords.lng);
  const actLatLng = new google.maps.LatLng(App.coords.lat, App.coords.lng);
  const userMarker = new google.maps.Marker({
    position: userLatLng,
    map: App.resultsMap,
    animation: google.maps.Animation.DROP
  });
  const actualMarker = new google.maps.Marker({
    position: actLatLng,
    map: App.resultsMap,
    animation: google.maps.Animation.DROP
  });
  console.log(userMarker, actualMarker);
  App.showScore();
};

//Create the results map.
App.showResults = function() {
  App.clearMaps();
  const resultsMapCanvas = document.createElement('div');
  resultsMapCanvas.setAttribute('id', 'results-map-canvas');
  resultsMapCanvas.setAttribute('class', 'results-map-canvas');
  App.$main.append(resultsMapCanvas);

  let position = { lat: 0, lng: 0 };
  let zoom     = 1;
  if (App.gameType === 'london') {
    position = { lat: 51.50194, lng: -0.1378 };
    zoom = 8;
  } else {
    position = { lat: 0, lng: 0 };
  }

  const resultsMapOptions = {
    center: new google.maps.LatLng(position),
    zoom: zoom,
    mapTypeControl: true,
    streetViewcontrol: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  App.resultsMap = new google.maps.Map(resultsMapCanvas, resultsMapOptions);
  App.createResultsMarkers();
};

App.clearMaps = function() {
  $('main').empty();
};

//Check Score
App.showScore = function() {
  App.$main.append(`
    <div class="container">
      <div class="scoreboard">
        <div class="row">
          <h3>
        </div>
      </div>
    </div>
  `);
};

App.calcScore = function(dist) {
  console.log('ping');
  let max = 0;
  if (App.gameType === 'london') {
    max = 14662;
  } else {
    max = 20004146;
  }
  const power    = 4;
  const constant = 100 / (Math.pow(max, power));
  const score    = parseFloat(constant * (Math.pow((max - dist), power)));
  App.userScore  =  score;
};

//Calc radians.
App.radians = function(coord) {
  return coord * Math.PI / 180;
};

//Calc the dist between two points.
App.haversineDist = function() {
  console.log('haversine fired');
  const earthRadius = 6378137;
  const lng1 = App.coords.lng;
  const lng2 = App.guessCoords.lng;
  const lat1 = App.coords.lat;
  const lat2 = App.guessCoords.lat;

  const x1 = lat2 - lat1;
  const dLat = App.radians(x1);
  const x2 = lng2 - lng1;
  const dLng = App.radians(x2);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(App.radians(lat1)) * Math.cos(App.radians(lat2)) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const dist = earthRadius * c;
  console.log(dist);
  return dist; //In meters.
};

//Add click listener.
App.addMiniMapEventListener = function() {
  App.minimap.addListener('click', function(e) {
    const lat = parseFloat(e.latLng.lat());
    const lng = parseFloat(e.latLng.lng());
    // App.guessCoords = 'latlng=' + lat +', ' + lng;
    App.guessCoords = {lat: lat, lng: lng};
    console.log(App.guessCoords);
    App.calcScore(App.haversineDist());
  });
};

App.createMinimap = function() {
  const mmHolder = document.createElement('div');
  mmHolder.setAttribute('class', 'minimap-holder');
  App.$main.append(mmHolder);
  const mmCanvas  = document.createElement('div');
  mmCanvas.setAttribute('id', 'minimap-canvas');
  mmCanvas.setAttribute('class', 'minimap-canvas');
  $('.minimap-holder').append(mmCanvas);
  // App.$main.append(mmCanvas);
  console.log(mmCanvas);

  let position = { lat: 0, lng: 0 };
  let zoom     = 1;
  if (App.gameType === 'london') {
    position = { lat: 51.50194, lng: -0.1378 };
    zoom = 8;
  } else {
    position = { lat: 0, lng: 0 };
  }
  const mmOptions = {
    center: new google.maps.LatLng(position),
    zoom: zoom,
    mapTypeControl: true,
    streetViewcontrol: false,
    fullscreenControl: true,
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
      showRoadLabels: false,
      pov: {
        heading: 30,
        pitch: -10,
        zoom: 1
      }
    });
};
//Find the nearest panorama. Working, though not toally random. Bonus to fix using recursive function.
App.findNearestPanorama = function(coords) {
  const svService   = new google.maps.StreetViewService();
  const latLng = new google.maps.LatLng(coords.lat, coords.lng);
  svService.getPanorama({location: latLng, radius: App.svMaxDist}, function(data, status) {
    console.log(data);

    if (status === 'OK') {
      // if(data.copyright.substr(data.copyright.length - 6) !== 'Google'){};
      const panoLat = data.location.latLng.lat();
      const panoLng = data.location.latLng.lng();
      App.coords    = { lat: panoLat, lng: panoLng };
      App.setPosition();
      return true;
    } else {
      if (App.gameType ==='london') {
        console.log('london fired');
        App.svMaxDist = App.svMaxDist * 1.1;
        App.findNearestPanorama(App.randomCoordsLondon(), 'london');
      } else {
        App.svMaxDist = App.svMaxDist * 1.5;
        App.findNearestPanorama(App.randomCoordsEurope());
      }
      return true;
    }
  });
};
//Pick random.
App.randomCoordsEurope = function() {
  const ranLat = App.getRandomBetweenRange(-10, 70);
  const ranLng = App.getRandomBetweenRange(30, 70);
  const coords = { lat: ranLat, lng: ranLng };
  return coords;
};
App.randomCoordsLondon = function() {
  const ranLat = App.getRandomBetweenRange(51.29, 51.69);
  const ranLng = App.getRandomBetweenRange(-0.55, 0.1);
  const coords = { lat: ranLat, lng: ranLng };
  return coords;
};
App.randomCoordsWorld = function() {
  const ranLat = App.getRandomBetweenRange(-170, 170);
  const ranLng = App.getRandomBetweenRange(-170, 170);
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

App.closeModals = function() {
  App.$main.empty();
  App.startOptions();
};

//Login/logout
App.loggedinState = function() {
  $('.logged-in').show();
  $('.logged-out').hide();
  App.startOptions();
};

App.loggedOutState = function() {
  $('.logged-in').hide();
  $('.logged-out').show();
};

App.logout = function(e) {
  e.preventDefault();
  console.log('LoggedOut');
  this.removeToken();
  this.loggedOutState();
};

App.removeToken = function() {
  return window.localStorage.clear();
};

App.login = function(e) {
  if (e) e.preventDefault();
  this.$main.html('<div class="logged-out login-form"></div>');
  $('.login-form').hide();
  $('.login-form').append(`
    <h3>Login</h3>
    <form method="post" action="/login">
      <div class="container">
        <div class="row">
          <label for="email">Email</label>
          <input name="user[email]" class="u-full-width" type="text" placeholder="email" id="email">
        </div>
        <div class="row">
          <label for="password">Password</label>
          <input name="user[password]" class="u-full-width" type="password" placeholder="password" id="password">
        </div>
        <div class="row">
          <div class="six columns">
            <button class="submit" type="submit" value="Register">Login</button>
          </div>
          <div class="six columns">
            <span class="close">
              <button class="close type="button">Close</button>
            </span>
          </div>
        </div>
      </div>
  `);
  $('.login-form').fadeIn('fast');
  $('.close').on('click', this.closeModals);
};

App.register = function(e) {
  if (e) e.preventDefault();
  this.$main.html('<div class="logged-out register-form"></div>');
  $('.register-form').hide();
  $('.register-form').append(`
        <h3>Register</h3>
        <form method="post" action="/register">
        <div class="container">
          <div class="row">
            <label for="username">Username</label>
            <input name="user[username]" class="u-full-width" type="text" placeholder="username" id="username">
          </div>
          <div class="row">
            <label for="email">Email</label>
            <input name="user[email]" class="u-full-width" type="text" placeholder="email" id="email">
          </div>
          <div class="row">
            <div class="six columns">
              <label for="password">Password</label>
              <input name="user[password]" class="u-full-width" type="password" placeholder="email" id="password">
            </div>
            <div class="six columns">
              <label for="passwordConfirmation">Password Confirmation</label>
              <input name="user[password2]" class="u-full-width" type="password" placeholder="email" id="passwordConfirmation">
            </div>
            <div class="row">
            <div class="six columns">
              <button class="submit" type="submit" value="Register">Register</button>
            </div>
            <div class="six columns">
              <span class="close"><button type="button" class="close">close</button></close>
            </div class="six columns">
          </div>
        </form>
    `);
  $('.register-form').fadeIn('fast');
  $('.close').on('click', this.closeModals);
};


App.handleForm = function(e) {
  console.log('handle form');
  e.preventDefault();
  const url    = `${App.apiUrl}${$(this).attr('action')}`;
  const method = $(this).attr('method');
  const data   = $(this).serialize();
  console.log(url, method, data);
  return App.ajaxRequest(url, method, data, data => {
    if (data.token) {
      App.setToken(data.token);
    }
  });
};

App.ajaxRequest = function(url, method, data, callback){
  return $.ajax({
    url,
    method,
    data,
    beforeSend: this.setRequestHeader.bind(this)
  })
  .done(callback)
  .fail(data => {
    console.log(data);
  });
};

App.setRequestHeader = function(xhr) {
  return xhr.setRequestHeader('Authorization', `Bearer ${this.getToken()}`);
};

App.setToken = function(token){
  return window.localStorage.setItem('token', token);
};

App.getToken = function(){
  return window.localStorage.getItem('token');
};

$(App.init.bind(App));
