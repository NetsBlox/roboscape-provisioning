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

// pings a single addr
function ping(addr, timeout=250) {
  let pingPromise = new Promise((resolve, reject) => {
    let p, success, err, ipList;
    ipList = [{query: addr, timeout: 1, retry: 1, version:'v4'}];
    p = new Ping();
    p.ping(ipList, results => {
      let resp = results[0].response;
      if (resp.status === 'success') {
        resolve(resp);
      } else {
        reject(resp);
      }
    }, reject);
  });

  let timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), timeout));
  return Promise.race([pingPromise, timeoutPromise]);
}



let testVal = false;

function setWait(dur) {
  return async () => {
    console.log('checking..');
    await sleep(dur);
    return testVal;
    console.log('did my wait thingy');
  };
}

async function testWait(dur) {
  console.log('starting to wait');
  await waitUntilPromise(setWait(dur), {maxWait:5000});
  console.log('finished waiting');
}

async function testWaitTF(dur) {
  console.log('starting to wait');
  await waitUntilPromiseTF(setWait(dur), {maxWait:5000});
  console.log('finished waiting, val is true now', testVal);
}
