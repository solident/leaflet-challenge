// All earthquakes past 30 days
var url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a request on URL/
d3.json(url).then(function(data) {
  // send the data.features object to the create Features function.
  createFeatures(data.features);
});

// Function marker size 
function markerSize(magnitude) {
  return magnitude * 20000;
};

// Functipon marker color
function chooseColor(depth) {
  if (depth < 10) return "chartreuse";
  else if (depth < 30) return "greenyellow";
  else if (depth < 50) return "yellow";
  else if (depth < 70) return "orange";
  else if (depth < 90) return "orangered";
  else return "red";
};

function createFeatures(earthquakeData) {
  
  function onEachFeature (feature, layer) {
    layer.bindPopup(`<h1>${feature.properties.place}</h1> <hr> ` +
                    `<h3>Magnitude: ${feature.properties.mag} &emsp; Depth: ${feature.geometry.coordinates[2]}</h3>`)
  }

  // Create a GeoJSON layer that contains the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    onEachFeature: onEachFeature,

    // pointToLayer: used to alter markers
    pointToLayer: function(feature, coordinates) {
      // Determine markers size, color and opacity for each earthquake
      var markers = {
        radius: markerSize(feature.properties.mag),
        fillColor: chooseColor(feature.geometry.coordinates[2]),
        fillOpacity: 0.75,
        color: "black",
        weight: .5
      }
      return L.circle(coordinates, markers);
    }
  });

  createMaps(earthquakes);
};

function createMaps(earthquakes) {

  var satellite = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/satellite-v9',
    access_token: API_KEY
  });

  var grayscale = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/dark-v11',
    access_token: API_KEY
  });
  
  var outdoors = L.tileLayer('https://api.mapbox.com/styles/v1/{style}/tiles/{z}/{x}/{y}?access_token={access_token}', {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    style:    'mapbox/outdoors-v12',
    access_token: API_KEY
  });
  
  // ---------------- Add the tectonic plates info -------------------------------
  // Create layer group for tectonic plates
  tectonicPlates = new L.layerGroup();

    // Create Query for Plate Tectonic JSON data.
    var platesData = "data/PB2002_plates.json";

    // Connect plateQuery into d3.JSON.
    d3.json(platesData).then(function(plates) {
        // Create bindPopup for Plate Names 
        function onEachFeature(feature, layer) {
            layer.bindPopup("<h3> Tectonic Plate Name: " + feature.properties.PlateName + "</h3>")
        }

        // Style tectonic lines orange in color
        L.geoJSON(plates, {
            onEachFeature: onEachFeature,
            style: function() {
                return {
                    color: "orange",
                    fillOpacity: 0
                }
            }
        // Push to the tectonicPlates variable that was created above.
        }).addTo(tectonicPlates);
    });
// ---------------------------------------------------------------------------------

  // Initial map view: satellite with earthquakes
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [satellite, earthquakes]
  });

// ------- Legend specific ---------------------------------------------------------
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = function() {  
    var div = L.DomUtil.create("div", "legend");
    var depth= [-10, 10, 30, 50, 70, 90]
    
    // For loop to create HTML tags for legend
    // Conditional with HTML tag
    // () - starts the if statement and closes , ? - is the if condition is met || : - is the else
    for (i = 0; i < depth.length; i++) {
      div.innerHTML += '<i style="background:' + chooseColor(depth[i]) + '"></i>' + depth[i] + (depth[i+1] ? '&ndash;' + depth[i+1] : '+') + '<br>';
    }
    return div;
 };

  legend.addTo(myMap);  
// ---------------------------------------------------------------------------------

  // Only one base layer can be shown at a time.
  var baseMaps = {
    "Satellite": satellite,
    "Grayscale": grayscale,
    "Outdoors": outdoors
  };

  // Overlays that can be toggled on or off
  var overlayMaps = {
    "Earthquakes": earthquakes,
    "Tectonic Plates": tectonicPlates
  };

  // Pass our map layers into our layer control.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {collapsed:false}).addTo(myMap);
};
