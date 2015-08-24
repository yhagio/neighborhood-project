(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
module.exports = {
  // Populate select option list for filtering photos
  populateFilterOptions: function(arr, selectFilter) {
    var optionTag;
    for(var i = 0, len = arr.length; len > i; i++){
      optionTag = document.createElement("option");
      optionTag.setAttribute("value", arr[i]);
      optionTag.innerHTML = arr[i];
      selectFilter.appendChild(optionTag)
    }
  },

  // Remove children elements
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
    if ($("#toggle-search").text() === "Search") {
      $("#toggle-search").text("Search Hide");
      $("#location-input").focus();
    } else {
      $("#toggle-search").text("Search");
    }
  },

  // Close Sidebar and Search input on selecting a photo or closing side bar
  // If search bar is open, it closes at same time user selects a photo from sidebar
  closeSearchBarOnSelectPhoto: function() {
    window.location.href = window.location.pathname + "#";
    $(".inputBox").hide(300);
    if($("#toggle-search").text() === "Search Hide") {
      $("#toggle-search").text("Search");
    }
  }

};

},{}],2:[function(require,module,exports){
"use strict";

var helpers = require('./helpers');

// Declare resusable variables
var myLatlng;
var mapOptions;
var map;
var infowindow;
var marker;
var mapCanvas = document.getElementById("map-canvas");

var places;
var latInsta;
var lngInsta;
var instagramURL;
var instagramNode = document.getElementById("instagram");

var error = document.getElementById("error");
var selectFilter = document.getElementById("select-filter-tag");

// Google Map Setting
var searchBox = new google.maps.places.SearchBox(document.getElementById("location-input"));

google.maps.event.addListener(searchBox, "places_changed", function() {
  helpers.clear(error);
  $("#toggle-search").trigger("click");
  places = searchBox.getPlaces();

  // Error handling on invalid location (Empty, Too long, etc)
  if(!places[0]){
    helpers.displayError("No such place, try again.");
  } else {
    latInsta = places[0].geometry.location.G;
    lngInsta = places[0].geometry.location.K;

    // Set marker of the city
    map = new google.maps.Map(mapCanvas, {
      zoom: 15,
      center: new google.maps.LatLng(latInsta, lngInsta),
      mapTypeId: google.maps.MapTypeId.ROADMAP
    });
    infowindow = new google.maps.InfoWindow();

    // Get and display data on Google Map
    viewModel.fetchPhotos(latInsta, lngInsta);
    viewModel.fetchWeatherInfo(latInsta, lngInsta);
  }
  // Clear input value after submit
  $("#location-input").val("");
});

// Model
var Model = function(photoId, imgURL, caption, lat, lon, tags) {
  this.photoId = ko.observable(photoId);
  this.imgURL = ko.observable(imgURL);
  this.caption = ko.observable(caption);
  this.lat = ko.observable(lat);
  this.lon = ko.observable(lon);
  this.tags = ko.observableArray(tags);
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

  // Filtered
  filter: ko.observable(""),

  fetchPhotos: function(latInsta, lngInsta) {
    instagramURL = "https://api.instagram.com/v1/media/search?lat="+latInsta+"&lng="+lngInsta+"&access_token=322608956.c39a870.654d8fb14b8d48838cc430bebcb0dede";

    $.ajax({
      type: "GET",
      url: instagramURL,
      dataType: "jsonp",
      success: viewModel.renderPhotos
    });
  },

  // Display Instagram photos in the side bar and set the markers
  renderPhotos: function(res) {
    // Clear select options except 1st default option
    $('#select-filter-tag').slice(1).remove();

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
      for(var i = 0, len = res.data.length; i < len; i++){
        // Set photoId
        photoId = "photo-" + i;

        // Check if the photo has title
        captionText = viewModel.hasTitle(res.data[i]);

        // Save each tag in photo in array
        if(res.data[i].tags.length > 0){
          for (var j = 0, tagLen = res.data[i].tags.length; tagLen > j; j++){
            allTags.push(res.data[i].tags[j]);
          }
        }

        // Add new photo to observable array
        newPhoto = new Model(photoId, res.data[i].images.thumbnail.url, captionText, res.data[i].location.latitude, res.data[i].location.longitude, res.data[i].tags);
        viewModel.photos.push(newPhoto);

        // Add marker for photo
        marker = new google.maps.Marker({
          position: new google.maps.LatLng(res.data[i].location.latitude, res.data[i].location.longitude),
          map: map,
          icon: "../images/resized/camera.png"
        });

        // Add event lsitener to open info window on clicking marker
        google.maps.event.addListener(marker, "click", (function(marker, i) {
          var infowindowContent =
            "<div class='infoWindow'>" +
              "<img src='" + res.data[i].images.thumbnail.url + "'>" +
              "<p>" + viewModel.hasTitle(res.data[i]) + "</p>" +
              "<b>@" + res.data[i].user.username + "</p>" +
            "</div>";
          return function() {
            infowindow.setContent(infowindowContent);
            infowindow.open(map, marker);
          };
        })(marker, i));

        // Add event lsitener to open info window on clicking a photo from list
        document.getElementById(photoId).addEventListener("click", (function(marker) {
          return function(){
            google.maps.event.trigger(marker, "click");
          };
        })(marker));
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
  fetchWeatherInfo: function(latInsta, lngInsta) {
    var wURL = "http://api.openweathermap.org/data/2.5/weather?lat="+latInsta+"&lon="+lngInsta+"&units=metric";

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

viewModel.filteredPhotos = ko.computed(function() {
  if(!viewModel.filter()){
    return viewModel.photos();
  }
  var filter = viewModel.filter();
  if (!filter || filter == "None") {
    return viewModel.photos();
  } else {
    return ko.utils.arrayFilter(viewModel.photos(), function(i) {
        if(i.tags.indexOf(filter) > -1) {
          return true;
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

// Button show/hide animation for search bar
$("#toggle-search").click(function(){
  helpers.toggleSearchBar();
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
