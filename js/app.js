"use strict";

const hideValue = '-300px';
const showValue = '0';

const LocationViewModel = function() {
  this.leftEdgeValue = ko.observable(showValue);
  this.locations = ko.observableArray([{
      name: '东部华侨城',
      visible: true,
  },
  {
      name: '世界之窗',
      visible: true,
  },
  {
      name: '福田中央商务区',
      visible: true,
  },
  {
      name: '深圳欢乐谷',
      visible: true,
  },
  {
      name: '莲花山公园',
      visible: true,
  },
  {
      name: '深圳湾公园',
      visible: true,
  },
  {
      name: '华侨城文化创意园',
      visible: true,
  },
  {
      name: '大梅沙海滨公园',
      visible: true,
  }
  ]);
};

//function filterLocations shows the match location which the user inputs
LocationViewModel.prototype.filterLocations = function(data, evt) {
  const locations = this.locations.removeAll();
  const self = this;
  locations.forEach(function(resort) {
    if (evt.target.value !== "") {
      resort.name.indexOf(evt.target.value) === -1 ? resort.visible = false : resort.visible = true;
  } else {
      resort.visible = true;
  }
  self.locations.push(resort);
});
  updateMarkers();
};

LocationViewModel.prototype.showLocationInfo = function(location) {
  markers.forEach(function(marker) {
    if (marker.title === location.name) {
      showInfoWindow(marker);
  }
});
};

//This function populates the infowindow when the list location is clicked.
LocationViewModel.prototype.startBounce = function(location, evt) {
  evt.target.classList.add('active');
  markers.forEach(function(marker) {
    if (marker.title === location.name) {
      marker.setAnimation(google.maps.Animation.BOUNCE);
  }
});
};

//This function stop bouncing the marker
LocationViewModel.prototype.stopBounce = function(location, evt) {
  evt.target.classList.remove('active');
  markers.forEach(function(marker) {
    if (marker.title === location.name) {
      marker.setAnimation(null);
  }
});
};

LocationViewModel.prototype.toggleLocationList = function() {
  console.log('toggle');
  const val = this.leftEdgeValue();
  val === hideValue ? this.leftEdgeValue(showValue) : this.leftEdgeValue(hideValue);
};

const startApply = new LocationViewModel();
ko.applyBindings(startApply);

let map;
let infoWindow;
const markers = [];

function initMap() {
    // Constructor creates a new map
    map = new google.maps.Map(document.getElementById('map'), {
        center: {
          lat: 22.53,
          lng: 114.05
      },
      zoom: 13
  });
    infoWindow = new google.maps.InfoWindow();
    displayMarkers();
}

//function mapLoadingError shows error when loading mistake happen
function mapLoadingError() {
  console.log('error happened');
  document.write(`<div class="alert alert-danger" role="alert">
      <h4 class="alert-heading">Map Loading Error</h4>
      <p>Error happened when loading Google map.</p>
      <hr>
      <p class="mb-0">Please check your network and refresh.</p>
      </div>`);
}

//function displayMarkers shows information of marker Arrays.
function displayMarkers() {
  const locations = startApply.locations();
  locations.forEach(function(resort) {
    if (resort.visible) {
      const geoCodeURL = 'https://maps.googleapis.com/maps/api/geocode/json?address=' + resort.name + ',+深圳&key=AIzaSyB-hhP916da7XUPFOQIWCIH38b8h03SMFU';
      fetch(geoCodeURL).then(function(response) {
        return response.json();
    }).then(function(data) {
        if (data.status === 'OK') {
          // Create a marker per location, and put into markers array.
          const marker = new google.maps.Marker({
            position: data.results[0].geometry.location,
            map: map,
            title: resort.name,
            animation: google.maps.Animation.DROP
        });
          // Push the marker to our array of markers.
          markers.push(marker);
          // Create an onclick event to open the infowindow at each marker.
          marker.addListener('click', function() {
            showInfoWindow(marker);
        });
      } else {
          alert(data.error_message);
      }
  }).catch(function(e) {
    alert(e);
});
}
});
}

//function updateMarkers sets information to marker arrays.
function updateMarkers() {
  const locations = startApply.locations();
  locations.forEach(function(location) {
    markers.forEach(function(marker) {
      if (location.name === marker.title) {
        location.visible ? marker.setMap(map) : marker.setMap(null);
    }
});
});
}

// showInfoWindow shows some information for the location using He Feng Weather API
function showInfoWindow(marker) {
  map.setCenter(marker.getPosition());
  const weatherAPI = 'https://free-api.heweather.com/s6/weather/now?location=shenzhen&key=491604eb519d4a39a6fc678246d49a7f';
  infoWindow.setContent(`<h5>正在获取数据...</h5>`);
  infoWindow.open(map, marker);
  fetch(weatherAPI).then(function(response) {
    return response.json();
}).then(function(weatherData) {
    console.log(weatherData);
    if (weatherData.HeWeather6[0].status === 'ok') {
      const province = weatherData.HeWeather6[0].basic.admin_area;
      const city = weatherData.HeWeather6[0].basic.location;
      const updateTime = weatherData.HeWeather6[0].update.loc;
      const feelTemperature = weatherData.HeWeather6[0].now.fl;
      const nowTemperature = weatherData.HeWeather6[0].now.tmp;
      const nowWeather = weatherData.HeWeather6[0].now.cond_txt;
      const windDirection = weatherData.HeWeather6[0].now.wind_dir;
      const windPower = weatherData.HeWeather6[0].now.wind_sc;
      const relativeHumidity = weatherData.HeWeather6[0].now.hum;
      const visit = weatherData.HeWeather6[0].now.vis;
      const contentString = `<div class="card" style="width: 20rem;">
      <div class="card-body">
      <h4 class="card-title">${province}${city} - ${marker.title}</h4>
      <p class="card-text">更新时间： ${updateTime}</p>
      <p class="card-text">体感温度：${feelTemperature}摄氏度</p>
      <p class="card-text">实时温度：${nowTemperature}摄氏度</p>
      <p class="card-text">天气：${nowWeather}</p>
      <p class="card-text">风向： ${windDirection}</p>
      <p class="card-text">风力：${windPower}</p>
      <p class="card-text">相对湿度：${relativeHumidity}</p>
      <p class="card-text">能见度：${visit}公里</p>
      </div>
      </div>`;
      infoWindow.setContent(contentString);
  } else {
      const invalid = `<p>Invalid status: ${weatherData.HeWeather6[0].status}</p>`;
      infoWindow.setContent(invalid);
  }
}).catch(function(e) {
    const err = `<p>Error: ${e}</p>`;
    infoWindow.setContent(err);
});
}
