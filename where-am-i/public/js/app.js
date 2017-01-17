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
  this.$body = $('body');
  this.gameType = '';

  this.userScore = [];

  //Login/logout control flow.
  this.$registerBtn = $('.register');
  this.$register = $('.register-form');
  this.$loginBtn = $('.login');
  this.$logoutBtn = $('.logout');
  this.$status = $('.status');
  this.$usersIndex = $('.users-index');

  //Event listener
  this.$registerBtn.on('click', this.register.bind(this));
  this.$loginBtn.on('click', this.login.bind(this));
  this.$logoutBtn.on('click', this.logout.bind(this));
  // this.$usersIndex.on('click', this.profile.bind(this));
  this.$status.on('click', this.showStatus.bind(this));

  $('body').on('submit', 'form', this.handleForm);

  //Coords.
  this.coords = {};
  this.guessCoords = {};
  this.svMaxDist = 1000; //it's over 9000!!!!!!
  this.checkLoggedIn();

  this.startOptions();
  this.createStatus();
};

App.checkLoggedIn = function () {
  if (this.getToken()) {
    this.loggedinState();
  } else {
    this.loggedOutState();
  }
};

//User FUNCTIONS
App.profile = function (e) {
  if (e) e.preventDefault();
  var url = this.apiUrl + '/users';

  return this.ajaxRequest(url, 'get', null, function (data) {
    console.log(data);
    App.$main.prepend('\n      <div class="container index-modal modal">\n        <div class="row">\n          <h3>who\'s been playing</h3>\n        </div>\n      </div>\n      ');
  });
};

App.startOptions = function () {
  App.$main.css({ 'height': '440px', 'vertical-align': 'middle' });
  if (this.getToken()) {
    App.$main.html('\n      <div class="container start-options logged-in">\n        <div class="row">\n          <h1 class="title">want to get <strong>lost?</strong></h1>\n          <h3 class="subtitle">choose the world or narrow the scope</h3>\n        </div>\n        <div class="row button-row">\n          <div class="four columns">\n            <button class="the-world start-button">the world</button>\n          </div>\n          <div class="four columns">\n            <button class="london start-button">london</button>\n          </div>\n          <div class="four columns">\n            <button class="coming-soon start-button">coming soon</button>\n          </div>\n        </div>\n      </div>\n    ');
    $('.start-button').on('click', function () {
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
    App.$main.html('\n    <div class="container start-options logged-out">\n      <div class="row">\n        <h1 class="title">want to get <strong>lost?</strong></h1>\n        <h3 class="subtitle">sign up below to play</h3>\n      </div>\n      <div class="row">\n        <div class="four columns">\n          <button class="about">about</button>\n        </div>\n        <div class="four columns">\n          <button class="the-code">the code</button>\n        </div>\n        <div class="four columns">\n          <button class="coming-soon start-button">ways to play</button>\n        </div>\n      </div>\n    </div>\n  ');
  }
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
    label: 'User',
    animation: google.maps.Animation.DROP
  });
  var actualMarker = new google.maps.Marker({
    position: actLatLng,
    map: App.resultsMap,
    label: 'Actual',
    animation: google.maps.Animation.DROP
  });
  console.log(userMarker, actualMarker);
  App.showScore();
};
//Create the results map.
App.showResults = function () {
  App.clearMaps();
  var resultsMapCanvas = document.createElement('div');
  resultsMapCanvas.setAttribute('id', 'results-map-canvas');
  resultsMapCanvas.setAttribute('class', 'results-map-canvas');
  App.$main.append(resultsMapCanvas);

  var position = { lat: 0, lng: 0 };
  var zoom = 2;
  if (App.gameType === 'london') {
    position = { lat: 51.50194, lng: -0.1378 };
    zoom = 8;
  } else {
    position = { lat: 0, lng: 0 };
  }

  var resultsMapOptions = {
    center: new google.maps.LatLng(position),
    zoom: zoom,
    mapTypeControl: true,
    streetViewcontrol: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  App.resultsMap = new google.maps.Map(resultsMapCanvas, resultsMapOptions);
  App.createResultsMarkers();
};

App.clearMaps = function () {
  $('main').empty();
};

App.createStatus = function () {
  this.$body.append('<div class="logged-in status-modal"></div>');
  App.$modal = $('.status-modal');
  App.$modal.hide();
  App.$modal.append('\n    <div class="container">\n      <div class="row">\n        <h3>status: <strong>' + localStorage.username + '</strong></h3>\n      </div>\n      <div class="row session-info">\n        <p class="status-info current-attempts">' + localStorage.currentAttempts + '</p>\n        <p class="status-info average-score">' + localStorage.averageScore + '</p>\n        <p class="status-info last-score">' + localStorage.lastScore + '</p>\n        <button type="button" class="switch-info">Switch score display</button>\n      </div>\n      <div class="row persistent-info">\n        <p class="status-info">Session length</p>\n        <p class="status-info high-score">' + localStorage.highScore + '</p>\n      </div>\n      <div class="row">\n        <button class="close-status" type="button">close</button>\n      </div>\n    </div>\n  ');
};

App.showStatus = function () {
  App.$modal.fadeToggle('fast');
  $('.close-status').on('click', function () {
    App.$modal.fadeOut('fast');
  });
};

App.calcScore = function (dist) {
  if (App.gameType === 'london' && dist > 55000) {
    App.userScore = 0;
    return true;
  }
  var max = 0;
  console.log(App.gameType);
  if (App.gameType === 'london') {
    max = 150000;
  } else {
    max = 20004146;
  }
  var power = 4;
  var constant = 100 / Math.pow(max, power);
  var score = parseFloat(constant * Math.pow(max - dist, power));
  console.log(max, score, dist);

  App.userScore.push(score);
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
    App.calcScore(App.haversineDist());
  });
};

