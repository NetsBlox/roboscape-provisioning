// waits for a sync fn
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

function sleep(duration) {
  console.debug('sleeping for', duration);
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}
