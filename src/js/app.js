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
  this.$body        = $('body');
  this.gameType     = '';
  this.mapType      = 0;

  this.userScore= [];

  //Login/logout control flow.
  this.$registerBtn = $('.register');
  this.$register    = $('.register-form');
  this.$loginBtn    = $('.login');
  this.$logoutBtn   = $('.logout');
  this.$status      = $('.status');
  this.$usersIndex  = $('.users-index');
  this.$modal       = $('.status-modal');

  //Event listener
  this.$registerBtn.on('click', this.register.bind(this));
  this.$loginBtn.on('click', this.login.bind(this));
  this.$logoutBtn.on('click', this.logout.bind(this));
  // this.$usersIndex.on('click', this.profile.bind(this));
  this.$status.on('click', this.showStatus.bind(this));

  $('body').on('submit', 'form', this.handleForm);

  //Coords.
  this.coords       = {};
  this.guessCoords  = {};
  this.svMaxDist    = 1000; //it's over 9000!!!!!!
  this.checkLoggedIn();

  this.startOptions();
  this.createStatus();
};

App.checkLoggedIn = function() {
  if (this.getToken()) {
    this.loggedinState();
  } else {
    this.loggedOutState();
  }
};
//User FUNCTIONS
App.profile = function(e) {
  if (e) e.preventDefault();
  const url = `${this.apiUrl}/users`;

  return this.ajaxRequest(url, 'get', null, data => {
    console.log(data);
    App.$main.prepend(`
      <div class="container index-modal modal">
        <div class="row">
          <h3>who's been playing</h3>
        </div>
      </div>
      `);
  });
};

App.startOptions = function() {
  App.$main.css({ 'height': '440px', 'vertical-align': 'middle'});
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
        App.findNearestPanorama(App.randomCoordsWorld());
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
        <h3 class="subtitle">sign up above to play</h3>
      </div>
      <div class="row">
        <div class="four columns">
          <button class="about">about</button>
        </div>
        <div class="four columns">
          <button class="the-code">the code</button>
        </div>
        <div class="four columns">
          <button class="ways-to-play">ways to play</button>
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
  const icon = {
    grey: '../images/pin-red.png',
    black: '../images/black-pin.png'
  };

  const userLatLng = new google.maps.LatLng(App.guessCoords.lat, App.guessCoords.lng);
  const actLatLng = new google.maps.LatLng(App.coords.lat, App.coords.lng);
  const userMarker = new google.maps.Marker({
    position: userLatLng,
    map: App.resultsMap,
    icon: icon.grey,
    animation: google.maps.Animation.DROP
  });
  const actualMarker = new google.maps.Marker({
    position: actLatLng,
    map: App.resultsMap,
    icon: icon.black,
    animation: google.maps.Animation.DROP
  });
  console.log(userMarker, actualMarker);
};
//Create the results map.

App.clearMaps = function() {
  $('main').empty();
};

