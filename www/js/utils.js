// waits for a sync fn
const sharedStore = {
  state: {
    profile: null,
    originalAp: '',
    curSSID: '',
    aps: [
      {
        SSID: 'xbee-23423 test ssid',
        BSSID: 'test:bssid'
      },
      {
        SSID: 'test ssid',
        BSSID: 'test:bssid',
        level: 0,
        frequency: 0,
        capabilities: '',
      },
    ], // live accesspoints
  }
};

function waitUntil(fn, maxWait) {
  return new Promise((resolve, reject) => {
    var startTime = Date.now();
    var check = function() {
      let result = fn();
      if (result || Date.now()-startTime > maxWait) {
        if (result) {
          resolve(result);
        } else {
          reject(result);
        }
      } else {
        setTimeout(check, 25);
      }
    };
    maxWait = maxWait || 4000;
    check();
  });
};

function waitUntilPromise(fn, maxWait=5000) {
  var startTime = Date.now();
  return new Promise((resolve, reject) => {
    var check = async function() {
      try {
        let result = await fn(); // assuming the function also has a reasonable timeout of its own
        resolve(result);
      } catch (e) { // fn is not resolving yet;
        if (Date.now()-startTime > maxWait) {
          reject('timed out');
        } else {
          setTimeout(check, 100);
        }
      }
    };
    check();
  });
};

function sleep(duration) {
  console.debug('sleeping for', duration);
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}
