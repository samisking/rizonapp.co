var currentLocationLat,
    currentLocationLong,
    currentTime = new Date(),
    geocoder,
    locationStr,
    level_1,
    level_2,
    fallbackLat  = '51.5073',
    fallbackLong = '0.1276',
    fallbackName = 'London, GB';





// Request current location from browser
// -------------------------------------

// Check if location authorization has already happened
function checkauthorizedGeoLocation(){
    if(typeof localStorage['authorizedGeoLocation'] == "undefined" || localStorage['authorizedGeoLocation'] == "0" ) {
        return false;
    } else {
        return true;
    }
}

function getCurrentLocation() {
  console.log('Locating…');

  // if geolocation is not supported
  if (!navigator.geolocation){
    // fall back to central london coords
    currentLocationLat   = fallbackLat;
    currentLocationLong  = fallbackLong;

    var sunTimes = calculateTimes(currentLocationLat, currentLocationLong);
    render(sunTimes);

    alert('Geolocation is not supported by your browser. Defaulting to London for now.');

    // now store error in localstorage
    localStorage['authorizedGeoLocation'] = 0;
  }

  // if geolocation is successful
  function locationSuccess(position) {
    // get results from browser geolocation
    currentLocationLat   = position.coords.latitude.toFixed(4);
    currentLocationLong  = position.coords.longitude.toFixed(4);

    var sunTimes = calculateTimes(currentLocationLat, currentLocationLong);
    render(sunTimes);

    console.log('successfully got location');

    // now store the setting in localstorage
    localStorage['authorizedGeoLocation'] = 1;
  }

  // if there's an error
  function locationError() {
    // fall back to central london coords
    currentLocationLat   = fallbackLat;
    currentLocationLong  = fallbackLong;

    var sunTimes = calculateTimes(currentLocationLat, currentLocationLong);
    render(sunTimes);

    console.log('Unable to get location. Fallback to London.');

    // now store error in localstorage
    localStorage['authorizedGeoLocation'] = 0;
  }

  // get the users current position
  navigator.geolocation.getCurrentPosition(locationSuccess, locationError);
}





// Reverse Geo-Code location name from Google
// ------------------------------------------

function initialize() {
  geocoder = new google.maps.Geocoder();
}

function reverseGeoName(lat, lng, callback) {
  var latlng = new google.maps.LatLng(lat, lng),
      locationStr = null;

  geocoder.geocode({
    'latLng': latlng
  }, function(results, status) {
    if (status == google.maps.GeocoderStatus.OK) {
      for (var x = 0, length_1 = results.length; x < length_1; x++){
        for (var y = 0, length_2 = results[x].address_components.length; y < length_2; y++){
          var type = results[x].address_components[y].types[0];
          if (type === "country") {
            level_1 = results[x].address_components[y].short_name;
            if (level_2) break;
          } else if (type === "locality"){
            level_2 = results[x].address_components[y].short_name;
            if (level_1) break;
          }
        }
      }

      // Format the location into a string
      locationStr = level_2 + ', ' + level_1;
      callback(locationStr);
    } else {
      alert('Geocoder failed :(');
    }
  });
}

google.maps.event.addDomListener(window, 'load', initialize);





// Calculate times
// ---------------

function calculateTimes(lat, lng) {

  // new suncalc obj
  var suncalc = SunCalc.getTimes(currentTime, lat, lng);

  // set up time variables
  var amGoldenHourStart = suncalc.dawn,
      amGoldenHourEnd   = suncalc.goldenHourEnd,
      pmGoldenHourStart = suncalc.goldenHour,
      pmGoldenHourEnd   = suncalc.dusk;

  var sunTimes = {
    amGoldenHourStart:  amGoldenHourStart,
    amGoldenHourEnd:    amGoldenHourEnd,
    pmGoldenHourStart:  pmGoldenHourStart,
    pmGoldenHourEnd:    pmGoldenHourEnd
  };

  return sunTimes;
}





// Render to some UI
// -----------------

function render(times) {

  // Format times
  var amGoldenHourStart = formatTime(times.amGoldenHourStart),
      amGoldenHourEnd   = formatTime(times.amGoldenHourEnd),
      pmGoldenHourStart = formatTime(times.pmGoldenHourStart),
      pmGoldenHourEnd   = formatTime(times.pmGoldenHourEnd);

  // Output times
  document.querySelector('.js--am-gh-s').innerHTML = amGoldenHourStart;
  document.querySelector('.js--am-gh-e').innerHTML = amGoldenHourEnd;
  document.querySelector('.js--pm-gh-s').innerHTML = pmGoldenHourStart;
  document.querySelector('.js--pm-gh-e').innerHTML = pmGoldenHourEnd;

  // Output location name
  var currentLocationLatDirection = (currentLocationLat > 0) ? 'N' : 'S',
      currentLocationLongDirection = (currentLocationLong > 0) ? 'E' : 'W',
      coordsLatStr = currentLocationLat + '°' + currentLocationLatDirection,
      coordsLongStr = currentLocationLong + '°' + currentLocationLongDirection;

  reverseGeoName(currentLocationLat, currentLocationLong, function(currentLocationName) {
    document.querySelector('.js--location-name').innerHTML = currentLocationName;
    document.querySelector('.js--location-coords').innerHTML = coordsLatStr + ', ' + coordsLongStr;
  });
}


function formatTime(date) {
  var hours = date.getHours(),
      mins  = date.getMinutes();

  if (hours < 10) hours = '0'+hours;
  if (mins < 10) mins = '0'+mins;

  return hours+""+mins;
}




// Now we say what to display and when
// -----------------------------------

if (checkauthorizedGeoLocation()) {
  // if location has been authorized, then we don't show the pre-flight message
  document.body.classList.add('state--post-flight');

  // and do our regular things
  getCurrentLocation();
} else {
  // else we show the "allow acces" button
  document.body.classList.add('state--pre-flight');

  // handle what to do when you click the button
  document.querySelector('.js--show-times').onclick = function(event) {
    event.preventDefault();

    // hide pre-flight and show post-flight
    document.body.classList.remove('state--pre-flight');
    document.body.classList.add('state--post-flight');
    getCurrentLocation();
  }
}


var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

var todaysDate = currentTime.getDate(),
    todaysMonth = monthNames[currentTime.getMonth()],
    todaysYear = currentTime.getFullYear();

document.querySelector('.js--todays-date').innerHTML = todaysDate+' '+todaysMonth+', '+todaysYear;
