// waits for a sync fn
const sharedStore = {
  state: {
    profile: null,
    originalAp: '',
    curSSID: '',
    aps: [
      {
        SSID: 'xbee-111111111111',
        BSSID: 'test:bssid',
        level: 0,
        frequency: 0,
        capabilities: ['PSK'],
      },
      {
        SSID: 'test ssid',
        BSSID: 'test:bssid',
        level: 0,
        frequency: 0,
        capabilities: ['PSK'],
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

// wait until the async function returns true
async function waitUntilPromiseTF(fn, opts) {
  opts = {
    maxWait: 5000,
    delayPerCheck: 300,
    params: [],
    ...opts, // WARN doesn't supported nested merging
  };

  const startTime = Date.now();

  while (true) {
    let rv = await fn(opts.params); // assuming the function also has a reasonable timeout of its own
    if (rv === true) {
      return true;
    } 
    if (Date.now()-startTime > opts.maxWait) {
      throw new Error('timed out');
    } else {
      await sleep(opts.delayPerCheck); // WARN way slower than setTimeout
    }
    
  }
}

// wait until the async function resolves
async function waitUntilPromise(fn, opts) {
  opts = {
    maxWait: 5000,
    delayPerCheck: 300,
    params: [],
    ...opts, // WARN doesn't supported nested merging
  };
  let startTime = Date.now();
  let check = async () => {
    try {
      let result = await fn(); // assuming the function also has a reasonable timeout of its own
      return result;
    } catch (e) { // fn is not resolving yet;
      if (Date.now()-startTime > opts.maxWait) {
        throw new Error('timed out');
      } else {
        setTimeout(check, delayPerCheck);
      }
    }
  };
  await check();
}

function sleep(duration) {
  console.debug('sleeping for', duration);
  return new Promise(resolve => {
    setTimeout(resolve, duration);
  });
}
