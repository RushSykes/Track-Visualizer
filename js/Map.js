/* 1st */

// Track.js modules
// These two lines only need to be written onece
// Beacuase map.js is at the very first position in index.html
let trackModules = require('./js/Track.js');
let trackManager = trackModules.manager;

// Global reference of the map and it's sub-gadgets
let map, mapContextMenu, markerContextMenu;

// Context processing marker reference
let rightClickedMarker, draggingMarker;

initMap();

//
// Initialize the map and it's sub-gadgets
//
function initMap() {
  /* Map itself */
  map = new AMap.Map('mapContainer',{
    resizeEnable: true,
    zoom: 10,
    center: [116.480983, 40.0958]
  });

  // Map Context menu
  mapContextMenu = new AMap.ContextMenu();
  // Add marker
  mapContextMenu.addItem("Add Marker", addMarker, 0);
  mapContextMenu.addItem("Delete all tracks", deleteAllTracks, 1);
  mapContextMenu.addItem("Reset color", resetColor, 2);

  // Bind map on-right-click event
  map.on('rightclick', function(e) {
    mapContextMenu.open(map, e.lnglat);
    contextMenuPositon = e.lnglat;
  });

  // Marker context menu
  markerContextMenu = new AMap.ContextMenu();
  // Delete marker
  markerContextMenu.addItem("Show info", showInfo, 0);
  markerContextMenu.addItem("Hide info", hideInfo, 1);
  markerContextMenu.addItem("Find similar...", findSimilarTracks, 2);
  markerContextMenu.addItem("Delete this marker", deleteMarker, 3);
  markerContextMenu.addItem("Delete this track", deleteOneTrack, 4);
}

//
// Functions on map
//
function addMarker(e) {
  let marker = new AMap.Marker({
    position: contextMenuPositon,
    draggable: true,
  });

  // Marker events
  marker.on('click', markerOnLeftClick);
  marker.on('rightclick', function(e){
    markerContextMenu.open(map, e.lnglat);
    rightClickedMarker = this;
    trackManager.setCurrentEditTrack(rightClickedMarker.getExtData().trackNo);
    trackManager.setCurrentEditNodeNo(rightClickedMarker.getExtData().nodeNo);
  });
  marker.on('dragstart', function(e){
    draggingMarker = this;
    const thisMarkerTrackNo = draggingMarker.getExtData().trackNo;
    const thisMarkerNodeNo = draggingMarker.getExtData().nodeNo;
    trackManager.setCurrentEditTrack(thisMarkerTrackNo);
    trackManager.setCurrentEditNodeNo(thisMarkerNodeNo);
    console.log("drag start");
    console.log("Current trackNo: " + thisMarkerTrackNo + "\nNode no: " + thisMarkerNodeNo);
  });
  marker.on('dragging', markerDragging);
  marker.on('dragend', markerDragend);
  // Add node to the track
  if(trackManager.addTrackNode(new Date().getTime(), marker.getPosition().lat,  marker.getPosition().lng, trackManager.getCurrentEditTrackNo())) {
    // Make this marker visible on this map
    marker.setMap(map);
    trackManager.abstractMarkModified();
    trackManager.timelineMarkModified();
    trackManager.updateMinTimeStamp();
    trackManager.updateMaxTimeStamp();
    // Set some ext data that would be useful to the track manager
    marker.setExtData({
      trackNo: trackManager.getCurrentEditTrackNo(),
      nodeNo: trackManager.getCurrentEditTrackLastNodeNo()
    });
    // If there are more than two nodes in the current path
    // Draw it out
    if(trackManager.getCurrentEditTrackSize() >= 2) {
      trackManager.drawTrack(trackManager.getCurrentEditTrackNo());
    }
  }
  else {
    console.log("addMarker error: addTrackNode returns false\n");
  }
}

