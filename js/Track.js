// Declaration of structures being used to store track datas
// TODO: 1. Implement Doubly-Linked list methods
//       2. Implement track node handlers
//       3. Implement track processing

//
// Structure that would form a node of a doubly-linked list
//
function TrackNode (time, lat, lng) {
  // Node attributes
  this.time = time;
  this.latitude = lat;
  this.longitude = lng;

  // Doubly-Linked list
  this.prev = null;
  this.next = null;
  this.gap = 1;
  this.nodeNo = -1;
}

function TrackHead() {
  // Head attributes, also a doubly-linked list
  this.prev = null;
  this.next = null;
  this.gap = 1;
  this.trackNo = -1;
  this.trackSize = -1;
  this.line = null;
  
  // Attributes of one track this head points to
  this.dataHead = null;
  this.dataTail = null;

  // Info of the track
  this.mainInfo = null;
  this.details = null;
  this.infoBoard = new AMap.Text({
    verticalAlign: 'middle',
    textAlign: 'left',
    style: {
      'background-color': 'yellow',
      'border':'solid 1px #0088ff',
    }
  });
}

//
// Class that takes charge of managing all tracks
//
class TrackManager {
  constructor() {
    this.numOfTracks = 0;
    this.trackMgrHead = null;
    this.trackMgrTail = null;
    this.curEditTrackNo = -1;
    this.curEditNodeNo = -1;
    this.curEditTrackHead = null;
    this.minTime = Number.MAX_SAFE_INTEGER;
    this.maxTime = Number.MIN_SAFE_INTEGER;

    // Abstract part
    this.drawnSet = new Set();

    // Timeline part
    this.timeDrawnSet = new Set();
  }

  addNewTrack() {
    let newTrackHead = new TrackHead();
    // If there's no track at first
    if(!this.trackMgrHead) {
      this.trackMgrHead = newTrackHead;
      this.trackMgrTail = newTrackHead;
      newTrackHead.trackNo = 1;
    }
    // Else insert at tail
    else {
      newTrackHead.prev = this.trackMgrTail;
      newTrackHead.trackNo = this.trackMgrTail.trackNo + 1;
      this.trackMgrTail.next = newTrackHead;
      this.trackMgrTail = newTrackHead;
    }
    this.numOfTracks++;
    newTrackHead.trackSize = 1;
    this.curEditTrackNo = newTrackHead.trackNo;
    this.curEditTrackHead = newTrackHead;
    
    console.log("Number of tracks: " + this.numOfTracks + "\n" + 
                "Current track: " + this.curEditTrackNo + "\n" + 
                "Node no: " + this.curEditTrackHead.trackSize);
  }

  deleteTrack(trackNo) {
    if(this.curEditTrackHead.trackNo === trackNo) {
      let index = this.trackMgrHead.trackNo;
      let head = this.trackMgrHead;

      while(head && index < trackNo) {
        index += head.gap;
        head = head.next;
      }

      // Erase the line drawn
      if(head.trackSize >=2) {
        head.line.setMap(null);
      }
      head.line = null;

      // There's only one track
      if(head === this.trackMgrHead && head === this.trackMgrTail) {
        this.trackMgrHead = null;
        this.trackMgrTail = null;
      }
      // This is the head
      else if(head === this.trackMgrHead) {
        this.trackMgrHead = this.trackMgrHead.next;
        this.trackMgrHead.prev = null;
      }
      // This is the tail
      else if(head === this.trackMgrTail) {
        this.trackMgrTail = this.trackMgrTail.prev;
        this.trackMgrTail.next = null;
      }
      // A node in the middle
      else {
        head.prev.next = head.next;
        head.prev.gap += head.gap;
        head.next.prev = head.prev;
      }
      this.numOfTracks--;
    }
    else {
      console.log("deleteTrack error: trackNo\n")
    }
  }

  deleteAllTracks() {
    this.numOfTracks = 0;
    this.trackMgrHead = null;
    this.trackMgrTail = null;
    this.curEditTrackNo = -1;
    this.curEditTrackHead = null;
  }

  getCurrentEditTrackHead() {
    return this.curEditTrackHead;
  }

  getCurrentEditTrackNo() {
    return this.curEditTrackNo;
  }

