import {
  asyncFilterCallback,
  asyncFilterPromise,
  asyncFilterAwait,
  asyncFilterWithAbort,
} from './laba5.js';

const words = ['apple', 'banana', 'cat', 'dog', 'elephant'];

// --- Callback ---
asyncFilterCallback(
  words,
  function(item, cb) {
    setTimeout(function() {
      cb(null, item.length > 4);
    }, 50);
  },
  function(err, result) {
    if (err) return console.error('Callback error:', err);
    console.log('Callback result:', result);
  }
);

// --- Promise ---
asyncFilterPromise(
  words,
  function(item) {
    return new Promise(function(resolve) {
      setTimeout(function() { resolve(item.length > 4); }, 50);
    });
  }
).then(function(result) {
  console.log('Promise result:', result);
});

// --- Async/Await ---
async function runAwait() {
  const result = await asyncFilterAwait(
    words,
    function(item) {
      return new Promise(function(resolve) {
        setTimeout(function() { resolve(item.length > 4); }, 50);
      });
    }
  );
  console.log('Await result:', result);
}
runAwait();

// --- Abort ---
async function runAbort() {
  const controller = new AbortController();
  setTimeout(function() { controller.abort(); }, 80);

  try {
    const result = await asyncFilterWithAbort(
      [1, 2, 3, 4, 5],
      function(num, signal) {
        return new Promise(function(resolve, reject) {
          const timer = setTimeout(function() {
            resolve(num % 2 === 0);
          }, 200);

          if (signal) {
            const onAbort = function() {
              clearTimeout(timer);
              signal.removeEventListener('abort', onAbort);
              reject(new Error('Item aborted'));
            };
            signal.addEventListener('abort', onAbort);
          }
        });
      },
      controller.signal
    );
    console.log('Abort result:', result);
  } catch (err) {
    console.log('Caught:', err.message);
  }
}
runAbort();