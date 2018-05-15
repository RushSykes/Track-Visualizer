// Global reference of html elements and attributes
let timelineContainer, timelineIndicator, width, height, secHeight;

// Global reference of three.js variables
let renderer, scene, camera, stats, controls;

// GLobal reference of timeline min and max slider line
let minLine, maxLine;

// Filtering
let pointInter, lineParent;

initTimeline();
animateTimeline();

//
// Executed on initialization
//
function initTimeline() {
  // timeline
  timelineContainer = document.getElementById('timelineContainer');
  width = timelineContainer.clientWidth, height = timelineContainer.clientHeight;

  // Set renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(width, height);
  renderer.setClearColor(0x3486AD, 1.0);
  timelineContainer.appendChild(renderer.domElement); // The renderer is a child of the coord div part

  // Set up a new scene
  scene = new THREE.Scene();

  // Add axes
	let axes = buildAxesTimeline(10000);
  scene.add(axes);

  // Set camera
  camera = new THREE.OrthographicCamera(width/-2, width/2, height/2, height/-2, 1, 1000);
  camera.position.set(width/2-2, height/2-2, 100);
  camera.lookAt(new THREE.Vector3(width/2-2, height/2-2, 0));
  
  // Div container stats
  stats = new Stats();
  // Dev tool for performance(stats in the left-top corner)
  // container.appendChild(stats.dom);

  // Ortho Trackball controls
  controls = new OrthographicTrackballControls(camera, renderer.domElement);

  lineParent = new THREE.Object3D();
  scene.add(lineParent);
  // Listeners
  window.addEventListener('resize', resizeTimeline, false);

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

  secHeight = height / 4;
  let tempY;
  // Split-line for each section
  for(let i = 1; i < 4 ; i++) {
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
  renderer.render(scene, camera);
  stats.update();
}

//
// Aniamtion
//
function animateTimeline() {
  requestAnimationFrame(animateTimeline);
  // If we want control then we can add this
  // controls.update();
  renderTimeline();
}

//
// Resize event
//
function resizeTimeline() {
  width = timelineContainer.clientWidth, height = timelineContainer.clientHeight;

  camera.aspect = width/height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);
  
  renderTimeline();
}
