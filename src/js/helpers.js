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