  getCurrentEditNodeNo() {
    return this.curEditNodeNo;
  }

  getCurrentEditTrackFirstNodeNo() {
    return this.curEditTrackHead.dataHead.nodeNo;
  }

  getCurrentEditTrackLastNodeNo() {
    return this.curEditTrackHead.dataTail.nodeNo;
  }

  getCurrentEditTrackSize() {
    return this.curEditTrackHead.trackSize;
  }

  getCurrentEditTrackFirstPos() {
    let pos = new AMap.LngLat(this.curEditTrackHead.dataHead.longitude, this.curEditTrackHead.dataHead.latitude);
    return pos;
  }

  getCurrentEditTrackMainInfo() {
    return this.curEditTrackHead.mainInfo;
  }

  getCurrentEditTrackDetails() {
    return this.curEditTrackHead.details;
  }

  getCurrentTrackTimeStampArray() {
    let head = this.curEditTrackHead.dataHead;

    let timeArray = new Array();

    while(head) {
      timeArray.push(head.time);
      head = head.next;
    }
    return timeArray;
  }

  getCurrentNodeTimeStamp() {
    let index = this.curEditTrackHead.dataHead.nodeNo;
    let head = this.curEditTrackHead.dataHead;

    while(head && index < this.curEditNodeNo) {
      index += head.gap;
      head = head.next;
    }
    return head.time;
  }

  getCurrentDateAndTime() {
    const stamp = this.getCurrentNodeTimeStamp();
    let tempDate = new Date(stamp);
    let tempMonth = tempDate.getMonth() + 1; if(tempMonth < 10) tempMonth = "0" + tempMonth;
    let tempDay = tempDate.getDate(); if(tempDay < 10) tempDay = "0" + tempDay;
    let tempHour = tempDate.getHours(); if(tempHour < 10) tempHour = "0" + tempHour;
    let tempMin = tempDate.getMinutes(); if(tempMin < 10) tempMin = "0" + tempMin;
    let tempSec = tempDate.getSeconds(); if(tempSec < 10) tempSec = "0" + tempSec;
  
    let dateValue = tempDate.getFullYear() + "-" + tempMonth + "-" + tempDay;
    let timeValue = tempHour + ":" + tempMin + ":" + tempSec;

    return {
      date: dateValue,
      time: timeValue
    }
  }

  getTrackAsArray(trackNo) {
    let posArray = new Array();
    let mgrHead = this.trackMgrHead;

    while(mgrHead) {
      if(mgrHead.trackNo === trackNo) {
        let head = mgrHead.dataHead;
        while(head) {
          let tempPos = new AMap.LngLat(head.longitude, head.latitude);
          posArray.push(tempPos);
          head =  head.next;
        }
        break;
      }
      mgrHead = mgrHead.next;
    }
    
    return posArray;
  }

  getTrackTimeStampArray(trackNo) {
    let head = this.trackMgrHead;
    let timeArray = new Array();
    if(head)
    {
      let index = this.trackMgrHead.trackNo;

      while(head && index < trackNo) {
        index += head.gap;
        head = head.next;
      }
      if(head) {
        let dataHead = head.dataHead;
        while(dataHead) {
          timeArray.push(dataHead.time);
          dataHead = dataHead.next;
        }
      }
    }
    return timeArray;
  }

  getMinTimeStamp() {
    return this.minTime;
  }

  updateMinTimeStamp() {
    let head = this.trackMgrHead;

    while(head) {
      let node = head.dataHead;
      while(node) {
        if(node.time < this.minTime) {
          this.minTime = node.time;
        }
        node = node.next;
      }
      head = head.next;
    }
  }

  getMaxTimeStamp() {
    return this.maxTime;
  }

  updateMaxTimeStamp() {
    let head = this.trackMgrHead;

    while(head) {
      let node = head.dataHead;
      while(node) {
        if(node.time > this.maxTime) {
          this.maxTime = node.time;
        }
        node = node.next;
      }
      head = head.next;
    }
  }

