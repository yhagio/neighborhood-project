// Fetch Weather Information of the city
function fetchWeatherInfo(latInsta, lngInsta) {
  var wURL = "http://api.openweathermap.org/data/2.5/weather?lat="+latInsta+"&lon="+lngInsta+"&units=metric";

  $.ajax({
    type: "GET",
    url: wURL,
    success: renderWeather,
    dataType: "jsonp"
  });
}

// Render Weather Info
var weatherObj = {};
function renderWeather(res) {
  weatherObj.humidity = res.main.humidity + '%';
  weatherObj.temp = res.main.temp + "&#8451;";
  weatherObj.summary = res.weather[0].description;
  weatherObj.iconURL = 'http://openweathermap.org/img/w/'+res.weather[0].icon+'.png';

  // TODO: render them in DOM
  // console.log(weatherObj);
}
