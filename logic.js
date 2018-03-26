// Store our API endpoint inside queryUrl
var queryUrl_earthquakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson" 
console.log("query to get earthquake data" , queryUrl_earthquakes)

var queryUrl_faultline ="https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"
console.log(queryUrl_faultline)

// define a function to scale the magnitdue
function markerSize(magnitude) {
    return magnitude * 2;
};

var earthquakes = new L.LayerGroup();


// Perform a GET request to the query URL fpor queryUrl_earthquakes
d3.json(queryUrl_earthquakes, function(geoJson) {
  // Once we get a response, send the data.features object to the createFeatures function
  L.geoJson(geoJson.features,{
    pointToLayer: function(geoJsonPoint ,latlng) {
      return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag)
      });
},


style: function(geoJsonFeature) {
    return {
        fillColor: setColor(geoJsonFeature.properties.mag),
        fillOpacity: 0.7,
        weight: 0.1,
        color: 'black'

    }
},

onEachFeature: function (feature, layer) {
            // Giving each feature a pop-up with information pertinent to it
            layer.bindPopup(
                "<h5 style='text-align:center;'>" + new Date(feature.properties.time) +
                "</h5> <hr> <h5 style='text-align:center;'>" + feature.properties.title + "</h5>");
        }

    }).addTo(earthquakes);

});

//Now lets create a loayer for the faultlines
var plateBoundary = new L.LayerGroup();

// Perform a GET request to the query URL fpor queryUrl_earthquakes
d3.json(queryUrl_faultline, function( geoJson) {
  // Once we get a response, send the data.features object to the createFeatures function
  L.geoJson(geoJson.features,{
    style: function(geoJsonFeature) { 
        return {
                 weight:1 , 
                color :'blue'
               } 
            },
}).addTo(plateBoundary);
})

//lets define a function to assign a color based on the magnitude
function setColor(magnitude){
  if (magnitude > 5) {
    //returning red
    return('#f43510')
  } else if (magnitude > 4) {
    //returning orange
    return('#f47310')
  } else if (magnitude > 3) {
    //returning green
    return('#446f05')
  } else if (magnitude > 2){
    //lets return yellow
    return('#446f05')
  } else if (magnitude > 1) {
    //returning blue
    return('#446f05')
  } else {
        return '#58C9CB'
  }  
};

//lets now define a function to create the map

function createMap() {

  // Define streetmap and darkmap layers
  var streetmap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYXNlbGExOTgyIiwiYSI6ImNqZDNocXRlNTBoMWEyeXFmdWY1NnB2MmIifQ.ziEOjgHun64EAp4W3LlsQg'
    });

  var highContrastMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.high-contrast',
        accessToken: 'pk.eyJ1IjoiYXNlbGExOTgyIiwiYSI6ImNqZDNocXRlNTBoMWEyeXFmdWY1NnB2MmIifQ.ziEOjgHun64EAp4W3LlsQg'
    });

  var darkmap =  L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.dark',
        accessToken: 'pk.eyJ1IjoiYXNlbGExOTgyIiwiYSI6ImNqZDNocXRlNTBoMWEyeXFmdWY1NnB2MmIifQ.ziEOjgHun64EAp4W3LlsQg'
    });

    var satelite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id:'mapbox.satellite',
        accessToken: 'pk.eyJ1IjoiYXNlbGExOTgyIiwiYSI6ImNqZDNocXRlNTBoMWEyeXFmdWY1NnB2MmIifQ.ziEOjgHun64EAp4W3LlsQg'
    });

  // Define a baseMaps object to hold our base layers
  var baseMaps = {
    "High Contrast": highContrastMap,
    "Street": streetmap,
    "Dark" : darkmap,
    "Satelite" :satelite
  };


  // Create overlay object to hold our overlay layer
  var overlayMaps = {
    "Earthquakes" : earthquakes,
    "Plate Boundaries":plateBoundary
  };

  // Create our map, giving it the streetmap and earthquakes layers to define splay on load
  var mymap = L.map("mymap", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control
  // Pass in our baseMaps and overlayMaps
  // Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps).addTo(mymap);

  //lets create legens for our maps
  var legend = L.control({ position: 'bottomright' });


    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

        div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + setColor(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
        }

        return div;
    };
    legend.addTo(mymap);
}
// lets create a function to create the heat map
function createHeatMap() {

 // initialize the map on the id="mymapHeat" div with a given center and zoom
    var mapHeat = L.map('mymapHeat', {
        center: [37.7749, -122.4194],
        zoom: 2
    });

    // add a tile layer to add to our map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
        id: 'mapbox.dark',
        maxZoom: 18,
        accessToken: 'pk.eyJ1IjoiYXNlbGExOTgyIiwiYSI6ImNqZDNocXRlNTBoMWEyeXFmdWY1NnB2MmIifQ.ziEOjgHun64EAp4W3LlsQg'
    }).addTo(mapHeat);

    // get data
    d3.json(queryUrl_earthquakes, function (geoJson) {

        // initialize an empty array to store the coordinates. This array will then then be passed to leaflet-heat.js
        var heatArray = []
        var features = geoJson.features;

        // loop through each feature
        for (var i = 0; i < features.length; i++) {
            var coords = features[i].geometry;

            // if coordinates are available to proceed
            if (coords) {
                heatArray.push([coords.coordinates[1], coords.coordinates[0]])
            }
        }
        var heat = L.heatLayer(heatArray, {
            radius: 10,
            minOpacity: 0.8
        }).addTo(mapHeat);   
    });
   
}



// define a function to create the heat map
function createHeatCluster() {

 // initialize the map on the id="mymapCluster" div with a given center and zoom
    var mapCluster = L.map('mymapCluster', {
         center: [37.09, -95.71],
        zoom: 2
    });

    // add a tile layer to add to our map
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}@2x.png?access_token={accessToken}', {
        id: 'mapbox.streets-basic',
        maxZoom: 18,
        accessToken: 'pk.eyJ1IjoiYXNlbGExOTgyIiwiYSI6ImNqZDNocXRlNTBoMWEyeXFmdWY1NnB2MmIifQ.ziEOjgHun64EAp4W3LlsQg'
    }).addTo(mapCluster);

    // get data
    d3.json(queryUrl_earthquakes, function (geoJson) {

        // initialize an empty array to store the coordinates. This array will then then be passed to leaflet-heat.js
        var markers = L.markerClusterGroup();
        var features = geoJson.features;

        // loop through each feature
        for (var i = 0; i < features.length; i++) {
            var coords = features[i].geometry;

            // if coordinates are available to proceed
            if (coords) {
                markers.addLayer(L.marker([coords.coordinates[1], coords.coordinates[0]]))
            }
        }

        mapCluster.addLayer(markers);  
    });
   
}

// call the create map function
createMap()
createHeatMap()
createHeatCluster()