  setCurrentEditTrack(no) {
    console.log("CurrentEditTrack:" + no);
    this.curEditTrackNo = no;
    let head = this.trackMgrHead;
    // Traverse the head list
    while(head) {
      if(head.trackNo === no) {
        this.curEditTrackHead = head;
        if(this.curEditTrackHead.trackSize >= 2) {
          this.curEditTrackHead.line.setOptions({
            strokeColor: "#FF0000"
          });
        }
        head = head.next;
      }
      else {
        // Set other tracks to blue to indicate that they're not currently being edited
        if(head.trackSize >= 2) {
          head.line.setOptions({
            strokeColor : "#0080FF"
          });
        }
        head = head.next;
      }
    }
  }

  setCurrentEditNodeNo(no) {
    this.curEditNodeNo = no;
  }

  addTrackNode(time, lat, lng, trackNo) {
    // If there's a available current editing track
    if(this.curEditTrackHead) {
      if(trackNo === this.curEditTrackHead.trackNo) {
        let newTrackNode = new TrackNode(time, lat, lng);
        // If there's no data in this track
        if(!this.curEditTrackHead.dataHead) {
          this.curEditTrackHead.dataHead = newTrackNode;
          this.curEditTrackHead.dataTail = newTrackNode;
          newTrackNode.nodeNo = 1;
        }
        // Else insert at tail
        else {
          newTrackNode.prev = this.curEditTrackHead.dataTail;
          newTrackNode.nodeNo = this.curEditTrackHead.dataTail.nodeNo + 1;
          this.curEditTrackHead.dataTail.next = newTrackNode;
          this.curEditTrackHead.dataTail = newTrackNode;
          this.curEditTrackHead.trackSize++;
        }
        return true;
      }
      else {
        console.log("addTrackNode error: trackNo\n");
        return false;
      }
    }
    // Else if there's no track head available
    else {
      console.log("addTrackNode error: No track head available\n");
      return false;
    }
  }

  deleteTrackNode(trackNo, nodeNo) {
    if(this.curEditTrackHead.trackNo === trackNo) {
      let index = this.curEditTrackHead.dataHead.nodeNo;
      let head = this.curEditTrackHead.dataHead;

      while(head && index < nodeNo) {
        index += head.gap;
        head = head.next;
      }

      // There's only one node in this track
      if(head === this.curEditTrackHead.dataHead && head === this.curEditTrackHead.dataTail) {
        this.curEditTrackHead.dataHead = null;
        this.curEditTrackHead.dataTail = null;
      }
      // This is the head
      else if(head === this.curEditTrackHead.dataHead) {
        this.curEditTrackHead.dataHead = this.curEditTrackHead.dataHead.next;
        this.curEditTrackHead.dataHead.prev = null;
      }
      // This is the tail
      else if(head === this.curEditTrackHead.dataTail) {
        this.curEditTrackHead.dataTail = this.curEditTrackHead.dataTail.prev;
        this.curEditTrackHead.dataTail.next = null;
      }
      // A node in the middle
      else {
        head.prev.next = head.next;
        head.prev.gap += head.gap;
        head.next.prev = head.prev;
      }
      this.curEditTrackHead.trackSize--;
      if(this.curEditTrackHead.trackSize <= 1) {
        if(this.curEditTrackHead.line) {
          this.curEditTrackHead.line.setMap(null);
        }
        this.curEditTrackHead.line = null;
      }
    }
  }

  updateTrackNode(trackNo, nodeNo, lat, lng) {
    if(this.curEditTrackHead.trackNo === trackNo) {
      let index = this.curEditTrackHead.dataHead.nodeNo;
      let head = this.curEditTrackHead.dataHead;

      while(head && index < nodeNo) {
        index += head.gap;
        head = head.next;
      }
      head.latitude = lat;
      head.longitude = lng;
    }
  }

  drawTrack(trackNo) {
    if(this.curEditTrackHead.trackNo === trackNo) {
      let path = new Array();
      let head = this.curEditTrackHead.dataHead;

      while(head) {
        let pos = new Array();
        pos.push(head.longitude, head.latitude);
        console.log(pos);
        path.push(pos);
        head = head.next;
      }

      if(this.curEditTrackHead.line) {
        this.curEditTrackHead.line.setMap(null);
      }
      let trackLine = new AMap.Polyline({
        path: path,
        strokeColor: "#FF0000",
        strokeOpacity: 1,       
        strokeWeight: 5,        
        strokeStyle: "solid",
        lineCap: "round",
        lineJoin: "round"
      });
      trackLine.setMap(map);
      this.curEditTrackHead.line = trackLine;
    }
    else {
      console.log("drawTrack error: something wrong with trackNo");
    }
  }

