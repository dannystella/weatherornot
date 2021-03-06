const axios = require('axios');
const geocoder = require('google-geocoder');
const config = require('./config.js');

// GET REQUEST TO GOOGLEMAPS API FOR LAT/LONG/ ORIGIN/DESTINATION AND DISTANCE/TIME

/*
commute = {
  origin: {
    lat:
    lng:
  },
  destination: {
    lat:
    lng:
  }
  time: UTC,
  aOrD: 'A'
}
*/

exports.getTravelTime = (commute) => {
  const {
    origin, destination, time, aOrD,
  } = commute;

  const rootURL = 'https://maps.googleapis.com/maps/api/directions/json?';
  const originStr = `${origin.latitude},${origin.longitude}`;
  const destinationStr = `${destination.latitude},${destination.longitude}`;
  const deptOrArive = (aOrD === 'A') ? 'arrival_time' : 'departure_time';

  // get the UTC string for the arrival or departure time for today's date
  let today = new Date().toString().split(' ');
  today[4] = time;
  today = Date.parse(today.join(' '));

  const URL = `${rootURL}origin=${originStr}&destination=${destinationStr}&${deptOrArive}=${today}&key=${config.googleMapsAPI}&mode="walking"`;

  return axios.get(URL)
    .then((data) => {
      if (data.data.routes.length > 0) {
        let duration = data.data.routes[0].legs[0].duration

        let currentArival = (aOrD === 'A') ? today : today - duration.value;
        let currentDeparture = (aOrD === 'D') ? today : today + duration.value;

        return Object.assign(commute, { travelTime: duration, departure: currentDeparture, arrival: currentArival});
      }
      return Object.assign(commute, { travelTime: { text: 'N/A', value: null } });
    });
};


// GET REQUEST TO DARK SKY API, IF NO LATITUDE OR LONGITUDE, RETURN PRESET
// takes lat and lng for a given place
exports.getWeather = (place) => {
  const rootUrl = 'https://api.darksky.net/forecast';
  const APIKey = config.darkSkyAPI;

  return axios.get(`${rootUrl}/${APIKey}/${place.latitude},${place.longitude}`)
    .then((data, err) => Object.assign(place, { weather: { current: data.data.currently, hourly: data.data.hourly } }))
    .catch(err => console.log(err, place));
};

exports.geo = geocoder({
  key: config.geocodeAPI,
});