function addMarkerAtPos(pos) {
  let marker = new AMap.Marker({
    position: pos,
    draggable: true,
  });

  // Marker events
  marker.on('click', markerOnLeftClick);
  marker.on('rightclick', function(e){
    markerContextMenu.open(map, e.lnglat);
    rightClickedMarker = this;
    trackManager.setCurrentEditTrack(rightClickedMarker.getExtData().trackNo);
    trackManager.setCurrentEditNodeNo(rightClickedMarker.getExtData().nodeNo);
  });
  marker.on('dragstart', function(e){
    draggingMarker = this;
    const thisMarkerTrackNo = draggingMarker.getExtData().trackNo;
    const thisMarkerNodeNo = draggingMarker.getExtData().nodeNo;
    trackManager.setCurrentEditTrack(thisMarkerTrackNo);
    trackManager.setCurrentEditNodeNo(thisMarkerNodeNo);
    console.log("drag start");
    console.log("Current trackNo: " + thisMarkerTrackNo + "\nNode no: " + thisMarkerNodeNo);
  });
  marker.on('dragging', markerDragging);
  marker.on('dragend', markerDragend);
  // Add node to the track
  if(trackManager.addTrackNode(new Date().getTime(), marker.getPosition().lat,  marker.getPosition().lng, trackManager.getCurrentEditTrackNo())) {
    // Make this marker visible on this map
    marker.setMap(map);
    trackManager.abstractMarkModified();
    trackManager.timelineMarkModified();
    trackManager.updateMinTimeStamp();
    trackManager.updateMaxTimeStamp();
    // Set some ext data that would be useful to the track manager
    marker.setExtData({
      trackNo: trackManager.getCurrentEditTrackNo(),
      nodeNo: trackManager.getCurrentEditTrackLastNodeNo()
    });
    // If there are more than two nodes in the current path
    // Draw it out
    if(trackManager.getCurrentEditTrackSize() >= 2) {
      trackManager.drawTrack(trackManager.getCurrentEditTrackNo());
    }
  }
  else {
    console.log("addMarkerAtPos error: addTrackNode returns false\n");
  }
}

function deleteAllTracks(e) {
  const allOverlays = map.getAllOverlays();
  const len = allOverlays.length;
  for(let i = 0; i < len; i++) {
    allOverlays[i].setMap(null);
    allOverlays[i] = null;
  }
  trackManager.deleteAllTracks();
  trackManager.hideInfo();
}

//
// Functions on markers
//
function deleteMarker(e) {
  // Remove the node behind scene
  const thisMarkerTrackNo = rightClickedMarker.getExtData().trackNo;
  const thisMarkerNodeNo = rightClickedMarker.getExtData().nodeNo;
  trackManager.setCurrentEditTrack(thisMarkerTrackNo);
  trackManager.setCurrentEditNodeNo(trackManager.getCurrentEditTrackFirstNodeNo());
  trackManager.deleteTrackNode(thisMarkerTrackNo, thisMarkerNodeNo);
  trackManager.abstractMarkModified();
  trackManager.timelineMarkModified();
  // Remove the marker on the map
  rightClickedMarker.setMap(null);
  // If there are more than two nodes in the current path
  // Draw it out
  if(trackManager.getCurrentEditTrackSize() >= 2) {
    trackManager.drawTrack(trackManager.getCurrentEditTrackNo());
  }
  trackManager.hideInfo();
  trackManager.updateMinTimeStamp();
  trackManager.updateMaxTimeStamp();
  console.log("Current trackNo: " + thisMarkerTrackNo + "\nNode no: " + thisMarkerNodeNo);
}

function deleteOneTrack(e) {
  // Get the track no of the clicked track
  const thisMarkerTrackNo = rightClickedMarker.getExtData().trackNo;
  const allMarkers = map.getAllOverlays('marker');
  console.log(allMarkers);

  // Clear markers on map
  const len = allMarkers.length;
  for(let i = 0; i < len; i++) {
    console.log(allMarkers[i]);
    if(allMarkers[i].getExtData().trackNo === thisMarkerTrackNo) {
      allMarkers[i].setMap(null);
    }
  }

  // Update
  trackManager.updateMinTimeStamp();
  trackManager.updateMaxTimeStamp();

  // Clear markers behind
  trackManager.deleteTrack(thisMarkerTrackNo);
  trackManager.abstractMarkModified();
  trackManager.timelineMarkModified();
  trackManager.hideInfo();
}

