//====================
// About Panel
//====================
var aboutPanel = ui.Panel({
  style: {
    width: '300px',
    padding: '10px',
    position: 'top-right',
    backgroundColor: 'white',
    border: '1px solid lightgray'
  }
});

// Title and close button row
var titleRow = ui.Panel({
  layout: ui.Panel.Layout.flow('horizontal'),
});

// Title Label
var titleLabel = ui.Label({
  value: 'ⓘ App Info',
  style: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#0B3D91',
    width: '200px',
    margin: '10px 5px 0 0'
  }
});

// Close Button
var closeButton = ui.Button({
  label: '❌',
  style: {
    fontSize: '10px',
    padding: '0',
    height: '30px',
    backgroundColor: '#f5f5f5'
  },
  onClick: function() {
    ui.root.remove(aboutPanel);
  }
});

titleRow.add(titleLabel);
titleRow.add(closeButton);
aboutPanel.add(titleRow);

// Introduction
aboutPanel.add(ui.Label({
  value: 'This app classifies flood risk across Pakistan’s districts.',
  style: {
    fontSize: '13px',
    margin: '0 0 5px 0'
  }
}));

aboutPanel.add(ui.Label({
  value: 'How it works:',
  style: {
    fontSize: '13px',
    fontWeight: 'bold',
    margin: '5px 0 5px 0'
  }
}));

aboutPanel.add(ui.Label({
  value: '• Combines GFD (flood history), CHIRPS (rainfall), GFS (forecast), and SRTM (elevation) data.',
  style: {
    fontSize: '13px',
    margin: '0 0 5px 10px'
  }
}));

aboutPanel.add(ui.Label({
  value: '• Displays risk as Low (Green), Moderate (Yellow), or High (Red).',
  style: {
    fontSize: '13px',
    margin: '0 0 5px 10px'
  }
}));

aboutPanel.add(ui.Label({
  value: 'How to use it:',
  style: {
    fontSize: '13px',
    fontWeight: 'bold',
    margin: '5px 0 5px 0'
  }
}));

aboutPanel.add(ui.Label({
  value: '• Search and select a district.',
  style: {
    fontSize: '13px',
    margin: '0 0 5px 10px'
  }
}));

aboutPanel.add(ui.Label({
  value: '• Adjust dataset weights with sliders.',
  style: {
    fontSize: '13px',
    margin: '0 0 5px 10px'
  }
}));

aboutPanel.add(ui.Label({
  value: '• View composite or individual layer risks.',
  style: {
    fontSize: '13px',
    margin: '0 0 5px 10px'
  }
}));

aboutPanel.add(ui.Label({
  value: 'This app is designed for public awareness and to support informed decision-making by individuals and communities.',
  style: {
    fontSize: '13px',
    margin: '5px 0 10px 0'
  }
}));

// Prompt for documentation
aboutPanel.add(ui.Label({
  value: 'For more details, view the full documentation:',
  style: {
    fontSize: '13px',
    margin: '5px 0 5px 0'
  }
}));

// Link to documentation
var docUrl = 'https://drive.google.com/file/d/12l5YvPreNiNLYHSyVbLuGF2sze42kWZP/view?usp=sharing';

var linkLabel = ui.Label({
  value: '📄 View Full Documentation',
  style: {
    fontSize: '13px',
    color: 'blue',
    textDecoration: 'underline'
  },
  targetUrl: docUrl
});

aboutPanel.add(linkLabel);

// Add panel to UI
ui.root.insert(0, aboutPanel);

// ===================
// GEE Flood Risk App for Pakistan (District-wise)
// ===================

var pakistan = ee.FeatureCollection('FAO/GAUL_SIMPLIFIED_500m/2015/level0')
  .filter(ee.Filter.eq('ADM0_NAME', 'Pakistan'))
  .geometry();

// 1. Load Admin Boundaries
var pakCoords = ee.Geometry.Point([69.3451, 30.3753]);
var dataset = ee.FeatureCollection('FAO/GAUL_SIMPLIFIED_500m/2015/level2')
  .filter(ee.Filter.eq('ADM0_NAME', 'Pakistan'));
