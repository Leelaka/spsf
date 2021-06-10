let map;
let mapLong = 144.946457;
let mapLat = -37.840935;
let userLat = -37.840935;
let userLong = 144.946457;
let mapZoom=12;
let directionsDisplay;
let directionsService;
let isAvailable=false;
var getRoute; 

$(document).ready(function () {

  //geting user current location
  getUserCurrentLocation();

  //navigate_to_location(select_lat,select_lon);
  $('.bs-timepicker').timepicker();

    //handling recenter feature of the parking map page
    $( "#btn-viewme" ).click(function() {
       //geting user current location
      getUserCurrentLocation();
      map.zoom = 15;
      map.panTo({ lat: parseFloat(userLat), lng: parseFloat(userLong)}) 
  });

});
  
//seting up user current location on the map function
getUserCurrentLocation = function (){

  if (navigator.geolocation)
  {
    navigator.geolocation.getCurrentPosition(function (position) {
      userLat = position.coords.latitude;
      userLong = position.coords.longitude;
    });
    
  }else{
    alert('Geo location is not supported');
  }
}

function initMap() {
  const markerArray = [];
  // Instantiate a directions service.
  //const directionsService = new google.maps.DirectionsService();
  // Create a map and center it on Manhattan.

  if (navigator.geolocation)
  {
    navigator.geolocation.getCurrentPosition(function(position){
      userLat = position.coords.latitude;
      userLong = position.coords.longitude;
    });
    
  }else{
    alert('Geo location is not supported');
  }


  directionsService = new google.maps.DirectionsService();
  directionsDisplay=new google.maps.DirectionsRenderer();

  map = new google.maps.Map(document.getElementById("map"), {
    zoom: parseFloat(mapZoom),
    center: { lat: parseFloat(userLat), lng: parseFloat(userLong) },
    streetViewControl:false,
    mapTypeControl: false,
    styles:[
      {
        featureType: "poi.business",
        stylers: [{ visibility: "off" }],
      },
      {
        featureType: "transit",
        elementType: "labels.icon",
        stylers: [{ visibility: "off" }],
      },
    ],
  });

  


  var myLatLng = new google.maps.LatLng(parseFloat(userLat), parseFloat(userLong));
  new google.maps.Marker({
    position: myLatLng,
    icon:"/images/yous.png",
    map,
    title: '',            
  });

  
  getUpdatedAvailableParkingData = function(){
    // Fetching Parking data from the ajax server
    $.ajax({
      url: '/getAllAvailableParkingData',
      method: "GET",
      success: function(data) {
  
        let arrayNearestParking = [];
        jsonData = JSON.parse(data);
        var keys = Object.keys(jsonData);

        keys.forEach(function(key,index){
          //console.log(jsonData[key].lat);

          if( (jsonData[key].lat==select_lat) && (jsonData[key].lon==select_lon)){
            isAvailable=true
          }

        });
  
    
      }
    });
  }

}

$(window).on('load',function()
{
  navigate_to_location(select_lat,select_lon);
});
//navigation
function navigate_to_location(sel_lat,sel_long)
{
  var start=new google.maps.LatLng(parseFloat(userLat),parseFloat(userLong));

  var end = new google.maps.LatLng(parseFloat(sel_lat),parseFloat(sel_long));

  var bounds=new google.maps.LatLngBounds();
  bounds.extend(start);
  bounds.extend(end);
  map.fitBounds(bounds);

  var request={
    origin: start,
    destination: end,
    travelMode: google.maps.TravelMode.DRIVING
  }; 

  directionsService.route(request,function(response,status){
    if(status==google.maps.DirectionsStatus.OK)
    {
      directionsDisplay.setDirections(response);
      directionsDisplay.setMap(map);
      getRoute = response.routes[0].legs[0]; //get current route from response 
      //console.log(getRoutes);
      //console.log(routes.steps[i].instructions);
//display step by step directions to user inside the map 
    var navigateHTML="<table class='table table-striped'><tr><th>Your Steps</th></tr>";
      navigateHTML+="<tr>";
      navigateHTML+="<td>"+'Distance '+getRoute.distance.text+' '+'Duration '+getRoute.duration.text+' '; //add distance and duration 
      navigateHTML+="</td>";
      navigateHTML+="</tr>"; 

    for(var i=0; i < getRoute.steps.length; i++){
      console.log(getRoute.steps[i].instructions+ ' -> ' +getRoute.steps[i].distance.value);
      navigateHTML+="<tr>";
      navigateHTML+="<td>"+getRoute.steps[i].instructions+' -> '+"</td>";
      navigateHTML+="</tr>";
    }

    console.log(getRoute);

    getRoute.steps.instructions+="</table></div>"
    document.getElementById("navigate_data").innerHTML=navigateHTML;

    }
    else
    {
      console.log("Direction request failed:"+status);
    }

  });
}