  showInfo(trackNo, position) {
    if(this.curEditTrackHead.trackNo === trackNo) {
      if(this.curEditTrackHead.infoBoard !== null) {
        this.curEditTrackHead.infoBoard.setPosition(position);
        this.curEditTrackHead.infoBoard.setMap(map);
        // Get rid of other info board
        let head = this.trackMgrHead;
        // Traverse the head list
        while(head) {
          if(head.infoBoard !== null && head.infoBoard.getMap() !== null && head !== this.curEditTrackHead) {
            head.infoBoard.setMap(null);
          }
          head = head.next;
        }
      }
      else {
        console.log("drawTrack error: something wrong with showinfo infoboard\n");
      }
    }
  }

  hideInfo() {
    this.curEditTrackHead.infoBoard.setMap(null);
  }

  updateInfo(trackNo, mainInfo, details, position) {
    if(this.curEditTrackHead.trackNo === trackNo) {
      this.curEditTrackHead.mainInfo = mainInfo;
      this.curEditTrackHead.details = details;
      
      let displayText = "MainInfo: " + mainInfo + ";" + "    Deatils: " + details;
      this.curEditTrackHead.infoBoard.setPosition(position);
      this.curEditTrackHead.infoBoard.setText(displayText);
      if(this.curEditTrackHead.infoBoard.getMap() !== null) {
        this.curEditTrackHead.infoBoard.setMap(map);
      }

      // Get rid of other info board
      let head = this.trackMgrHead;
      // Traverse the head list
      while(head) {
        if(head.infoBoard !== null && head.infoBoard.getMap() !== null && head !== this.curEditTrackHead) {
          head.infoBoard.setMap(null);
        }
        head = head.next;
      }
    }
  }

  updateNodeTime(trackNo, nodeNo, time) {
    if(this.curEditTrackHead.trackNo === trackNo) {
      let index = this.curEditTrackHead.dataHead.nodeNo;
      let head = this.curEditTrackHead.dataHead;

      while(head && index < nodeNo) {
        index += head.gap;
        head = head.next;
      }
      let dateAndTime = time.split(" ");
      let newDate = dateAndTime[0]; console.log(newDate);
      let newTime = dateAndTime[1]; console.log(newTime);
      dateAndTime = time.replace('/-/g', '/'); console.log(dateAndTime);
      let milliSec = head.time % 1000;
      let tempTime = new Date(dateAndTime).getTime() + milliSec;

      // Perhaps the time hasn't changed, only position has been updated
      if(head.time === tempTime) {
        return false;
      }
      else {
        head.time = tempTime;
        return true;
      } 
    }
    else {
      console.log("updateNodeTime error: something wrong with trackNo\n");
    }
  }

  // TODO: DTW find similar tracks
  findSimilarTracks(trackNo) {
    // Target track
    const thisArray = this.getTrackAsArray(trackNo);

    // Results
    const similarTrackNos = new Array();

    // Loop through all tracks to find similar ones 
    let head = this.trackMgrHead;
    while(head) {
      const tempNo = head.trackNo;
      // No comparison to itself
      if(tempNo !== trackNo) {
        const tempArray = this.getTrackAsArray(tempNo);
        // DTW
        const tempResult = this.dtw(thisArray, tempArray);

        // TODO: If some condition is satisfied, then tempArray is similar
        // if(cond)
        similarTrackNos.push(tempNo);
      }
      head = head.next;
    }
    return similarTrackNos;
  }

  dtw(trackA, trackB) {
    const lenA = trackA.length, lenB = trackB.length;

    // DP array
    let dtwArray = new Array(lenA + 1);

    // Reset dtw array each time in the loop
    for(let i = 0; i < lenA; i++) {
      dtwArray[i] = new Array(lenB + 1);
      for(let j = 0; j < lenB; j++) {
        dtwArray[i][j] = 0;
      }
    }

    // Setup for DP
    for(let i = 1; i <= lenA; i++) {
      dtwArray[i][0] = Number.MAX_SAFE_INTEGER;
    }
    for(let j = 1; j <= lenB; j++) {
      dtwArray[0][j] = Number.MAX_SAFE_INTEGER;
    }
    dtwArray[0][0] = 0;

    // DP
    for(let i = 1; i <= lenA; i++) {
      for(let j = 1; j <= lenB; j++) {
        let cost = trackA[i].distance(trackB[j]);
        dtwArray[i][j] = cost + Math.min(dtwArray[i-1][j], dtwArray[i][j-1], dtwArray[i-1][j-1]);
      }
    }
    return dtwArray[lenA][lenB];
  }