Map.centerObject(pakCoords, 5.5);

Map.addLayer(dataset.style({fillColor: 'b5ffb488', width: 1.0}), {}, 'Districts');

// ===================
// Load Datasets
// ===================
var now = ee.Date(Date.now());
var oneMonthAgo = now.advance(-90, 'day');
var gfsBefore = now.advance(-24, 'hour');

// --- GFD
// var gfd = ee.ImageCollection('GLOBAL_FLOOD_DB/MODIS_EVENTS/V1')
//   .filterBounds(dataset)
//   .map(function(img) {
//     return img.select('flooded').toFloat().copyProperties(img, img.propertyNames());
  // });
var gfd = ee.ImageCollection('GLOBAL_FLOOD_DB/MODIS_EVENTS/V1')
  .filterBounds(dataset)
  .map(function(img) {
    return img.select('flooded')
              .toFloat()
              .clip(pakistan)
              .copyProperties(img, img.propertyNames());
  });


var startYear = 2000;
var endYear = 2018;
var weightedFloods = gfd.map(function(img) {
  var year = ee.Date(img.get('system:time_start')).get('year');
  var weight = ee.Number(1).add(ee.Number(year).subtract(startYear).divide(endYear - startYear));
  return img.multiply(weight);
});
var floodSum = weightedFloods.sum().rename('gfd_risk');

// --- Elevation
var elevation = ee.Image('USGS/SRTMGL1_003').clip(pakistan);
var elevRisk = ee.Image.constant(100).divide(elevation).rename('elev_risk');

// --- GFS Forecast
// var gfs = ee.ImageCollection('NOAA/GFS0P25')
//   .filterDate(gfsBefore, now)
//   .filter(ee.Filter.lte('forecast_hours', 120))
//   .select('precipitable_water_entire_atmosphere');
// var forecastRisk = gfs.mean().rename('forecast_risk');
var gfs = ee.ImageCollection('NOAA/GFS0P25')
  .filterDate(gfsBefore, now)
  .filter(ee.Filter.lte('forecast_hours', 120))
  .select('precipitable_water_entire_atmosphere')
  .map(function(img) {
    return img.clip(pakistan); 
  });
var forecastRisk = gfs.mean().rename('forecast_risk');

// --- CHIRPS
// var chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
//   .filterDate(oneMonthAgo, now)
//   .select('precipitation');
// var chirpsRain = chirps.mean().rename('chirps_risk');
var chirps = ee.ImageCollection("UCSB-CHG/CHIRPS/DAILY")
  .filterDate(oneMonthAgo, now)
  .select('precipitation')
  .map(function(img) {
    return img.clip(pakistan); 
  });
var chirpsRain = chirps.mean().rename('chirps_risk');

// ===================
// UI PANEL
// ===================
var panel = ui.Panel({layout: ui.Panel.Layout.flow('vertical'), style: {width: '320px'}});
ui.root.insert(0, panel);

panel.add(ui.Label({
  value: '🌊Flood Risk Classification System',
  style: {
    fontWeight: '600',
    fontSize: '18px',
    margin: '10px 0 15px 0',
    color: '#2c3e50'
  }
}));

// ------------------
// City Search UI
// ------------------
var cityData = {};
// var cityListPanel = ui.Panel({layout: ui.Panel.Layout.flow('vertical')});
var cityListPanel = ui.Panel({
  layout: ui.Panel.Layout.flow('vertical'),
  style: {
    maxHeight: '160px',
    width: '100%',
    border: '1px solid #ccc',
    padding: '5px'
  }
});

var infoPanel = ui.Panel({layout: ui.Panel.Layout.flow('vertical'), style: {padding: '8px'}});

var searchBox = ui.Textbox({
  placeholder: 'Search for a district...',
  onChange: function(text) { updateCityList(text); },
  style: {margin: '0 0 20px 0',stretch: 'horizontal'}
});
panel.add(searchBox);
panel.add(cityListPanel);

// City lookup
var cities = dataset.map(function(feature) {
  return ee.Feature(null, {
    name: feature.get('ADM2_NAME'),
    coordinates: feature.geometry().centroid().coordinates()
  });
});

