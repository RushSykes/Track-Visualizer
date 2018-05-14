/* 3rd */
const {dialog, BrowserWindow} = require('electron').remote;
const path = require('path');
const url = require('url');

// Global reference of the toolbar container
let toolContainer;

// Indicate whether the coord system is displayed or not, default false
let isCoordDisplayed = false;

// Timeline system window
let timelineWin = null;

initToolbar();

//
// Initialize the toolbar
//
function initToolbar() {
  // Toolbar
  toolContainer = document.getElementById('toolContainer');

  // Toggle coord Button
  let btnShowCoord = document.createElement('button');
  btnShowCoord.innerText = 'Toggle\ncoord';
  btnShowCoord.addEventListener('click', toggleCoord);
  
  // Add new track button
  let btnAddNewTrack = document.createElement('button');
  btnAddNewTrack.innerText = 'Add\nnewTrack';
  btnAddNewTrack.addEventListener('click', addNewTrack);

  // File-related button
  let btnLoad = document.createElement('button');
  let btnSave = document.createElement('button');
  btnLoad.innerText = 'Load';
  btnSave.innerText = 'Save';
  btnLoad.addEventListener('click', loadTracks);
  btnSave.addEventListener('click', saveTracks);

  // Info
  let inputMainInfo = document.createElement('input');
  let inputDetails = document.createElement('textarea');
  let btnUpdateInfo = document.createElement('button');
  btnUpdateInfo.innerText = "Apply\nInfoUpdate";
  btnUpdateInfo.addEventListener('click', updateInfo);

  // Timestamp and date of a node
  let inputNodeDate = document.createElement('input');
  let inputNodeTime = document.createElement('input');
  inputNodeDate.setAttribute('type', "date");
  inputNodeTime.setAttribute('type', "time");

  // Timeline window
  let btnTimeline = document.createElement('button');
  btnTimeline.innerText = 'Timeline';
  btnTimeline.addEventListener('click', openTimeline)

  toolContainer.appendChild(btnShowCoord);
  toolContainer.appendChild(btnAddNewTrack);
  toolContainer.appendChild(inputMainInfo); // Info
  toolContainer.appendChild(inputDetails); // Info
  toolContainer.appendChild(btnUpdateInfo);
  toolContainer.appendChild(btnLoad);
  toolContainer.appendChild(btnSave);
  toolContainer.appendChild(btnTimeline);
  toolContainer.appendChild(inputNodeDate);
  toolContainer.appendChild(inputNodeTime);

  btnShowCoord.setAttribute('style', "position:absolute; height:36px; width:80px");
  btnAddNewTrack.setAttribute('style', "position:absolute; height:36px; width:80px; left:80px");
  btnUpdateInfo.setAttribute('style', "position:absolute; top:0%; height:36px; width:80px; left:160px");
  btnLoad.setAttribute('style', "position:absolute; top:36px; height:36px; width:80px; left:0px");
  btnSave.setAttribute('style', "position:absolute; top:36px; height:36px; width:80px; left:80px");
  btnTimeline.setAttribute('style', "position:absolute; top:36px; height:36px; width:80px; left:160px");

  inputMainInfo.setAttribute('style', "position:absolute; top:0%; left:240px; width:200px");
  inputMainInfo.setAttribute('id', "infoMain");
  inputDetails.setAttribute('style', "position:absolute; top:0%; left:440px; height:100%; width:200px");
  inputDetails.setAttribute('id', "infoDetails");

  inputNodeDate.setAttribute('style', "position: absolute; top: 20px; left: 240px");
  inputNodeDate.setAttribute('id', "nodeDate");
  inputNodeTime.setAttribute('style', "position: absolute; top: 44px; left: 240px");
  inputNodeTime.setAttribute('id', "nodeTime");
}

//
// Functions of the toolbar
//
function toggleCoord() {
  // Default it's off, so open it up when clicked
  // Use css transition eventListener instead of replace .css files
  const mapContainer = document.getElementById("mapContainer");
  const coordContainer = document.getElementById("coordContainer");
  const coordToolContainer = document.getElementById("coordToolContainer");

  if(!isCoordDisplayed) {
    mapContainer.className = "mapContainer_2";
    toolContainer.className = "toolContainer_2";
    coordContainer.className = "coordContainer_2";
    coordToolContainer.className = "coordToolContainer_2";
    toolContainer.className

    isCoordDisplayed = true;
  }
  // The other way
  else {
    mapContainer.className = "mapContainer_1";
    toolContainer.className = "toolContainer_1";
    coordContainer.className = "coordContainer_0";
    coordToolContainer.className = "coordToolContainer_0";
    isCoordDisplayed = false;
  }
}

function addNewTrack() {
  trackManager.addNewTrack();
  // Add a first track node at center to remind the user
  let marker = new AMap.Marker({
    position: map.getCenter(),
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
  if(trackManager.addTrackNode(new Date().getTime(), marker.getPosition().lat,  marker.getPosition().lng, trackManager.getCurrentEditTrackNo())) {
    // Make this marker visible on this map
    marker.setMap(map);
    // Set some ext data that would be useful to the track manager
    marker.setExtData({
      trackNo: trackManager.getCurrentEditTrackNo(),
      nodeNo: trackManager.getCurrentEditTrackLastNodeNo()
    });
    trackManager.setCurrentEditTrack(marker.getExtData().trackNo);
  }
  else {
    console.log("addMarker error: addTrackNode returns false\n");
  }
}
// TODO: Saving and loading features
function loadTracks() {
  const inFile = dialog.showOpenDialog({
    title: 'Load',
    multiSelections: false,
    filters: [
      {name: 'Track visualizer files', extensions:['tvdat']}
    ]
  });
  if(inFile) {
    console.log(inFile);
    // inFile would be the path
    // NodeJS File API from now on

    //trackManager.loadTracks();
  }
}

function saveTracks() {
  const outFile = dialog.showSaveDialog({
    title: 'Save',
    multiSelections: false,
    filters: [
      {name: 'Track visualizer files', extensions:['tvdat']}
    ]
  });
  if(outFile) {
    console.log(outFile);
    // outFile would be the path
    // NodeJS File API from now on
    //trackManager.saveTracks();
  }
}

// Timeline System
function openTimeline() {
  if(timelineWin === null) {
    createTimelineWindow();
    timelineWin.show();
  }
}

function createTimelineWindow() {
  timelineWin = new BrowserWindow({
    width: 1440,
    height: 900,
    title: 'Timeline system'
  });

  // Get rid of the original menu
  timelineWin.setMenu(null);

  // and load the index.html of the app.
  timelineWin.loadURL(url.format({
    pathname: path.join(__dirname, 'timeline.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  timelineWin.webContents.openDevTools()

  // Emitted when the window is closed.
  timelineWin.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    timelineWin = null
  });

  // Can't resize the window for good reasons
  timelineWin.setResizable(false);
}