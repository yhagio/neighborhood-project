"use strict";

// Using Browserify to import helper functions
var helpers = require('./helpers');

// Declare resusable variables
var myLatlng;
var mapOptions;
var map;
var infowindow;
var marker;
var mapCanvas = document.getElementById("map-canvas");

var searchLocation;
var instagramLatitude;
var instagramLongitude;
var instagramURL;
var instagramNode = document.getElementById("instagram");

var error = document.getElementById("error");
var selectFilter = document.getElementById("select-filter-tag");

// Google Map Setting
var searchInput = new google.maps.places.SearchBox(document.getElementById("location-input"));

// Everytime location of map changes, following codes fire
google.maps.event.addListener(searchInput, "places_changed", function() {
  // Clear any error message
  helpers.clear(error);
  // Trigger toggle search button text "Search City" / "Search Hide"
  $("#toggle-search").trigger("click");

  searchLocation = searchInput.getPlaces();

  // Error handling on invalid location (Empty, Too long, etc)
  if(!searchLocation[0]){
    helpers.displayError("No such place, try again.");
  } else {
    instagramLatitude = searchLocation[0].geometry.location.G;
    instagramLongitude = searchLocation[0].geometry.location.K;

    // Set map location to the searched city area
    map = new google.maps.Map(mapCanvas, {
      zoom: 15,
      center: new google.maps.LatLng(instagramLatitude, instagramLongitude),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });

    // Assign new infowindow
    infowindow = new google.maps.InfoWindow();

    // Get and display data on Google Map
    viewModel.fetchPhotos(instagramLatitude, instagramLongitude);
    viewModel.fetchWeatherInfo(instagramLatitude, instagramLongitude);
  }
  // Clear input value after submit
  $("#location-input").val("");
});

// Photo Model for Instagram data
var Model = function(photoId, captionText, data) {

  var self = this;

  self.photoId = ko.observable(photoId);
  self.imgURL = ko.observable(data.images.thumbnail.url);
  self.caption = ko.observable(captionText);
  self.lat = ko.observable(data.location.latitude);
  self.lon = ko.observable(data.location.longitude);
  self.tags = ko.observableArray(data.tags);
  self.username = ko.observable(data.user.username);

  // Assing marker for each data from Instagram on google map
  self.marker = ko.observable(new google.maps.Marker({
    position: new google.maps.LatLng(self.lat(), self.lon()),
    map: map,
    icon: "../images/resized/camera.png"
  }));

  // Add event lsitener to each for infowindow
  google.maps.event.addListener(self.marker(), "click", (function(marker) {
    var infowindowContent =
      "<div class='infoWindow'>" +
        "<img src='" + self.imgURL() + "'>" +
        "<p>" + self.caption() + "</p>" +
        "<b>@" + self.username() + "</p>" +
      "</div>";
    return function() {
      infowindow.setContent(infowindowContent);
      infowindow.open(map, marker);
    };
  })(self.marker()));
};

