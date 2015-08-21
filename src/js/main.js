'use strict';

function initialSetUp(){
  // Default Location "Montreal, Canada"
  var myLatlng = new google.maps.LatLng(45.5015217,-73.5732091);

  var mapOptions = {
    zoom: 11,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  var map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

  var marker = new google.maps.Marker({
    position: myLatlng,
    title: 'Montréal, QC',
    map: map
  });

  var infowindow = new google.maps.InfoWindow({
    content: 'Montréal, QC'
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });
}


function initialize() {
  // Call initial set up function above
  initialSetUp();

  var searchBox = new google.maps.places.SearchBox(document.getElementById('location-input'));


  google.maps.event.addListener(searchBox, 'places_changed', function() {

    var places = searchBox.getPlaces();

    // var city = "Montreal";
    // var country = "ca";
    // var topic = "Javascript";
    // var url = "https://api.meetup.com/2/open_events?&sign=true&photo-host=public&country="+country+"&topic="+topic+"&city="+city+"&page=20";

    // var cityName = places[0].name;
    // var countryName = places[0].address_components[2].;
    var latInsta = places[0].geometry.location.G;
    var lngInsta = places[0].geometry.location.K;

    // Set marker of the city
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
      zoom: 15,
      center: new google.maps.LatLng(latInsta, lngInsta),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    var infowindow = new google.maps.InfoWindow();
    var marker;

    // Instagram Div
    var instagramNode = document.getElementById('instagram');

    while (instagramNode.firstChild) {
      instagramNode.removeChild(instagramNode.firstChild);
    }

    var url = 'https://api.instagram.com/v1/media/search?lat='+latInsta+'&lng='+lngInsta+'&access_token=322608956.c39a870.654d8fb14b8d48838cc430bebcb0dede';

    // Fetch events via AJAX
    function fetchEvents(url) {
      $.ajax({
        type: "GET",
        url: url,
        success: renderEvents,
        dataType: "jsonp"
      });
    }

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
    var weather = {};
    function renderWeather(res) {
      weather.humidity = res.main.humidity + '%';
      weather.temp = res.main.temp + "&#8451;";
      weather.summary = res.weather[0].description;
      // console.log(weather);
      // TODO: render them in DOM
    }

    // Render Instagram
    function renderEvents(res) {
      // console.log('=====RES=====: ', res);
      // Insert each photo to the unordered list inside Instagram div
      var photoParent = document.createElement('ul');
      var listEl;
      var imageEl;
      for(var i = 0; i < res.data.length; i++){
        // Create Photo List and append to ul
        listEl = document.createElement('li');
        imageEl = document.createElement('img');
        imageEl.src = res.data[i].images.thumbnail.url;
        listEl.appendChild(imageEl);
        photoParent.appendChild(listEl);

        // Check if photo has title
        function title(data){
          if((data.caption)&&(data.caption.text)){
            return data.caption.text;
          } else {
            return 'No Title';
          }
        }

        marker = new google.maps.Marker({
          position: new google.maps.LatLng(res.data[i].location.latitude, res.data[i].location.longitude),
          map: map
        });

        // Add event lsitener to open info window on clicking marker
        google.maps.event.addListener(marker, 'click', (function(marker, i) {
          return function() {
            infowindow.setContent('<div class="infoWindow"><img src="'+res.data[i].images.thumbnail.url+'"><p>'+title(res.data[i]) +'</p></div>');
            infowindow.open(map, marker);
          }
        })(marker, i));

        // Add event lsitener to open info window on clicking a photo from list
        listEl.addEventListener('click', (function(marker) {
          return function(){
            google.maps.event.trigger(marker, 'click');
          }
        })(marker));
      }

      // Insert the photo lists to the Instagram div on the rigth side of screen
      instagramNode.insertBefore(photoParent, instagramNode.firstChild);
    }

    fetchEvents(url);
    fetchWeatherInfo(latInsta, lngInsta);
  });

}

google.maps.event.addDomListener(window, 'load', initialize);