function markerOnLeftClick(e) {
  const marker = e.target;
  const thisMarkerTrackNo = marker.getExtData().trackNo;
  const thisMarkerNodeNo = marker.getExtData().nodeNo;
  trackManager.setCurrentEditTrack(thisMarkerTrackNo);
  trackManager.setCurrentEditNodeNo(thisMarkerNodeNo);
  toolbarInfoHelper();
  toolbarTimetagHelper()
  console.log("Current trackNo: " + thisMarkerTrackNo + "\nNode no: " + thisMarkerNodeNo);
}

function markerDragging(e) {
  trackManager.updateTrackNode(draggingMarker.getExtData().trackNo, draggingMarker.getExtData().nodeNo, e.target.getPosition().getLat(), e.target.getPosition().getLng());
  if(trackManager.getCurrentEditTrackSize() >= 2) {
    trackManager.drawTrack(trackManager.getCurrentEditTrackNo());
  }
}

function markerDragend(e) {
  const thisMarkerTrackNo = trackManager.getCurrentEditTrackNo();
  const position = e.lnglat;
  //trackManager.showInfo(thisMarkerTrackNo, position);
  trackManager.abstractMarkModified();
  trackManager.timelineMarkModified();
  toolbarInfoHelper();
}

function showInfo(e) {
  const thisMarkerTrackNo = rightClickedMarker.getExtData().trackNo;
  const position = rightClickedMarker.getPosition();
  trackManager.showInfo(thisMarkerTrackNo, position);
  toolbarInfoHelper();
  toolbarTimetagHelper()
}

function hideInfo(e) {
  const thisMarkerTrackNo = rightClickedMarker.getExtData().trackNo;
  trackManager.hideInfo();
}

function updateInfo(e) {
  if(trackManager.getCurrentEditTrackHead() !== null) {
    const thisMarkerTrackNo = trackManager.getCurrentEditTrackNo();
    const thisMarkerNodeNo = trackManager.getCurrentEditNodeNo();
    const position = trackManager.getCurrentEditTrackFirstPos();
    const infoMain = document.getElementById('infoMain').value;
    const infoDetails = document.getElementById('infoDetails').value;
    trackManager.updateInfo(thisMarkerTrackNo, infoMain, infoDetails, position);

    const newTime = document.getElementById("nodeDate").value + " " + document.getElementById("nodeTime").value;
    if(trackManager.updateNodeTime(thisMarkerTrackNo, thisMarkerNodeNo, newTime)) {
      trackManager.abstractMarkModified();
      trackManager.timelineMarkModified();
    }
  }
  else {
    console.log("updateInfo error: No current edit track\n");
  }
}

function toolbarInfoHelper() {
  const infoMain = document.getElementById('infoMain');
  const infoDetails = document.getElementById('infoDetails');
  infoMain.value = trackManager.getCurrentEditTrackMainInfo();
  infoDetails.value = trackManager.getCurrentEditTrackDetails();
}

function toolbarTimetagHelper() {
  const nodeDate = document.getElementById("nodeDate");
  const nodeTime = document.getElementById("nodeTime");
  const dateAndTime = trackManager.getCurrentDateAndTime();
  let dateValue = dateAndTime.date;
  let timeValue = dateAndTime.time;
  console.log(dateValue + "\n");
  console.log(timeValue + "\n");
  nodeDate.value = dateValue;
  nodeTime.value = timeValue;
}

function findSimilarTracks(e) {
  const thisTrackNo = trackManager.getCurrentEditTrackNo();
  const similarOnes = trackManager.findSimilarTracks(thisTrackNo);

  const len = similarOnes.length;
  if(len > 0) {
    for(let i = 0 ; i < len; i++) {
      trackManager.highlightDtwOn(similarOnes[i]);
    }
  }
}

function resetColor(e) {
  const allLines = map.getAllOverlays('polyline');
  const len = allLines.length;
  
  for(let i = 0 ; i< len; i++) {
    allLines[i].setOptions({
      strokeColor: "#0080FF"
    });
  }
}