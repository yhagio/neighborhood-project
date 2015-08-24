# Hoodgram

Insagarm photo finder with Google Map. User can simply type city or location name and to search most 20 recent photos around the locations. Also, current weather information will be presented. Default city is Montreal, Canada.

## [DEMO](http://yhagio.github.io/neighborhood-project/dist)

### How to run locally
- Clone this repo `git clone git@github.com:yhagio/neighborhood-project.git`
- `npm install -g http-server`
- `cd dist && http-server`

### Features
- User can see latest 20 Instagram photos of chosen city
- Weather information of the location user enters
- Location markers on Google Map that contain more details of the photo
- For wide screen (Larger than 540px), user can see the list of the photos on the right side of the screen

### Todo
- Fix binding eventHandler to each photo after filtered
- Filter markers as well as photo list

#### Build tool
- [Gulp](https://github.com/gulpjs/gulp/blob/master/docs/README.md)
- [Browserify]()

Simply compress CSS, JS, and HTML files.
```
npm install --save-dev gulp gulp-minify-css gulp-uglify gulp-minify-html
```

To run browserify (i.e. for development) after globally install it
```
npm install -g browserify
browserify src/js/main.js -o src/js/bundle.js
```

#### Javascript Libraries
- [Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript/)
- [Knockout.js](http://knockoutjs.com/)
- [jQuery](http://api.jquery.com/)

#### 3rd Party APIs
- [Instagarm](https://instagram.com/developer/?hl=en)
- [Open Weather Map](http://openweathermap.org/api)
- [Open Weather Map - API/Weather Condition Codes](http://openweathermap.org/wiki/API/Weather_Condition_Codes)

#### Resources
- [Icon - Ionicons](http://ionicons.com/)
Need to handle error manually since the dataType is jsonp, jquery won't fire the error function automatically
- [jQuery ajax request using jsonp error](http://stackoverflow.com/questions/5247295/jquery-ajax-request-using-jsonp-error)
- [Custom Binding (for google map marker)](http://knockoutjs.com/documentation/custom-bindings.html)
- [Knockout + Googel Map Binding](https://hoonzis.github.io/knockoutjs-and-google-maps-binding/)
- [Remove marker from map](http://stackoverflow.com/questions/29557938/removing-map-pin-with-search)
- [Creating custom bindings that control descendant bindings](http://knockoutjs.com/documentation/custom-bindings-controlling-descendant-bindings.html)

### Issues
- [https://gist.github.com/yhagio/715ad687ee2518641eba](https://gist.github.com/yhagio/715ad687ee2518641eba)
