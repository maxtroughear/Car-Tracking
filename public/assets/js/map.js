var layer = new L.StamenTileLayer("toner");
var map = new L.Map("map", {
    center: new L.LatLng(-40.9006, 174.8860),
    zoom: 5
});
map.addLayer(layer);