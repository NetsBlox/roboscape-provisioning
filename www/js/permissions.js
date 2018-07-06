'use strict';

const Perms = {
  ensureLocPerm() {
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

};
