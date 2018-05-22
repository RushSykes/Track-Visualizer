// Global reference of the toolbar container
let timelineToolContainer;

initTimelineToolbar();

//
// Initialize the timeline system toolbar
//
function initTimelineToolbar() {
	// Toolbar
	timelineToolContainer = document.getElementById('timelineToolbarContainer');

	// Wrapper for layout
	let minWrapper = document.createElement('div'); 
	minWrapper.setAttribute('class', "minSlider");
	minWrapper.setAttribute('id', "minWrapper");

	let maxWrapper = document.createElement('div'); 
	maxWrapper.setAttribute('class', "maxSlider");
	maxWrapper.setAttribute('id', "maxWrapper");

	// Range slider for time-filtering, lower bound
	let rangeSliderMin = document.createElement('input');
	rangeSliderMin.setAttribute('type', "range");
	rangeSliderMin.setAttribute('class', "slider");
	rangeSliderMin.setAttribute('id', "minRange");
	rangeSliderMin.setAttribute('min', "1");
	rangeSliderMin.setAttribute('max', "10");
	rangeSliderMin.setAttribute('step', "1");
	rangeSliderMin.setAttribute('value', 4);
	rangeSliderMin.addEventListener('change', onchangeMin);
	rangeSliderMin.addEventListener('input', updateFilterPositionMin);

	// Range slider for time-filtering, upper bound
	let rangeSliderMax = document.createElement('input');
	rangeSliderMax.setAttribute('type', "range");
	rangeSliderMax.setAttribute('class', "slider");
	rangeSliderMax.setAttribute('id', "maxRange");
	rangeSliderMax.setAttribute('min', "1");
	rangeSliderMax.setAttribute('max', "10");
	rangeSliderMax.setAttribute('step', "1");
	rangeSliderMax.setAttribute('value', 6);
	rangeSliderMax.addEventListener('change', onchangeMax);
	rangeSliderMax.addEventListener('input', updateFilterPositionMax);

	// Time related text field
	let minDate, minTime, maxDate, maxTime;
	minDate = document.createElement('input'); minDate.setAttribute('id', "minDate"); minDate.setAttribute('type', "date");
	minTime = document.createElement('input'); minTime.setAttribute('id', "minTime"); minTime.setAttribute('type', "time");
	maxDate = document.createElement('input'); maxDate.setAttribute('id', "maxDate"); maxDate.setAttribute('type', "date");
	maxTime = document.createElement('input'); maxTime.setAttribute('id', "maxTime"); maxTime.setAttribute('type', "time");

	// Update if needed (for example the user might input a time using date and time but not the range)
	let btnDrawAll = document.createElement('button');
	btnDrawAll.innerText = "Draw\nAll";
	btnDrawAll.setAttribute("style", "position:absolute; height:36px; width:80px; left:80%");
	btnDrawAll.addEventListener('click', timelineDrawAll);

	let btnUpdateAll = document.createElement('button');
	btnUpdateAll.innerText = "Update\nAll";
	btnUpdateAll.setAttribute("style", "position:absolute; height:36px; width:80px; left:80%; top:36px");
	btnUpdateAll.addEventListener('click', timelineUpdateAll);

	// Append to wrappers
	minWrapper.appendChild(minDate);
	minWrapper.appendChild(minTime);
	minWrapper.appendChild(rangeSliderMin);
	
	maxWrapper.appendChild(maxDate);
	maxWrapper.appendChild(maxTime);
	maxWrapper.appendChild(rangeSliderMax);

	// Append to containers
	timelineToolContainer.appendChild(minWrapper);
	timelineToolContainer.appendChild(maxWrapper);
	timelineToolContainer.appendChild(btnDrawAll);
	timelineToolContainer.appendChild(btnUpdateAll);

	// Vertical line as filter
	let minLine = buildAxisTimeline(new THREE.Vector3(timelineWidth / 3, 0, 0), new THREE.Vector3(timelineWidth / 3, 10000, 0), 0x000000, false); minLine.name = "minLine";
	let maxLine = buildAxisTimeline(new THREE.Vector3(timelineWidth / 3 * 2, 0, 0), new THREE.Vector3(timelineWidth / 3 * 2, 10000, 0), 0x000000, false); maxLine.name = "maxLine";
	timelineScene.add(minLine);
	timelineScene.add(maxLine);
}

function onchangeMin() {
	const rangeSliderMin = document.getElementById("minRange");
	const rangeSliderMax = document.getElementById("maxRange");
	if(rangeSliderMin.valueAsNumber >= rangeSliderMax.valueAsNumber) {
		rangeSliderMin.value = rangeSliderMax.valueAsNumber;
	}
	updateFilterPositionMin();
	updateFilterTimeMin();
}

function onchangeMax() {
	const rangeSliderMin = document.getElementById("minRange");
	const rangeSliderMax = document.getElementById("maxRange");
	if(rangeSliderMax.valueAsNumber <= rangeSliderMin.valueAsNumber) {
		rangeSliderMax.value = rangeSliderMin.valueAsNumber;
	}
	updateFilterPositionMax();
	updateFilterTimeMax();
}

