/* 2nd */

// Global reference of html elements and attributes
let container, width, height;

// Global reference of three.js variables
let renderer, scene, camera, stats, controls, axes, gridHelper

// Raycasting
let rayCaster, mouse, currentIntersected, sphereInter, trackParent;

init();
animate();

//
// Executed on initialization
//
function init() {
  container = document.getElementById('coordContainer');
  width = container.clientWidth, height = container.clientHeight;

  // Set renderer
  renderer = new THREE.WebGLRenderer({antialias: true});
  renderer.setSize(width, height);
  renderer.setClearColor(0x000000, 1.0);
  container.appendChild(renderer.domElement); // The renderer is a child of the coord div part
  
  // Set up a new scene
  scene = new THREE.Scene();

  // Add axes
	axes = buildAxes(1500);
  scene.add(axes);

  // Add grid helpers
  gridHelper = new THREE.GridHelper(1000, 100);
  gridHelper.name = "grid";
  gridHelper.geometry.rotateX(Math.PI/2);
  
  // Set camera initial position
  camera = new THREE.PerspectiveCamera(45, width/height, 1, 20000);
  camera.position.set(-100, -100, 100);
  camera.up.set(0, 0, 1);

  // Div container stats
  stats = new Stats();
  // Dev tool for performance(stats in the left-top corner)
  //container.appendChild(stats.dom);

  // Trackball controls
  controls = new THREE.TrackballControls(camera, renderer.domElement);
  controls.rotateSpeed = 2;
  controls.zoomSpeed = 1.2;
  controls.panSpeed = 0.8;
  controls.noZoom = false;
  controls.noPan = false;
  controls.staticMoving = true;
  controls.dynamicDampingFactor = 0;
  controls.target = new THREE.Vector3(100, 100, 0);

  // Raycatser for selecting and highlighting
  rayCaster = new THREE.Raycaster();
  rayCaster.linePrecision = 3;
  mouse = new THREE.Vector2();
  sphereInter = new THREE.Mesh(new THREE.SphereBufferGeometry(1), new THREE.MeshBasicMaterial({color: 0xff0000}));
  sphereInter.visible = false;
  scene.add(sphereInter);

  trackParent = new THREE.Object3D();
  scene.add(trackParent);

  // Listeners
  window.addEventListener('resize', resize, false);
  controls.addEventListener('change', render);
  container.addEventListener('transitionend', resize);
  container.addEventListener('mousemove', onMouseMove);
  container.addEventListener('click', onClick);

  // Start Render
  render();
}

//
// Wrapper function of building axes
//
function buildAxes(length) {
    let axes = new THREE.Object3D();

    // 6 direcitons
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(length, 0, 0), 0xFF0000, false)); // +X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(-length, 0, 0), 0xFF0000, true)); // -X
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, length, 0), 0x00FF00, false)); // +Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, -length, 0), 0x00FF00, true)); // -Y
    axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, length), 0x0000FF, false)); // +Z
    //axes.add(buildAxis(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -length), 0x0000FF, true)); // -Z

    return axes;
}

//
// Helper function to build a single axis
//
function buildAxis(src, dst, colorHex, dashed) {
    let geom = new THREE.Geometry(), mat;

    if(dashed) {
       mat = new THREE.LineDashedMaterial({linewidth: 3, color: colorHex, dashSize: 3, gapSize: 3});
    } 
    else {
      mat = new THREE.LineBasicMaterial({linewidth: 3, color: colorHex});
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
function render() {
  camera.updateMatrixWorld();
  rayCaster.setFromCamera(mouse, camera);
  
  let intersects = rayCaster.intersectObjects(trackParent.children, true);
  
  if(intersects.length > 0) {
    currentIntersected = intersects[0].object;
    //console.log(currentIntersected);
    sphereInter.visible = true;
    sphereInter.position.copy(intersects[0].point);
  }
  else {
    currentIntersected = undefined;
    sphereInter.visible = false;
  }

  renderer.render(scene, camera);
  stats.update();
}

//
// Animation
//
function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

//
// Resize event
//
function resize() {
  width = container.clientWidth, height = container.clientHeight;

  camera.aspect = width/height;
  camera.updateProjectionMatrix();

  renderer.setSize(width, height);

  controls.handleResize();
  
  render();
}

function onMouseMove(event) {
  event.preventDefault();
  mouse.x = ((event.clientX - container.offsetLeft) / width) * 2 - 1;
  mouse.y = - ((event.clientY - container.offsetTop) / height) * 2 + 1;
}

function onClick(event) {
  if(currentIntersected !== undefined) {
    const trackNo = currentIntersected.userData.trackNo;
    console.log(trackNo);
    trackManager.setCurrentEditTrack(trackNo);
  }
}