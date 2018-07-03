/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
'use strict';


function ensureLocPerm() {
  const diagnostic = cordova.plugins.diagnostic;
  // diagnostic.getPermissionAuthorizationStatus(function(status) {
  //   switch(status) {
  //     case diagnostic.permissionStatus.GRANTED:
  //       console.log('Permission granted to use the location');
  //       break;
  //     case diagnostic.permissionStatus.NOT_REQUESTED:
  //       console.log('Permission to use the location has not been requested yet');
  //       break;
  //     case diagnostic.permissionStatus.DENIED:
  //       console.log('Permission denied to use the location - ask again?');
  //       break;
  //     case diagnostic.permissionStatus.DENIED_ALWAYS:
  //       console.log('Permission permanently denied to use the location - guess we won't be using it then!');
  //       break;
  //   }
  // }, function(error) {
  //   console.error('The following error occurred: '+error);
  // }, cordova.plugins.diagnostic.permission.ACCESS_FINE_LOCATION);

  diagnostic.isLocationAvailable(function(available) {
    console.log('Location is ' + (available ? 'available' : 'not available'));
    if(!available) { // either location is off or no access
      diagnostic.requestLocationAuthorization(function(status) {
        switch(status) {
        case diagnostic.permissionStatus.NOT_REQUESTED:
          console.log('Permission not requested');
          break;
        case diagnostic.permissionStatus.GRANTED:
          console.log('Permission granted');
          break;
        case diagnostic.permissionStatus.DENIED:
          console.log('Permission denied');
          break;
        case diagnostic.permissionStatus.DENIED_ALWAYS:
          console.log('Permission permanently denied');
          break;
        }
      }, function(error) {
        console.error(error);
      });
    }
  }, function(error) {
    console.error('The following error occurred: '+error);
  });
}

let peerList = [],
  wdNode;

function getNode() {
  const wd = cordova.plugins.wifi_direct;
  return new Promise((accept, reject) => {
    wd.getInstance(1, 1, 1, 1, 1, accept, reject);
  });
}

function stopDiscovering() {
  wdNode.stopDiscovering(console.log, console.error);
}

// checks for peers every 15 secs
function startDiscovering() {
  wdNode.startDiscovering(peers => {
    // filter and save the robot peers
    peerList = peers.filter(() => true);
  }, console.error);
}

function connectPeer(target) {
  return new Promise((accept, reject) => {
    wdNode.connect(target, accept, reject);
  });
}


var app = {
  // Application Constructor
  initialize: function() {
    document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
  },

  // deviceready Event Handler
  //
  // Bind any cordova events here. Common events are:
  // 'pause', 'resume', etc.
  onDeviceReady: function() {
    this.receivedEvent('deviceready');
    ensureLocPerm(); // async
  },

  // Update DOM on a Received Event
  receivedEvent: function(id) {
    var parentElement = document.getElementById(id);
    var listeningElement = parentElement.querySelector('.listening');
    var receivedElement = parentElement.querySelector('.received');

    listeningElement.setAttribute('style', 'display:none;');
    receivedElement.setAttribute('style', 'display:block;');

    console.log('Received Event: ' + id);
  }
};

app.initialize();