App.createStatus = function() {
  App.$modal.empty();
  // this.$body.append('<div class="logged-in status-modal"></div>');
  App.$modal.hide();
  App.$modal.append(`
    <div class="container">

      <div class="row">
        <div class="eight columns">
          <h3>status: <strong>${localStorage.username}</strong></h3>
        </div>
        <div class="four columns">
          <button class="scoring-info" type="button">i'm stuck</button>
        </div>
      </div>

      <div class="row last-score">
        <div class="six columns">
          <span class="status-info last-score">
            <p class="info-text">last score:</p>
          </span>
        </div>
        <div class="six columns">
          <span class="status-info last-score">
            <p class="info-text" id="lastScore"></p>
          </span>
        </div>
      </div>

      <div class="row last-dist">
        <div class="six columns">
          <span class="status-info last-dist">
            <p class="info-text">you were:</p>
          </span>
        </div>
        <div class="six columns">
          <span class="status-info last-dist">
            <p class="info-text" id="lastDist"></p>
          </span>
        </div>
      </div>

      <div class="row current-attempts">
        <div class="six columns">
          <span class="status-info current-attempts">
            <p class="info-text">current attempts:</p>
          </span>
        </div>
        <div class="six columns">
          <span class="status-info current-attempts">
            <p class="info-text" id="currentAttempts"></p>
          </span>
        </div>
      </div>

      <div class="row average-score">
        <div class="six columns">
          <span class="status-info average-score">
            <p class="info-text">average score:</p>
          </span>
        </div>
        <div class="six columns">
          <span class="status-info average-score">
            <p class="info-text" id="averageScore"></p>
          </span>
        </div>
      </div>

      <div class="row high-score">
        <div class="six columns">
          <span class="status-info high-score">
            <p class="info-text">high score:</p>
          </span>
        </div>
        <div class="six columns">
          <span class="status-info high-score">
            <p class="info-text" id="highScore"></p>
          </span>
        </div>
      </div>


      <div class="row status-button-row">
        <div class="six columns">
          <button class="close-status" type="button">close</button>
        </div>
        <div class="six columns">
          <button class="next-game">next round</button>
        </div>
      </div>
    </div>
  `);
};

App.showStatus = function() {
  const av   = JSON.parse(localStorage.averageScore).toFixed(2);
  const last = JSON.parse(localStorage.lastScore).toFixed(2);
  const dist = JSON.parse(localStorage.distance).toFixed(2);
  console.log(dist);
  // const high = JSON.parse(localStorage.highScore);

  $('#currentAttempts').html(`${localStorage.currentAttempts}`);
  $('#lastScore').html(last);
  $('#averageScore').html(`${av}`);
  $('#lastDist').html(`${dist} m away.`);
  // $('#highScore').html(`${high}`);
  App.$modal.fadeIn('fast');
  $('.close-status').on('click', function() {
    App.$modal.fadeOut('fast');
  });
};

App.nextGame = function() {
  App.next.hide();
  App.$modal.fadeOut('fast');
  if (App.gameType === '') {
    $('body').css({ 'background-image': 'none' });
    App.$main.html('');
    App.createStreetViewMap();
    App.createMinimap();
    App.findNearestPanorama(App.randomCoordsEurope());
  } else {
    App.gameType = 'london';
    App.$main.html('');
    App.createStreetViewMap();
    App.createMinimap();
    App.findNearestPanorama(App.randomCoordsLondon());
  }
};

App.updateStatus = function() {
  App.next = $('.next-game');
  App.next.show();
  App.next.on('click', App.nextGame);
};

