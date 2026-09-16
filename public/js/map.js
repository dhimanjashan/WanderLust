maptilersdk.config.apiKey = mapToken;
const listing = JSON.parse(listingString);
const map = new maptilersdk.Map({
  container: "map", // container's id or the HTML element in which the SDK will render the map
  style: maptilersdk.MapStyle.STREETS,
  center: listing.geometry.coordinates, // starting position [lng, lat]
  zoom: 14, // starting zoom
});

const markerHeight = 50;
const markerRadius = 10;
const linearOffset = 25;

const popupOffsets = {
  top: [0, 0],
  "top-left": [0, 0],
  "top-right": [0, 0],
  bottom: [0, -markerHeight],
  "bottom-left": [
    linearOffset,
    (markerHeight - markerRadius + linearOffset) * -1,
  ],
  "bottom-right": [
    -linearOffset,
    (markerHeight - markerRadius + linearOffset) * -1,
  ],
  left: [markerRadius, (markerHeight - markerRadius) * -1],
  right: [-markerRadius, (markerHeight - markerRadius) * -1],
};

// add marker to map
new maptilersdk.Marker({ color: "#FF385C" })
  .setLngLat(listing.geometry.coordinates)
  .setPopup(
    new maptilersdk.Popup({ offset: popupOffsets, className: "my-class" })
      .setHTML(
        `<h4>${listing.location}</h4><p>Exact location will be provided after booking</p>`,
      )
      .setMaxWidth("300px"),
  )
  .addTo(map);
