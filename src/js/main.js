'use strict';

var myLatlng;
var mapOptions;
var map;
var infowindow;
var marker;
var mapCanvas = document.getElementById('map-canvas');

var places;
var latInsta;
var lngInsta;
var instagramURL;
var instagramNode = document.getElementById('instagram');

// Model - Photo
var Photo = function(photoId, imgURL, caption, lat, lon) {
  this.photoId = ko.observable(photoId);
  this.imgURL = ko.observable(imgURL);
  this.caption = ko.observable(caption);
  this.lat = ko.observable(lat);
  this.lon = ko.observable(lon);
};

// ViewModel - photo
var photoVM = {
  // Array of instagram data
  photos: ko.observableArray([]),

  fetchPhotos: function(latInsta, lngInsta) {
    instagramURL = 'https://api.instagram.com/v1/media/search?lat='+latInsta+'&lng='+lngInsta+'&access_token=322608956.c39a870.654d8fb14b8d48838cc430bebcb0dede';

    $.ajax({
      type: "GET",
      url: instagramURL,
      success: this.renderPhotos,
      dataType: "jsonp"
    });
  },
  renderPhotos: function(res) {
    photoVM.photos.removeAll();
    var newPhoto;
    var captionText;
    var photoId;
    for(var i = 0, len = res.data.length; i < len; i++){
      console.log(res.data[i]);
      // Set photoId
      photoId = 'photo-' + i;

      // Check if the photo has title
      captionText = photoVM.hasTitle(res.data[i]);

      // Add new photo to observable array
      newPhoto = new Photo(photoId, res.data[i].images.thumbnail.url, captionText, res.data[i].location.latitude, res.data[i].location.longitude);
      photoVM.photos.push(newPhoto);

      // Add marker
      marker = new google.maps.Marker({
        position: new google.maps.LatLng(res.data[i].location.latitude, res.data[i].location.longitude),
        map: map
      });

      // Add event lsitener to open info window on clicking marker
      google.maps.event.addListener(marker, 'click', (function(marker, i) {
        var infowindowContent = '<div class="infoWindow">' +
                              '<img src="'+res.data[i].images.thumbnail.url+'">' +
                              '<p>'+photoVM.hasTitle(res.data[i]) +'</p>' +
                              '<b>@'+res.data[i].user.username+'</p>'
                            '</div>';
        return function() {
          infowindow.setContent(infowindowContent);
          infowindow.open(map, marker);
        }
      })(marker, i));

      // Add event lsitener to open info window on clicking a photo from list
      document.getElementById(photoId).addEventListener('click', (function(marker) {
        return function(){
          google.maps.event.trigger(marker, 'click');
        }
      })(marker));
    }
  },

  hasTitle: function(data) {
    if((data.caption)&&(data.caption.text)){
      return data.caption.text;
    } else {
      return 'No Title';
    }
  }

};

var searchBox = new google.maps.places.SearchBox(document.getElementById('location-input'));

google.maps.event.addListener(searchBox, 'places_changed', function() {

  places = searchBox.getPlaces();
  latInsta = places[0].geometry.location.G;
  lngInsta = places[0].geometry.location.K;

  // Set marker of the city
  map = new google.maps.Map(mapCanvas, {
    zoom: 15,
    center: new google.maps.LatLng(latInsta, lngInsta),
    mapTypeId: google.maps.MapTypeId.ROADMAP
  });
  infowindow = new google.maps.InfoWindow();

  // Get and display data
  photoVM.fetchPhotos(latInsta, lngInsta);
  // fetchWeatherInfo(latInsta, lngInsta);
});



function initialSetUp() {
  // Default Location of "Montreal, Canada"
  myLatlng = new google.maps.LatLng(45.5015217,-73.5732091);

  mapOptions = {
    zoom: 11,
    center: myLatlng,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };

  map = new google.maps.Map(mapCanvas, mapOptions);

  marker = new google.maps.Marker({
    position: myLatlng,
    title: 'Montréal, QC',
    map: map
  });

  infowindow = new google.maps.InfoWindow({
    content: 'Montréal, QC'
  });

  google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker);
  });
}

function initialize() {
  // Call initial set up function above
  initialSetUp();
}

ko.applyBindings(photoVM);

google.maps.event.addDomListener(window, 'load', initialize);