var cityNames = [];

cities.aggregate_array('name').evaluate(function(names) {
  cities.aggregate_array('coordinates').evaluate(function(coords) {
    names.forEach(function(name, i) {
      if (typeof name === 'string') {
        cityData[name] = coords[i];
        cityNames.push(name); // Save plain strings
      }
    });
    updateCityList('');
  });
});

function updateCityList(searchText) {
  cityListPanel.clear();

  var cityNames = Object.keys(cityData); // ✅ Keep this local
  var filteredCities = cityNames.filter(function(cityName) {
    return cityName && cityName.toLowerCase().indexOf(searchText.toLowerCase()) !== -1;
  });

  if (filteredCities.length === 0) {
    cityListPanel.add(ui.Label("No cities found"));
    return;
  }

  filteredCities.forEach(function(cityName) {
    var cityButton = ui.Button({
      label: cityName,
      onClick: function() {
        zoomToCity(cityName);
        runFloodRisk(cityName);
      },
      style: {margin: '2px 0', width: '100%', textAlign: 'left'}
    });
    cityListPanel.add(cityButton);
  });
}




function zoomToCity(cityName) {
  var cityCoords = cityData[cityName];
  var cityPoint = ee.Geometry.Point(cityCoords);
  Map.centerObject(cityPoint, 8);
}

// ------------------
// Sliders for Weighting
// ------------------
panel.add(ui.Label({
  value: 'Adjust Dataset Weights:',
  style: {fontWeight: 'bold', margin: '15px 0 5px 0'}
}));

var sliders = {
  gfd: ui.Slider({min: 0, max: 100, value: 30, step: 5, style: {stretch: 'horizontal'}}),
  chirps: ui.Slider({min: 0, max: 100, value: 20, step: 5, style: {stretch: 'horizontal'}}),
  elev: ui.Slider({min: 0, max: 100, value: 25, step: 5, style: {stretch: 'horizontal'}}),
  forecast: ui.Slider({min: 0, max: 100, value: 25, step: 5, style: {stretch: 'horizontal'}})
};

panel.add(ui.Label('📘 Historical Flood Weightage:'));
panel.add(sliders.gfd);
panel.add(ui.Label('🌧️ Rainfall Weightage:'));
panel.add(sliders.chirps);
panel.add(ui.Label('⛰️ Elevation Weightage:'));
panel.add(sliders.elev);
panel.add(ui.Label('📡 Forecast Weightage:'));
panel.add(sliders.forecast);

// ------------------
// Dot Legend (3-color)
// ------------------
// Create a horizontal panel for the risk legend
var riskLegend = ui.Panel({
  layout: ui.Panel.Layout.flow('horizontal'),
  style: {
    margin: '10px 0 0 0',
    padding: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
    border: '1px solid #ddd',
    borderRadius: '8px'
  }
});

// Define risk categories with colors
var riskCategories = [
  {label: 'Low', color: '#1a9850'},
  {label: 'Moderate', color: '#fee08b'},
  {label: 'High', color: '#f46d43'}
];

// Add round color icons with labels
riskCategories.forEach(function(category) {
  var circle = ui.Label({
    style: {
      backgroundColor: category.color,
      padding: '5px',
      margin: '2px 4px ',
      borderRadius: '50%',
      width: '15px',
      height: '15px'
    }
  });

  var label = ui.Label({
    value: category.label,
    style: {
      margin: '2px 10px 0 0',
      fontSize: '12px',
      color: '#333'
    }
  });

  var item = ui.Panel({
    widgets: [circle, label],
    layout: ui.Panel.Layout.flow('horizontal'),
    style: {margin: '0 8px 0 0'}
  });

  riskLegend.add(item);
});

// Add the risk legend to your main panel
panel.add(riskLegend);

// Info display + Reset
panel.add(infoPanel);
panel.add(ui.Button({
  label: 'Reset View',
  onClick: function() {
    Map.centerObject(pakCoords, 5.5);
    searchBox.setValue('');
    infoPanel.clear();
  },
  style: {margin: '10px 0 0 0', stretch: 'horizontal'}
}));

 


