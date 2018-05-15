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

	// Time related text field
	let minDate, minTime, maxDate, maxTime;
	minDate = document.createElement('input'); minDate.setAttribute('id', "minDate"); minDate.setAttribute('type', "date");
	minTime = document.createElement('input'); minTime.setAttribute('id', "minTime"); minTime.setAttribute('type', "time");
	maxDate = document.createElement('input'); maxDate.setAttribute('id', "maxDate"); maxDate.setAttribute('type', "date");
	maxTime = document.createElement('input'); maxTime.setAttribute('id', "maxTime"); maxTime.setAttribute('type', "time");

	// Update if needed (for example the user might input a time using date and time but not the range)
	let btnDrawAll = document.createElement('button');
	btnDrawAll.innerText = "Draw\nAll";
	btnDrawAll.addEventListener('click', drawAll);

	let btnUpdateAll = document.createElement('button');
	btnUpdateAll.innerText = "Update\nAll";
	btnUpdateAll.addEventListener('click', updateAll);

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
	minLine = buildAxisTimeline(new THREE.Vector3(width / 3, 0, 0), new THREE.Vector3(width / 3, height, 0), 0xFFFFFF, false);
	maxLine = buildAxisTimeline(new THREE.Vector3(width / 3 * 2, 0, 0), new THREE.Vector3(width / 3 * 2, height, 0), 0xFFFFFF, false);
	scene.add(minLine);
	scene.add(maxLine);
}

function onchangeMin() {
	const rangeSliderMin = document.getElementById("minRange");
	const rangeSliderMax = document.getElementById("maxRange");
	if(rangeSliderMin.valueAsNumber >= rangeSliderMax.valueAsNumber) {
		rangeSliderMin.value = rangeSliderMax.valueAsNumber - 1;
	}
}

function onchangeMax() {
	const rangeSliderMin = document.getElementById("minRange");
	const rangeSliderMax = document.getElementById("maxRange");
	if(rangeSliderMax.valueAsNumber <= rangeSliderMin.valueAsNumber) {
		rangeSliderMax.value = rangeSliderMin.valueAsNumber + 1;
	}
}

function drawAll() {

}

function updateAll() {

}