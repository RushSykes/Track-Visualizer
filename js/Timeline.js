// Global reference of html elements and attributes
let timelineContainer, timelineWidth, timelineHeight, secHeight;

// Global reference of three.js variables
let timelineRenderer, timelineScene, timelineCamera, timelineStats, timelineAxes, timelineControls;

// GLobal reference of timeline min and max slider line
let minLine, maxLine;

// Filtering & Raycasting
let timelineRayCaster, timelineMouse, timelineInter, pointInter, lineParent;

initTimeline();
animateTimeline();

//
// Executed on initialization
//
function initTimeline() {
  // timeline
  timelineContainer = document.getElementById('timelineContainer');
  timelineWidth = timelineContainer.clientWidth, timelineHeight = timelineContainer.clientHeight;

  // Set timelineRenderer
  timelineRenderer = new THREE.WebGLRenderer({antialias: true});
  timelineRenderer.setSize(timelineWidth, timelineHeight);
  timelineRenderer.setClearColor(0x3486AD, 1.0);
  timelineContainer.appendChild(timelineRenderer.domElement); // The timelineRenderer is a child of the timeline div part

  // Set up a new timelineScene
  timelineScene = new THREE.Scene();

  // Add axes
	timelineAxes = buildAxesTimeline(10000);
  timelineScene.add(timelineAxes);

  // Set timelineCamera
  timelineCamera = new THREE.OrthographicCamera(timelineWidth/-2, timelineWidth/2, timelineHeight/2, timelineHeight/-2, 1, 20000);
  timelineCamera.position.set(timelineWidth/2-2, timelineHeight/2-2, 500);
  timelineCamera.up.set(0, 1, 0);
  //timelineCamera.lookAt(new THREE.Vector3(timelineWidth/2-2, timelineHeight/2-2, 0));

  // Div container timelineStats
  timelineStats = new Stats();
  // Dev tool for performance(stats in the left-top corner)
  //container.appendChild(stats.dom);

  // Ortho Trackball timelineControls
  timelineControls = new THREE.OrthographicTrackballControls(timelineCamera, timelineRenderer.domElement);
  timelineControls.panSpeed = 0.8;
  timelineControls.zoomSpeed = 1.2;
  timelineControls.noPan = false;
  timelineControls.noZoom = false;
  timelineControls.noRotate = true;
  timelineControls.staticMoving = true;
  timelineControls.dynamicDampingFactor = 0;
  timelineControls.target = new THREE.Vector3(timelineWidth/2-2, timelineHeight/2-2, 0);

  // Raycaster
  timelineRayCaster = new THREE.Raycaster();
  timelineRayCaster.linePrecision = 3;
  timelineMouse = new THREE.Vector2();
  pointInter = new THREE.Mesh(new THREE.SphereBufferGeometry(5), new THREE.MeshBasicMaterial({color: 0xff0000}));
  pointInter.visible = false;
  timelineScene.add(pointInter);

  lineParent = new THREE.Object3D();
  timelineScene.add(lineParent);

  // Listeners
  window.addEventListener('resize', resizeTimeline, false);
  timelineControls.addEventListener('change', renderTimeline);
  timelineContainer.addEventListener('transitionend', resizeTimeline);
  timelineContainer.addEventListener('mousemove', timelineOnMouseMove);
  timelineContainer.addEventListener('click', timelineOnClick);
  // Start render
  renderTimeline();
}

//
// Wrapper function of building axes
//
function buildAxesTimeline(length) {
  let axes = new THREE.Object3D();

  // 6 direcitons
  axes.add(buildAxisTimeline(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X
  axes.add(buildAxisTimeline(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y

  secHeight = timelineHeight / 4;
  let tempY;
  // Split-line for each section
  for(let i = 1; i <= 4 ; i++) {
    tempY = secHeight*i;
    // Horizantal split-line
    axes.add(buildAxisTimeline(new THREE.Vector3(0, tempY, 0), new THREE.Vector3(length, tempY, 0), 0x000000, false));
  }

  return axes;
}

//
// Helper function to build a single axis
//
function buildAxisTimeline(src, dst, colorHex, dashed) {
  let geom = new THREE.Geometry(), mat; 

  if(dashed) {
     mat = new THREE.LineDashedMaterial({linewidth: 50, color: colorHex, dashSize: 3, gapSize: 3});
  } 
  else {
    mat = new THREE.LineBasicMaterial({linewidth: 50, color: colorHex});
  }

  geom.vertices.push(src.clone());
  geom.vertices.push(dst.clone());
  geom.computeLineDistances(); // This one is SUPER important, otherwise dashed lines will appear as simple plain lines

  let axis = new THREE.Line(geom, mat);

  return axis;
}

//
// Render
//
function renderTimeline() {
  timelineCamera.updateProjectionMatrix();
  timelineRayCaster.setFromCamera(timelineMouse, timelineCamera);

  let intersects = timelineRayCaster.intersectObjects(lineParent.children, true);

  if(intersects.length > 0) {
    timelineInter = intersects[0].object;
    pointInter.visible = true;
    pointInter.position.copy(intersects[0].point);
  }
  else {
    timelineInter = undefined;
    pointInter.visible = false;
  }

  timelineRenderer.render(timelineScene, timelineCamera);
  timelineStats.update();
}

//
// Aniamtion
//
function animateTimeline() {
  requestAnimationFrame(animateTimeline);
  timelineControls.update();
  renderTimeline();
}

//
// Resize event
//
function resizeTimeline() {
  timelineWidth = timelineContainer.clientWidth, timelineHeight = timelineContainer.clientHeight;

  timelineCamera.aspect = timelineWidth/timelineHeight;
  timelineCamera.updateProjectionMatrix();

  timelineRenderer.setSize(timelineWidth, timelineHeight);

  timelineControls.handleResize();
  
  renderTimeline();
}

function timelineOnMouseMove(event) {
  event.preventDefault();
  timelineMouse.x = ((event.clientX - timelineContainer.offsetLeft) / timelineWidth) * 2 - 1;
  timelineMouse.y = - ((event.clientY - timelineContainer.offsetTop) / timelineHeight) * 2 + 1;
}

function timelineOnClick(event) {
  if(timelineInter !== undefined) {
    const trackNo = timelineInter.parent.userData.trackNo;
    trackManager.setCurrentEditTrack(trackNo);
  }
}