// ===================
// 4. Risk Calculation
// ===================
function runFloodRisk(cityName) {
  infoPanel.clear();

  var cityPoint = ee.Geometry.Point(cityData[cityName]);
  var district = dataset.filterBounds(cityPoint).first();
  var geometry = district.geometry();

// ===================
// Showing individual layer
// ===================
// Clip each dataset to selected district geometry
var gfdClipped = floodSum.clip(geometry);
var chirpsClipped = chirpsRain.clip(geometry);
var elevClipped = elevRisk.clip(geometry);
var forecastClipped = forecastRisk.clip(geometry);

// Reset the map
Map.layers().reset();

// Add individual risk layers clipped to district
Map.addLayer(gfdClipped, {
  min: 0,
  max: 40,
  palette: ['green', 'yellow', 'red']
}, '🌊 GFD Flood Risk',false);

Map.addLayer(chirpsClipped, {
  min: 0.015,
  max: 7.75,
  palette: ['green', 'yellow', 'red']
}, '🌧️ CHIRPS Rainfall',false);

Map.addLayer(forecastClipped, {
  min: 2.76,
  max: 46.07,
  palette: ['green', 'yellow', 'red']
}, '📡 Forecast Risk',false);

Map.addLayer(elevClipped, {
  min: 0,
  max: 5,
  palette: ['green', 'yellow', 'red']
}, '⛰️ Elevation Risk',false);

  

  // Get the raw slider values and divide them by 100
  var wGFD = ee.Number(sliders.gfd.getValue()).divide(100);
  var wCHIRPS = ee.Number(sliders.chirps.getValue()).divide(100);
  var wElev = ee.Number(sliders.elev.getValue()).divide(100);
  var wForecast = ee.Number(sliders.forecast.getValue()).divide(100);
  // Compute the sum of all weights
  var totalWeight = wGFD.add(wCHIRPS).add(wElev).add(wForecast);
  
  // Normalize each weight by dividing by the total sum
  wGFD = wGFD.divide(totalWeight);
  wCHIRPS = wCHIRPS.divide(totalWeight);
  wElev = wElev.divide(totalWeight);
  wForecast = wForecast.divide(totalWeight);

  var combined = floodSum.multiply(wGFD)
    .add(elevRisk.multiply(wElev))
    .add(forecastRisk.multiply(wForecast))
    .add(chirpsRain.multiply(wCHIRPS))
    .rename('combined_risk')
    .clip(geometry);

  var classified = combined.expression(
    "(b(0) < 2) ? 1 : (b(0) < 6) ? 2 : 3"
  ).rename('risk_level');
  
  // Map.layers().reset();
  
  var classifiedMasked = classified.clip(geometry).updateMask(classified);
  Map.addLayer(classifiedMasked, {
  min: 1,
  max: 3,
  palette: ['green', 'yellow', 'red']
}, 'Flood Risk');

  Map.addLayer(dataset.style({fillColor: '00000000', color: 'black'}), {}, 'Districts');
  // Map.addLayer(classified, {min: 1, max: 3, palette: ['green', 'yellow', 'red']}, 'Flood Risk');
  // Map.addLayer(ee.Feature(district), {color: 'blue'}, 'Selected District');
  Map.addLayer(ee.Feature(district), {color: 'blue'}, 'Selected District', true, 0.2);


  combined.reduceRegion({
    reducer: ee.Reducer.mean(),
    geometry: geometry,
    scale: 1000,
    bestEffort: true
  }).get('combined_risk').evaluate(function(meanRisk) {
    var level = 'Unknown';
    var emoji = '❓';
    if (meanRisk < 2) { level = 'Low'; emoji = '🟢'; }
    else if (meanRisk < 6) { level = 'Moderate'; emoji = '🟡'; }
    else { level = 'High'; emoji = '🔴'; }

    infoPanel.add(ui.Label({value: '📍 District: ' + cityName, style: {fontWeight: 'bold'}}));
    infoPanel.add(ui.Label('Risk Level: ' + level + ' ' + emoji));
  });
}
