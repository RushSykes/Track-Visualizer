/* 4th */

// Global reference of the toolbar container
let coordToolContainer;

// Indicate whether the map and grid is displayed or not, default true
let isMapDisplayed = true, isGridDisplayed = false;

initCoordToolbar();

//
// Initialize the coordinate toolbar
//
function initCoordToolbar() {
  // Coordinate toolbar
  coordToolContainer = document.getElementById('coordToolContainer');

  let btnShowMap = document.createElement('button');
  btnShowMap.innerText = 'Toggle\nmap';
  btnShowMap.addEventListener('click', toggleMap);

  let btnShowGrid = document.createElement('button');
  btnShowGrid.innerText = 'Toggle\nGrid';
  btnShowGrid.addEventListener('click', toggleGrid);

  let btnDrawSelected = document.createElement('button');
  btnDrawSelected.innerText = 'Draw\nSelected';
  btnDrawSelected.addEventListener('click', drawSelected);

  let btnDrawAll= document.createElement('button');
  btnDrawAll.innerText = 'Draw\nAll';
  btnDrawAll.addEventListener('click', drawAll);

  let btnUpdate = document.createElement('button');
  btnUpdate.innerText = 'Update\nAll';
  btnUpdate.addEventListener('click', updateAll);


  coordToolContainer.appendChild(btnShowMap);
  coordToolContainer.appendChild(btnShowGrid);
  coordToolContainer.appendChild(btnDrawSelected);
  coordToolContainer.appendChild(btnDrawAll);
  coordToolContainer.appendChild(btnUpdate);
}

function toggleMap() {
  // Default it's on, so close it when clicked
  // Use css transition eventListener instead of replace .css files
  const mapContainer = document.getElementById("mapContainer");
  const toolContainer = document.getElementById("toolContainer");
  const coordContainer = document.getElementById("coordContainer");

  if(isMapDisplayed) {
    mapContainer.className = "mapContainer_0";
    toolContainer.className = "toolContainer_0";
    coordContainer.className = "coordContainer_1";
    coordToolContainer.className = "coordToolContainer_1";
    isMapDisplayed = false;
  }
  // The other way
  else {
    mapContainer.className = "mapContainer_2";
    toolContainer.className = "toolContainer_2";
    coordContainer.className = "coordContainer_2";
    coordToolContainer.className = "coordToolContainer_2";
    isMapDisplayed = true;
  }
}

function toggleGrid() {
  if(isGridDisplayed) {
    let grid = scene.getObjectByName("grid");
    scene.remove(grid);
    isGridDisplayed = false;
  }
  else {
    scene.add(gridHelper);
    isGridDisplayed = true;
  }
  //render();
}

function drawSelected() {
  const selectedTrack = trackManager.abstractDrawSelected();
  if(selectedTrack) {
    //scene.add(selectedTrack);
    trackParent.add(selectedTrack);
    //render();
  }
}

function drawAll() {
  const allTrack = trackManager.abstractDrawAll();
  const len = allTrack.length;
  if(allTrack.length > 0) {
    for(let i = 0 ;i < len; i++) {
      if(allTrack[i].geometry.vertices.length > 1) {
        //scene.add(allTrack[i]);
        trackParent.add(allTrack[i]);
      }
    }
  }
  //render();
}

function updateAll() {
  const modifiedTracks = trackManager.abstractUpdateModified();
  const modifiedNum = modifiedTracks.length;
  console.log(modifiedNum);

  if(modifiedNum > 0)
  {
    for(let i = 0; i < modifiedNum; i++) {
      let oldTrack = scene.getObjectByName(modifiedTracks[i].name);
      //console.log(oldTrack);
      //scene.remove(oldTrack);
      trackParent.remove(oldTrack);
      if(modifiedTracks[i].geometry.vertices.length > 1) {
        //console.log(modifiedTracks[i]);
        //scene.add(modifiedTracks[i]);
        trackParent.add(modifiedTracks[i]);
      } 
    }
    //render();
  }
}

function hideExcept() {

}