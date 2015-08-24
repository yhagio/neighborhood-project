(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {

  // Populate filter option list for the loaded photos
  populateFilterOptions: function(arr, targetSelectDOM) {
    // Default option
    $("#select-filter-tag").append("<option value='None' selected='selected'>No Tag Filter</option>");

    // Rest of options which are generated dynamically
    // everytime user changes the city location
    var optionTag;
    for(var i = 0, len = arr.length; len > i; i++){
      optionTag = document.createElement("option");
      optionTag.setAttribute("value", arr[i]);
      optionTag.innerHTML = arr[i];
      targetSelectDOM.appendChild(optionTag)
    }
  },

  // Remove all children elements
  clear: function(DOM) {
    while(DOM.firstChild){
      DOM.removeChild(DOM.firstChild);
    }
  },

  // Display error message
  displayError: function(errorMsg) {
    var pTag = document.createElement("p");
    pTag.setAttribute("class", "errorMessage");
    pTag.innerHTML = errorMsg;
    error.appendChild(pTag);
  },

  // Show/hide animation for search bar and search button text
  toggleSearchBar: function(){
    $(".inputBox").toggle(300);
    if ($("#toggle-search").text() === "Search City") {
      $("#toggle-search").text("Search Hide");
      $("#location-input").focus();
    } else {
      $("#toggle-search").text("Search City");
    }
  },

  // Close Sidebar and Search input on selecting a photo or closing side bar
  // If search bar is open, it closes at same time user selects a photo from sidebar
  closeSearchBarOnSelectPhoto: function() {
    window.location.href = window.location.pathname + "#";
    $(".inputBox").hide(300);
    if($("#toggle-search").text() === "Search Hide") {
      $("#toggle-search").text("Search City");
    }
  },

  // When clicking a photo from the view list triggers
  // corresponding infowindow to show on map
  bindClickEventOnPhoto: function(targetDOMId, targetMarker) {
    document.getElementById(targetDOMId).addEventListener("click", (function(marker) {
      return function(){
        google.maps.event.trigger(marker, "click");
      };
    })(targetMarker));
  }

};

},{}],2:[function(require,module,exports){
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
  // Trigger toggle search button to set the "Search"
  $("#toggle-search").trigger("click");
  searchLocation = searchInput.getPlaces();

  // Error handling on invalid location (Empty, Too long, etc)
  if(!searchLocation[0]){
    helpers.displayError("No such place, try again.");
  } else {
    instagramLatitude = searchLocation[0].geometry.location.G;
    instagramLongitude = searchLocation[0].geometry.location.K;

    // Set marker of the city
    map = new google.maps.Map(mapCanvas, {
      zoom: 15,
      center: new google.maps.LatLng(instagramLatitude, instagramLongitude),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    infowindow = new google.maps.InfoWindow();

    // Get and display data on Google Map
    viewModel.fetchPhotos(instagramLatitude, instagramLongitude);
    viewModel.fetchWeatherInfo(instagramLatitude, instagramLongitude);
  }
  // Clear input value after submit
  $("#location-input").val("");
});

// Model
var Model = function(photoId, captionText, data) {
// var Model = function(photoId, imgURL, caption, lat, lon, tags) {

  var self = this;

  self.photoId = ko.observable(photoId);
  self.imgURL = ko.observable(data.images.thumbnail.url);
  self.caption = ko.observable(captionText);
  self.lat = ko.observable(data.location.latitude);
  self.lon = ko.observable(data.location.longitude);
  self.tags = ko.observableArray(data.tags);
  self.username = ko.observable(data.user.username);

  // Create marker on google map
  self.marker = ko.observable(new google.maps.Marker({
    position: new google.maps.LatLng(self.lat(), self.lon()),
    map: map,
    icon: "../images/resized/camera.png"
  }));

  // Add event lsitener to open info window on clicking marker
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

  // Array of instagram data
  photos: ko.observableArray([]),

  // Filter keyword
  filter: ko.observable(""),

  openInfoWindow: function(data){
    // When clicking a photo from the view list triggers corresponding infowindow to show on map
    helpers.bindClickEventOnPhoto(data.photoId(), data.marker());
  },

  fetchPhotos: function(instagramLatitude, instagramLongitude) {
    instagramURL = "https://api.instagram.com/v1/media/search?lat="+instagramLatitude+"&lng="+instagramLongitude+"&access_token=322608956.c39a870.654d8fb14b8d48838cc430bebcb0dede";

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
  hasTitle: function(data) {
    if((data.caption)&&(data.caption.text)){
      return data.caption.text;
    } else {
      return "No Title";
    }
  },

  // Get weather data for the city entered
  fetchWeatherInfo: function(instagramLatitude, instagramLongitude) {
    var wURL = "http://api.openweathermap.org/data/2.5/weather?lat="+instagramLatitude+"&lon="+instagramLongitude+"&units=metric";

    $.ajax({
      type: "GET",
      url: wURL,
      success: viewModel.renderWeather,
      dataType: "jsonp"
    });
  },

  // Display weather information
  renderWeather: function(res) {
    if(!res.main){
      helpers.displayError("No weather found for this city...");
    } else {
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
  var filter = viewModel.filter();
  if (!filter || filter == "None") {
    // When set filter "None" again display all markers on map
    viewModel.photos().forEach(function(i) {
      i.marker().setMap(map);
    });
    return viewModel.photos();
  } else {
    return ko.utils.arrayFilter(viewModel.photos(), function(i) {
        // If filter option applies to a photo, remove the photo's marker
        // as well as from the view list.
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
function initialize() {
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
google.maps.event.addDomListener(window, "load", initialize);


////////////////////////////////////////
// Actions triggered by user's action //

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

},{"./helpers":1}]},{},[2]);
