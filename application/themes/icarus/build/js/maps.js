let map;
let kmlLayer;
let places;

const apiKey = "AIzaSyCVo19Er0GJ1Ib1R8MCFMmfb9LhZwZzSnU";

// Google Maps API 
(g=>{var v="weekly",h,a,k,p="The Google Maps JavaScript API",c="google",l="importLibrary",q="__ib__",m=document,b=window;
b=b[c]||(b[c]={});
var d=b.maps||(b.maps={}),r=new Set,e=new URLSearchParams,u=()=>h||(h=new Promise(async(f,n)=>{await (a=m.createElement("script"));
e.set("libraries",[...r]+"");
for(k in g)e.set(k.replace(/[A-Z]/g,t=>"_"+t[0].toLowerCase()),g[k]);
e.set("callback",c+".maps."+q);
a.src=`https://maps.${c}apis.com/maps/api/js?`+e;d[q]=f;
a.onerror=()=>h=n(Error(p+" could not load."));
a.nonce=m.querySelector("script[nonce]")?.nonce||"";m.head.append(a)}));
d[l]?console.warn(p+" only loads once. Ignoring:",g):d[l]=(f,...n)=>r.add(f)&&u().then(()=>d[l](f,...n))})({
  key: apiKey,
});


// build map with kml layer and multimedia
async function initFacilityMap() {
  const { Map } = await google.maps.importLibrary("maps");

  map = new Map(document.getElementById("historyMap"), {
    center: { lat: 40.91425, lng: -97.08891038081244 },
    zoom: 2,
    scrollwheel: false
  });

  google.maps.event.trigger(map, 'resize');
  map.setZoom( 18 );

  var src = 'https://prod.d2779871v0ytoy.amplifyapp.com/campus-draft.kml';
  kmlLayer = new google.maps.KmlLayer(src, {
    suppressInfoWindows: false,
    preserveViewport: false,
    map: map
  });

  kmlLayer.addListener('click', function(event) {
    event.featureData.infoWindowHtml;
  });
}

async function addInfoWindowMarker(map, site) {

  const { AdvancedMarkerElement, PinElement } = await google.maps.importLibrary("marker");
  var infoContent = "";
  site["Events"].forEach( event => {

    refreshEvent(event);

    if(event.dates.length > 0)

      // build the info window content here
     infoContent = infoContent +
    `<h3><a href=${event.ics} target='_blank'>${event.title}</a></h3>${event.location}<br>date(s) of event: ${event.dates}`;
  })

 infoContent = infoContent + "";

  var infoWindow = new google.maps.InfoWindow();
  var myLatLng = new google.maps.LatLng(site.Lat, site.Lng);
  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    address: site['location']
  });

  var marker = new google.maps.Marker({
    position: myLatLng,
    map: map,
    address: site['location']
  });

  google.maps.event.addListener(marker, 'click', function () {
    infoWindow.setContent(infoContent);
    infoWindow.open(map, this);
  });
}


// replace dates list with shortened list with no more than next 3 occurrences
function refreshEvent(event) {
  event["dates"] = filterDates(event.dates, 3);
}

// makes sure only dates for today and future dates are displayed. Reduce dates to specified limit count.
function filterDates(dates, limit) {
  var res = dates.filter(date => new Date(date) >= new Date()).map(date => new Date(date));

  return friendlyDates(res.slice(0,limit));
}

function friendlyDates(dates) {
  const weekdays = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  return dates.map(date => {
    const weekday = weekdays[date.getDay()];
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Add 1 because getMonth() is 0-indexed
    const day = date.getDate().toString().padStart(2, '0');

    return `${weekday} ${month}/${day}/${year} `;
  })
}


// build event map using json document for markers, and geo reverse api and local storage for addresses
async function initEventMap() {

  // load the event list from json
  const placesPromise = Promise.resolve($.getJSON('october.json'));

  placesPromise.then((value) => {
    places = value.locations;
  });
  
  const { Map } = await google.maps.importLibrary("maps");

  // set options for drawing map
  var mapOptions = {
    zoom: 18,
    center: new google.maps.LatLng(40.91425, -97.08891038081244),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    scrollwheel: false
  };

  map2 = new google.maps.Map(document.getElementById('eventMap'), mapOptions);

  // Get user selected filter from dropdown
  let filter = document.getElementById('showFilter').value;

  switch (filter) {

    // todo: dig for value in site event criteria, title, category, date, etc
    case 'option-x':
      places.forEach( (site) => {
        if(site.Country == 'United States')
            addInfoWindowMarker(map2, site);
      });

      //center the map on campus 40.914539496033356, -97.08891038081244
      map2.setCenter(  { lat: 40.914539496033356, lng: -97.08891038081244 });
      map2.setZoom(18);
      break;

    case 'option-y':
    places.forEach( (site) => {
        if(new Date(site['End Date']) > new Date())
        addInfoWindowMarker(map2, site);
      });
      break;

    default:
      places.forEach( (site) => {
        addInfoWindowMarker(map2, site);
      });
  }
}