//Create the minimap.
App.createMinimap = function () {
  var mmHolder = document.createElement('div');
  mmHolder.setAttribute('class', 'minimap-holder');
  $('#street-view-canvas').append(mmHolder);
  var mmCanvas = document.createElement('div');
  mmCanvas.setAttribute('id', 'minimap-canvas');
  mmCanvas.setAttribute('class', 'minimap-canvas');
  $('.minimap-holder').append(mmCanvas);
  // App.$main.append(mmCanvas);
  console.log(mmCanvas);

  var position = { lat: 0, lng: 0 };
  var zoom = 1;
  if (App.gameType === 'london') {
    position = { lat: 51.50194, lng: -0.1378 };
    zoom = 8;
  } else {
    position = { lat: 0, lng: 0 };
  }
  var mmOptions = {
    center: new google.maps.LatLng(position),
    zoom: zoom,
    mapTypeControl: false,
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
    showRoadLabels: false,
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
      // if(data.copyright.substr(data.copyright.length - 6) !== 'Google'){};
      var panoLat = data.location.latLng.lat();
      var panoLng = data.location.latLng.lng();
      App.coords = { lat: panoLat, lng: panoLng };
      App.setPosition();
      return true;
    } else {
      if (App.gameType === 'london') {
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
App.randomCoordsEurope = function () {
  var ranLat = App.getRandomBetweenRange(-10, 70);
  var ranLng = App.getRandomBetweenRange(30, 70);
  var coords = { lat: ranLat, lng: ranLng };
  return coords;
};
App.randomCoordsLondon = function () {
  var ranLat = App.getRandomBetweenRange(51.29, 51.69);
  var ranLng = App.getRandomBetweenRange(-0.52, 0.1);
  var coords = { lat: ranLat, lng: ranLng };
  return coords;
};
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

App.closeModals = function () {
  App.$main.empty();
  // if (App.$body.classList.contains('dim')){
  //   App.$body.toggleClass('dim');
  // }
  App.startOptions();
};

//Login/logout
App.loggedinState = function () {
  $('.logged-in').show();
  $('.logged-out').hide();
  App.startOptions();
};

App.loggedOutState = function () {
  $('.logged-in').hide();
  $('.logged-out').show();
  App.startOptions();
};

App.logout = function (e) {
  e.preventDefault();
  console.log('LoggedOut');
  this.removeToken();
  this.clearMaps();
  this.loggedOutState();
};

App.removeToken = function () {
  return window.localStorage.clear();
};

App.login = function (e) {
  if (e) e.preventDefault();
  this.$main.html('<div class="logged-out login-form"></div>');
  $('.login-form').hide();
  $('.login-form').append('\n    <h3>Login</h3>\n    <form method="post" action="/login">\n      <div class="container">\n        <div class="row">\n          <label for="email">Email</label>\n          <input name="user[email]" class="u-full-width" type="text" placeholder="email" id="email">\n        </div>\n        <div class="row">\n          <label for="password">Password</label>\n          <input name="user[password]" class="u-full-width" type="password" placeholder="password" id="password">\n        </div>\n        <div class="row">\n          <div class="six columns">\n            <button class="submit" type="submit" value="Login">Login</button>\n          </div>\n          <div class="six columns">\n            <span class="close">\n              <button class="close" type="button">Close</button>\n            </span>\n          </div>\n        </div>\n      </div>\n  ');
  // $('body').toggleClass('dim');
  $('.login-form').fadeIn('fast');
  $('.close').on('click', this.closeModals);
};

App.register = function (e) {
  if (e) e.preventDefault();
  this.$main.html('<div class="logged-out register-form"></div>');
  $('.register-form').hide();
  $('.register-form').append('\n        <h3>Register</h3>\n        <form method="post" action="/register">\n        <div class="container">\n          <div class="row">\n            <label for="username">Username</label>\n            <input name="user[username]" class="u-full-width" type="text" placeholder="username" id="username">\n          </div>\n          <div class="row">\n            <label for="email">Email</label>\n            <input name="user[email]" class="u-full-width" type="text" placeholder="email" id="email">\n          </div>\n          <div class="row">\n            <div class="six columns">\n              <label for="password">Password</label>\n              <input name="user[password]" class="u-full-width" type="password" placeholder="email" id="password">\n            </div>\n            <div class="six columns">\n              <label for="passwordConfirmation">Password Confirmation</label>\n              <input name="user[password2]" class="u-full-width" type="password" placeholder="email" id="passwordConfirmation">\n            </div>\n            <div class="row">\n              <div class="column">\n                <label for="hometown">Hometown (Optional)</label>\n                <input name="user[hometown]" class="u-full-width" typ="text" placeholder="hometown">\n              </div>\n            </div>\n            <div class="row">\n            <div class="six columns">\n              <button class="submit" type="submit" value="Register">Register</button>\n            </div>\n            <div class="six columns">\n              <span class="close"><button type="button" class="close">close</button></close>\n            </div class="six columns">\n          </div>\n        </form>\n    ');
  // $('body').toggleClass('dim');
  $('.register-form').fadeIn('fast');
  $('.close').on('click', this.closeModals);
};

App.writeSessionVars = function (data) {
  console.log('session vars written');
  localStorage.username = data.user.username;
  localStorage.currentUser = data.user.email;
  if (data.user.highScore === 'undefined') {
    localStorage.userHighScore = 0;
  } else {
    localStorage.userHighScore = data.user.highScore;
  }
  if (data.user.hometown === 'undefined') {
    localStorage.hometown = 'Knoxville, Tennessee';
  } else {
    localStorage.hometown = data.user.hometown;
  }
  localStorage.averageScore = '0';
};

App.handleForm = function (e) {
  e.preventDefault();
  var url = '' + App.apiUrl + $(this).attr('action');
  var method = $(this).attr('method');
  var data = $(this).serialize();
  console.log(url, method, data);

  return App.ajaxRequest(url, method, data, function (data) {
    if (data.token) {
      App.setToken(data.token);
      App.closeModals();
      App.checkLoggedIn();
      App.writeSessionVars(data);
    }
  });
};

App.ajaxRequest = function (url, method, data, callback) {
  return $.ajax({
    url: url,
    method: method,
    data: data,
    beforeSend: this.setRequestHeader.bind(this)
  }).done(callback).fail(function (data) {
    console.log(data);
  });
};

App.setRequestHeader = function (xhr) {
  return xhr.setRequestHeader('Authorization', 'Bearer ' + this.getToken());
};

App.setToken = function (token) {
  return window.localStorage.setItem('token', token);
};

App.getToken = function () {
  return window.localStorage.getItem('token');
};

$(App.init.bind(App));