App.showResults = function() {
  App.clearMaps();
  const resultsMapCanvas = document.createElement('div');
  resultsMapCanvas.setAttribute('id', 'results-map-canvas');
  resultsMapCanvas.setAttribute('class', 'results-map-canvas');
  App.$main.append(resultsMapCanvas);

  let position = { lat: 0, lng: 0 };
  let zoom     = 2;
  if (App.gameType === 'london') {
    position = { lat: 51.50194, lng: -0.1378 };
    zoom = 9;
  }
  const cleanMapStyles  = [
    {
      'featureType': 'poi',
      'elementType': 'all',
      'stylers': [
        {
          'hue': '#000000'
        },
        {
          'saturation': -100
        },
        {
          'lightness': -100
        },
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'poi',
      'elementType': 'all',
      'stylers': [
        {
          'hue': '#000000'
        },
        {
          'saturation': -100
        },
        {
          'lightness': -100
        },
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'administrative',
      'elementType': 'all',
      'stylers': [
        {
          'hue': '#000000'
        },
        {
          'saturation': 0
        },
        {
          'lightness': -100
        },
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'road',
      'elementType': 'labels',
      'stylers': [
        {
          'hue': '#ffffff'
        },
        {
          'saturation': -100
        },
        {
          'lightness': 100
        },
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'water',
      'elementType': 'labels',
      'stylers': [
        {
          'hue': '#000000'
        },
        {
          'saturation': -100
        },
        {
          'lightness': -100
        },
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'road.local',
      'elementType': 'all',
      'stylers': [
        {
          'hue': '#ffffff'
        },
        {
          'saturation': -100
        },
        {
          'lightness': 100
        },
        {
          'visibility': 'on'
        }
      ]
    },
    {
      'featureType': 'water',
      'elementType': 'geometry',
      'stylers': [
        {
          'hue': '#ffffff'
        },
        {
          'saturation': -100
        },
        {
          'lightness': 100
        },
        {
          'visibility': 'on'
        }
      ]
    },
    {
      'featureType': 'transit',
      'elementType': 'labels',
      'stylers': [
        {
          'hue': '#000000'
        },
        {
          'saturation': 0
        },
        {
          'lightness': -100
        },
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'landscape',
      'elementType': 'labels',
      'stylers': [
        {
          'hue': '#000000'
        },
        {
          'saturation': -100
        },
        {
          'lightness': -100
        },
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'road',
      'elementType': 'geometry',
      'stylers': [
        {
          'hue': '#bbbbbb'
        },
        {
          'saturation': -100
        },
        {
          'lightness': 26
        },
        {
          'visibility': 'on'
        }
      ]
    },
    {
      'featureType': 'landscape',
      'elementType': 'geometry',
      'stylers': [
        {
          'hue': '#dddddd'
        },
        {
          'saturation': -100
        },
        {
          'lightness': -3
        },
        {
          'visibility': 'on'
        }
      ]
    }
  ];
  const regMapStyles    = [
    {
      'featureType': 'all',
      'elementType': 'all',
      'stylers': [
        {
          'visibility': 'on'
        }
      ]
    },
    {
      'featureType': 'all',
      'elementType': 'labels',
      'stylers': [
        {
          'visibility': 'on'
        }
      ]
    },
    {
      'featureType': 'administrative',
      'elementType': 'all',
      'stylers': [
        {
          'visibility': 'on'
        }
      ]
    },
    {
      'featureType': 'poi',
      'elementType': 'all',
      'stylers': [
        {
          'visibility': 'off'
        }
      ]
    },
    {
      'featureType': 'road',
      'elementType': 'all',
      'stylers': [
        {
          'visibility': 'on'
        }
      ]
    },
    {
      'featureType': 'road',
      'elementType': 'labels',
      'stylers': [
        {
          'visibility': 'on'
        }
      ]
    },
    {
      'featureType': 'road.local',
      'elementType': 'all',
      'stylers': [
        {
          'weight': '5.91'
        }
      ]
    },
    {
      'featureType': 'water',
      'elementType': 'all',
      'stylers': [
        {
          'visibility': 'on'
        }
      ]
    }
  ];
  App.cleanMapOptions = {
    center: new google.maps.LatLng(position),
    zoom: zoom,
    mapTypeControl: true,
    styles: cleanMapStyles,
    streetViewcontrol: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  App.resultsMapOptions = {
    center: new google.maps.LatLng(position),
    zoom: zoom,
    mapTypeControl: true,
    styles: regMapStyles,
    streetViewcontrol: true,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  App.resultsMap = new google.maps.Map(resultsMapCanvas, App.resultsMapOptions);


  App.createResultsMarkers();
  App.averageScore();

  App.$main.prepend(`<label class="switch ">
    <input type="checkbox">
    <div class="slider round clean-map-switch"></div>
  </label>`);
  App.mapSwitch();
};

App.mapSwitch = function() {
  $('.clean-map-switch').on('click', function() {
    if (App.mapType % 2 === 0) {
      console.log(App.mapType, 'i executed');
      App.mapType ++;
      App.resultsMap.setOptions({options: App.cleanMapOptions});
    } else {
      App.mapType ++;
      App.regularMap();
    }
  });
};

App.regularMap = function() {
  console.log('Im executing');
  App.resultsMap.setOptions({options: App.resultsMapOptions});
};

App.averageScore = function() {
  const user    = JSON.parse(localStorage.userScore);
  const sum     = user.reduce((a, b) => a + b, 0);
  const mean    = (sum / user.length);
  console.log(mean, 'before save');
  localStorage.averageScore = JSON.stringify(mean);
  App.updateStatus();
};

App.calcScore = function(dist) {
  if (App.gameType === 'london' && dist > 55000) {
    const score = 0;
    App.userScore.push(score);
    localStorage.userScore = JSON.stringify(App.userScore);
    App.showResults();
    return true;
  }
  let max = 0;
  console.log(App.gameType);
  if (App.gameType === 'london') {
    max = 150000;
  } else {
    max = 20004146;
  }
  const power    = 4;
  const constant = 100 / (Math.pow(max, power));
  const score    = parseFloat(constant * (Math.pow((max - dist), power)));
  App.userScore.push(score);
  localStorage.lastScore = JSON.stringify(score);
  localStorage.userScore = JSON.stringify(App.userScore);
  App.showResults();
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
  localStorage.distance = JSON.stringify(dist);
  return dist; //In meters.
};

App.updateCurrentAttempts = function() {
  let attmps = JSON.parse(localStorage.currentAttempts);
  attmps++;
  attmps = JSON.stringify(attmps);
  localStorage.currentAttempts = attmps;
};
//Add click listener.
App.addMiniMapEventListener = function() {
  App.minimap.addListener('click', function(e) {
    const lat = parseFloat(e.latLng.lat());
    const lng = parseFloat(e.latLng.lng());
    // App.guessCoords = 'latlng=' + lat +', ' + lng;
    App.guessCoords = {lat: lat, lng: lng};
    console.log(App.guessCoords);
    App.updateCurrentAttempts();
    App.calcScore(App.haversineDist());
  });
};

//Create the minimap.
App.createMinimap = function() {
  const mmHolder = document.createElement('div');
  mmHolder.setAttribute('class', 'minimap-holder');
  $('#street-view-canvas').append(mmHolder);
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
    mapTypeControl: false,
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
  const ranLng = App.getRandomBetweenRange(-0.52, 0.1);
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
  // if (App.$body.classList.contains('dim')){
  //   App.$body.toggleClass('dim');
  // }
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
  App.startOptions();
};

App.logout = function(e) {
  e.preventDefault();
  console.log('LoggedOut');
  this.removeToken();
  this.clearMaps();
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
            <button class="submit" type="submit" value="Login">Login</button>
          </div>
          <div class="six columns">
            <span class="close">
              <button class="close" type="button">Close</button>
            </span>
          </div>
        </div>
      </div>
  `);
  // $('body').toggleClass('dim');
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
  // $('body').toggleClass('dim');
  $('.register-form').fadeIn('fast');
  $('.close').on('click', this.closeModals);
};

App.writeSessionVars = function(data) {
  console.log('session vars written');
  localStorage.username      = data.user.username;
  localStorage.currentUser   = data.user.email;
  console.log(data.user.highScore);
  // if (typeof data.user.highScore === 'undefined') {
  //   localStorage.userHighScore = '0';
  // } else {
  //   localStorage.userHighScore = data.user.highScore;
  // }
  // if (typeof data.user.hometown === 'undefined') {
  //   localStorage.hometown = 'Knoxville, Tennessee';
  // } else {
  //   localStorage.hometown      = data.user.hometown;
  // }
  localStorage.highScore       = '0';
  localStorage.averageScore    = '0';
  localStorage.lastScore       = '0';
  localStorage.currentAttempts = '0';
  localStorage.distance        = '0';
};

App.handleForm = function(e) {
  e.preventDefault();
  const url    = `${App.apiUrl}${$(this).attr('action')}`;
  const method = $(this).attr('method');
  const data   = $(this).serialize();
  console.log(url, method, data);

  return App.ajaxRequest(url, method, data, data => {
    if (data.token) {
      App.setToken(data.token);
      App.closeModals();
      App.checkLoggedIn();
      App.writeSessionVars(data);
      App.createStatus();
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