  // TODO: File-realted featrues
  loadTracks() {

  }

  saveTracks() {

  }

  //
  // Abstract coord
  //
  abstractIsDrawn(trackNo) {
    for(let item of this.drawnSet.values()) {
      if(trackNo === item.userData.trackNo) {
        return true;
      }
    }
    return false;
  }

  // TODO: Size problem
  abstractDrawSelected() {
    const selectedTrackNo = this.getCurrentEditTrackNo();
    const selectedTrack = this.getTrackAsArray(selectedTrackNo);
    const timeArray = this.getCurrentTrackTimeStampArray();
    const trackLen = selectedTrack.length;

    if(!this.abstractIsDrawn(selectedTrackNo) && selectedTrackNo !== -1)
    {
      let points3D = new THREE.BufferGeometry();
      for(let i = 0; i < trackLen; i++) {
        // X-axis-->Longitude Y-axis-->Latitude
        let x = selectedTrack[i].getLng();
        let y = selectedTrack[i].getLat();
        let point = new THREE.Vector3(x, y, (timeArray[i] - timeArray[0])/50);
        points3D.vertices.push(point);
      }

      let mat = new THREE.LineBasicMaterial({color: Math.random()*0xffffff});
      let polyLine = new THREE.Line(points3D, mat);
      polyLine.userData = {
        trackNo: selectedTrackNo,
        modified: false,
        material: mat
      };
      polyLine.name = "Track" + selectedTrackNo;
      this.drawnSet.add(polyLine);
      return polyLine;
    }
    else {
      console.log("abstractDrawSelected: Already drawn! or No line at all!\n")
      return null;
    }
  }

  abstractDrawTrackNo(trackNo) {
    const selectedTrack = this.getTrackAsArray(trackNo);
    const timeArray = this.getTrackTimeStampArray(trackNo);
    const trackLen = selectedTrack.length;

    if(!this.abstractIsDrawn(trackNo) && trackNo !== -1)
    {
      let points3D = new THREE.Geometry();
      for(let i = 0; i < trackLen; i++) {
        // X-axis-->Longitude Y-axis-->Latitude
        let x = selectedTrack[i].getLng();
        let y = selectedTrack[i].getLat();
        let point = new THREE.Vector3(x, y, (timeArray[i] - timeArray[0])/50);
        points3D.vertices.push(point);
      }

      let mat = new THREE.LineBasicMaterial({color: Math.random()*0xffffff});
      let polyLine = new THREE.Line(points3D, mat);
      polyLine.userData = {
        trackNo: trackNo,
        modified: false,
        material: mat
      };
      polyLine.name = "Track" + trackNo;
      this.drawnSet.add(polyLine);
      return polyLine;
    }
    else {
      console.log("abstractDrawTrackNo: Already drawn! or No line at all!\n")
      return null;
    }
  }

  abstractMarkModified() {
    const modifiedTrackNo = this.getCurrentEditTrackNo();

    for(let item of this.drawnSet.values()) {
      if(item.userData.trackNo === modifiedTrackNo && !item.userData.modified) {
        item.userData.modified = true;
        console.log("Modified\n")
        break;
      }
    }
  }