// ViewModel
var viewModel = {

  // Observables for weather
  city: ko.observable(""),
  humidity: ko.observable(""),
  temp: ko.observable(""),
  summary: ko.observable(""),
  iconURL: ko.observable(""),

  // Observable array of instagram data
  photos: ko.observableArray([]),

  // Filter option observable
  filter: ko.observable(""),

  // When clicking a photo from the view list from sidebar
  // triggers corresponding infowindow opens on map
  openInfoWindow: function(data){
    helpers.bindClickEventOnPhoto(data.photoId(), data.marker());
  },

  // Make ajax request to server and get Instagram data based on location
  fetchPhotos: function(instagramLatitude, instagramLongitude) {
    instagramURL = "https://api.instagram.com/v1/media/search?lat="+instagramLatitude+"&lng="+instagramLongitude+"&access_token=322608956.c39a870.654d8fb14b8d48838cc430bebcb0dede&scope=public_content";
    console.log(instagramURL);

    $.ajax({
      type: "GET",
      url: instagramURL,
      dataType: "jsonp",
      success: viewModel.renderPhotos
    });
  },

  // Display Instagram photos in the side bar and set the markers
  renderPhotos: function(res) {
    // Reset filter on rendering
    viewModel.filter('');

    // Clear options from filter selection
    helpers.clear(selectFilter);

    // Array for saving all tags in each photo
    var allTags = [];

    // Error Handling
    if(!res.data){
      helpers.displayError("No photos found...");
    } else {

      // Clear previously loaded photos to prepare for new coming photos
      viewModel.photos.removeAll();

      var newPhoto;
      var captionText;
      var photoId;
      var tagsLen;

      for(var i = 0, len = res.data.length; i < len; i++){
        // Set photoId
        photoId = "photo-" + i;

        // Check if the photo has title
        captionText = viewModel.hasTitle(res.data[i]);

        // Save each tag in photo in array
        tagsLen = res.data[i].tags.length;
        if(tagsLen > 0){
          for (var j = 0; tagsLen > j; j++){
            allTags.push(res.data[i].tags[j]);
          }
        }

        // Add new photo to observable array
        newPhoto = new Model(photoId, captionText, res.data[i]);
        viewModel.photos.push(newPhoto);
      }

      // Remove duplicated tags and save the uniq tags in array "uniqTags"
      var uniqTags = [];
      $.each(allTags, function(i, el){
        if($.inArray(el, uniqTags) === -1) uniqTags.push(el);
      });

      // viewModel.uniqTags.push(uniqTags);
      helpers.populateFilterOptions(uniqTags, selectFilter);

      // Open Side Bar on rendering photos
      window.location.href = window.location.pathname + "#instagram";
    }
  },

  // Check if photo has a title
  // if not, set to "No Title" to prevent error
  hasTitle: function(data) {
    if((data.caption)&&(data.caption.text)){
      return data.caption.text;
    } else {
      return "No Title";
    }
  },

  // Make ajax request to server to get weather data for the city entered
  fetchWeatherInfo: function(instagramLatitude, instagramLongitude) {
    var wURL = "http://api.openweathermap.org/data/2.5/weather?lat="+instagramLatitude+"&lon="+instagramLongitude+"&units=metric&APPID=0fe4e2b61b814cc0158ee3c6ab1a14c9";

    $.ajax({
      type: "GET",
      url: wURL,
      success: viewModel.renderWeather,
      dataType: "jsonp"
    });
  },

  // Display weather information
  renderWeather: function(res) {
    // Error handling
    if(!res.main){
      helpers.displayError("No weather found for this city...");

    } else {

      // Set the received data to each observable to display
      var cityName = res.name;
      var humidity = res.main.humidity + "%";
      var temp = res.main.temp + "℃";
      var summary = res.weather[0].description;
      var iconURL = "http://openweathermap.org/img/w/"+res.weather[0].icon+".png";

      viewModel.city(cityName);
      viewModel.humidity(humidity);
      viewModel.temp(temp);
      viewModel.summary(summary);
      viewModel.iconURL(iconURL);
    }
  }
};

// Filtering photos and markers by selecting an option in the sidebar dropdown
viewModel.filteredPhotos = ko.computed(function() {

  if(!viewModel.filter()){
    return viewModel.photos();
  }

  // Get selected filter option from dropdown
  var filter = viewModel.filter();

  if (!filter || filter == "None") {

    // When set filter "None" again display all markers on map
    viewModel.photos().forEach(function(i) {
      i.marker().setMap(map);
    });

    return viewModel.photos();

  } else {

    // If filter option applies to a photo, remove the photo's marker
    // as well as from the view list.
    return ko.utils.arrayFilter(viewModel.photos(), function(i) {
        if(i.tags.indexOf(filter) > -1) {
          i.marker().setMap(map);
          return true;
        } else {
          i.marker().setMap(null);
        }
    });

  }
});

// Initial Setting of Google Map
function initMap() {

  // Default Location of "Montreal, Canada"
  myLatlng = new google.maps.LatLng(45.5015217,-73.5732091);

  mapOptions = {
    zoom: 15,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(mapCanvas, mapOptions);
  infowindow = new google.maps.InfoWindow({});

  // Fetch photos and weather information
  viewModel.fetchPhotos(45.5015217,-73.5732091);
  viewModel.fetchWeatherInfo(45.5015217,-73.5732091);
}

// Bind ViewModel
ko.applyBindings(viewModel);

// Start
google.maps.event.addDomListener(window, "load", initMap);


// Button show/hide animation for search bar
$("#toggle-search").click(function(){
  helpers.toggleSearchBar();
  $('#main').css("background-color", "rgba(100, 100, 100, 0.5)");
});

// Close Sidebar and Search input on selecting a photo or closing side bar
// If search bar is open, it closes at same time user selects a photo from sidebar
$("#photo-list").click(function(){
  helpers.closeSearchBarOnSelectPhoto();
});

// WIP: Filtering photos on selecting a filter text option
$("#select-filter-tag").change(function(){
  var keyTag = $(this).val();
  viewModel.filter(keyTag);
});