function timelineDrawAll() {
	const allLines = trackManager.timelineDrawAll(secHeight, timelineWidth);
	const len = allLines.length;
	if(allLines.length > 0) {
	  for(let i = 0 ;i < len; i++) {
		lineParent.add(allLines[i]);
	  }
	}
	updateRangers();
	updateFilters();
	updateFilterPositionMin();
	updateFilterTimeMin();
	updateFilterPositionMax();
	updateFilterTimeMax();
}

function timelineUpdateAll() {
  const modifiedLines = trackManager.timelineUpdateModified(secHeight, timelineWidth);
  const modifiedNum = modifiedLines.length;
  if(modifiedNum > 0)
  {
    for(let i = 0; i < modifiedNum; i++) {
      let oldTrack = timelineScene.getObjectByName(modifiedLines[i].name);
      lineParent.remove(oldTrack);
      lineParent.add(modifiedLines[i]);
    }
	}
	
	updateRangers();
	updateFilters();
	updateFilterPositionMin();
	updateFilterTimeMin();
	updateFilterPositionMax();
	updateFilterTimeMax();
}

function updateRangers() {
	const newMinValue = trackManager.getMinTimeStamp();
	const newMaxValue = trackManager.getMaxTimeStamp();

  // Update ranger
  const rangeSliderMin = document.getElementById("minRange");
  rangeSliderMin.setAttribute('min', newMinValue);
	rangeSliderMin.setAttribute('max', newMaxValue);
	rangeSliderMin.value = newMinValue;
	const rangeSliderMax = document.getElementById("maxRange");
	rangeSliderMax.setAttribute('min', newMinValue);
	rangeSliderMax.setAttribute('max', newMaxValue);
	rangeSliderMax.value = newMinValue + 1;
}

function updateFilters() {
  // Update filter lines
  let oldMinLine = timelineScene.getObjectByName("minLine");
  let oldMaxLine = timelineScene.getObjectByName("maxLine");
  timelineScene.remove(oldMinLine); timelineScene.remove(oldMaxLine);

	// Reset line positions
	let minLine = buildAxisTimeline(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10000, 0), 0x000000, false); minLine.name = "minLine";
	let maxLine = buildAxisTimeline(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 10000, 0), 0x000000, false); maxLine.name = "maxLine";

	timelineScene.add(minLine);
	timelineScene.add(maxLine);
}

function updateFilterPositionMin() {
	// Update ranger
	let minLine = timelineScene.getObjectByName("minLine");
	const minValue = trackManager.getMinTimeStamp();
	const maxValue = trackManager.getMaxTimeStamp();
	const rangeSliderMin = document.getElementById("minRange");
	const rangeNewPos = rangeSliderMin.valueAsNumber;
	let x = (timelineWidth*(rangeNewPos-minValue))/(maxValue-minValue);
	minLine.position.set(x, minLine.position.y, minLine.position.z);
}

function updateFilterPositionMax() {
	// Update ranger
	let maxLine = timelineScene.getObjectByName("maxLine");
	const minValue = trackManager.getMinTimeStamp();
	const maxValue = trackManager.getMaxTimeStamp();
	const rangeSliderMax = document.getElementById("maxRange");
	const rangeNewPos = rangeSliderMax.valueAsNumber;
	let x = (timelineWidth*(rangeNewPos-minValue))/(maxValue-minValue);
	maxLine.position.set(x, maxLine.position.y, maxLine.position.z);
}

function updateFilterTimeMin() {
	const minStamp = document.getElementById("minRange").valueAsNumber;
	let tempDate = new Date(minStamp);
	let tempMonth = tempDate.getMonth() + 1; if(tempMonth < 10) tempMonth = "0" + tempMonth;
	let tempDay = tempDate.getDate(); if(tempDay < 10) tempDay = "0" + tempDay;
	let tempHour = tempDate.getHours(); if(tempHour < 10) tempHour = "0" + tempHour;
	let tempMin = tempDate.getMinutes(); if(tempMin < 10) tempMin = "0" + tempMin;
	let tempSec = tempDate.getSeconds(); if(tempSec < 10) tempSec = "0" + tempSec;

	let dateValue = tempDate.getFullYear() + "-" + tempMonth + "-" + tempDay;
	let timeValue = tempHour + ":" + tempMin + ":" + tempSec;

	document.getElementById("minDate").value = dateValue;
	document.getElementById("minTime").value = timeValue;
}

function updateFilterTimeMax() {
	const maxStamp = document.getElementById("maxRange").valueAsNumber;
	let tempDate = new Date(maxStamp);
	let tempMonth = tempDate.getMonth() + 1; if(tempMonth < 10) tempMonth = "0" + tempMonth;
	let tempDay = tempDate.getDate(); if(tempDay < 10) tempDay = "0" + tempDay;
	let tempHour = tempDate.getHours(); if(tempHour < 10) tempHour = "0" + tempHour;
	let tempMin = tempDate.getMinutes(); if(tempMin < 10) tempMin = "0" + tempMin;
	let tempSec = tempDate.getSeconds(); if(tempSec < 10) tempSec = "0" + tempSec;

	let dateValue = tempDate.getFullYear() + "-" + tempMonth + "-" + tempDay;
	let timeValue = tempHour + ":" + tempMin + ":" + tempSec;

	document.getElementById("maxDate").value = dateValue;
	document.getElementById("maxTime").value = timeValue;
}