  abstractUpdateModified() {
    // All modified tracks are going to be returned
    let modifiedLines = new Array();

    for(let item of this.drawnSet.values()) {
      if(item.userData.modified) {
        // Remove the old one first
        console.log(item.name+"\n");
        this.drawnSet.delete(item);

        // Push a new one in
        const modifiedTrack = this.getTrackAsArray(item.userData.trackNo);
        const timeArray = this.getTrackTimeStampArray(item.userData.trackNo);
        const trackLen = modifiedTrack.length;
        let newPoints3D = new THREE.Geometry();
        let mat = item.userData.material;

        if(modifiedTrack.length > 0) {
          // Redraw according to the update

          for(let i = 0; i < trackLen; i++) {
            // X-axis-->Longitude Y-axis-->Latitude
            let x = modifiedTrack[i].getLng();
            let y = modifiedTrack[i].getLat();
            let point = new THREE.Vector3(x, y, (timeArray[i] - timeArray[0])/50);
            newPoints3D.vertices.push(point);
          }
          let newPolyLine = new THREE.Line(newPoints3D, mat);
          newPolyLine.userData = {
            trackNo: item.userData.trackNo,
            modified: false,
            material: mat
          };
          newPolyLine.name = "Track" + item.userData.trackNo;
          this.drawnSet.add(newPolyLine);
          modifiedLines.push(newPolyLine);
        }
        
        else {
          // This track is deleted
          item.geometry.vertices.splice(0,item.geometry.vertices.length);
          item.userData.modified = false;
          item.geometry.verticesNeedUpdate = true;
          item.name = "Track" + item.userData.trackNo;
          let newItem = item.clone(true);
          modifiedLines.push(newItem);
        }
      } // If item modified, it needs to be updated
    } // for loop

    return modifiedLines;
  }

  abstractDrawAll() {
    let head = this.trackMgrHead;
    let allTrack = new Array();

    while(head) {
      let temp = this.abstractDrawTrackNo(head.trackNo);
      if(temp) {
        allTrack.push(temp);
      }
      head = head.next;
    }

    return allTrack;
  }

  abstractHideExcept() {

  }

  //
  // Timeline
  //
  timelineIsDrawn(trackNo) {
    for(let item of this.timeDrawnSet.values()) {
      if(trackNo === item.userData.trackNo) {
        return true;
      }
    }
    return false;
  }

  timelineDrawTrackNo(trackNo, secHeight) {
    const speedMin = secHeight * 3;
    const straightnessMin = speedMin - secHeight;
    let polyLines = new THREE.Object3D();

    const selectedTrack = this.getTrackAsArray(trackNo);
    const timeArray = this.getTrackTimeStampArray(trackNo);
    const trackLen = selectedTrack.length;
    let mat = new THREE.LineBasicMaterial({color: Math.random()*0xffffff});

    if(!this.timelineIsDrawn(trackNo) && trackNo !== -1)
    {
      // ===== Speed =====
      let points3D = new THREE.Geometry();
      for(let i = 0; i < trackLen - 1; i++) {
        let distance = selectedTrack[i].distance(selectedTrack[i+1]); // Unit: m
        let timeDiff = (timeArray[i+1] - timeArray[i])/1000; // Unit: s
        let avgSpeed = (distance*3.6/timeDiff); // m/s * 3.6 --> km/h
        // Normalize first
        let x = (10000.0*(timeArray[i]-this.minTime))/(this.maxTime-this.minTime);
        let y = (secHeight*(avgSpeed/200.0)) + speedMin;
        // X-axis-->Time Y-axis-->Speed
        let point = new THREE.Vector3(x, y, 0.0);
        points3D.vertices.push(point);
      }
      let speedPolyLine = new THREE.Line(points3D, mat);

      // ===== Straghtness =====
      points3D = new THREE.Geometry();
      for(let i = 1; i < trackLen - 1; i++) {
        
      }
      // ===== Wrapper =====
      polyLines.add(speedPolyLine);

      polyLines.userData = {
        trackNo: trackNo,
        modified: false,
        material: mat
      };
      polyLines.name = "Track" + trackNo;
      this.timeDrawnSet.add(polyLines);
      return polyLines;
    }
    else {
      console.log("abstractDrawTrackNo: Already drawn! or No line at all!\n")
      return null;
    }

  }

  timelineDrawAll(secHeight) {

  }

  timelineMarkModified() {
    const modifiedTrackNo = this.getCurrentEditTrackNo();

    for(let item of this.timeDrawnSet.values()) {
      if(item.userData.trackNo === modifiedTrackNo && !item.userData.modified) {
        item.userData.modified = true;
        console.log("Modified\n");
        break;
      }
    }
  }

  timelineUpdateModified(secHeight) {

  }

} // Class TrackManager

//
// Export this manager as a instance
//
let manager = new TrackManager();
module.exports = {
  manager: manager
};