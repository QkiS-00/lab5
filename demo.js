import { asyncFilterAwait, asyncFilterWithAbort } from './asyncFilter.js';

async function runDemo() {
  const words = ['apple', 'banana', 'cat', 'dog', 'elephant'];

  async function isLongWord(word) {
    await new Promise(r => setTimeout(r, 50));
    return word.length > 4;
  }

  const longWords = await asyncFilterAwait(words, isLongWord);
  console.log('Long words:', longWords);

  const controller = new AbortController();
  const signal = controller.signal;

  setTimeout(function() {
    controller.abort();
  }, 150);

  try {
    const result = await asyncFilterWithAbort(
      [1, 2, 3, 4, 5],
      function(num, sig) {
        return new Promise(function(resolve, reject) {
          const timer = setTimeout(function() {
            resolve(num % 2 === 0);
          }, 200);

          if (sig) {
            sig.addEventListener('abort', function() {
              clearTimeout(timer);
              reject(new Error('Item processing aborted'));
            });
          }
        });
      },
      signal
    );
    console.log('Result:', result);
  } catch (err) {
    console.log('Caught error:', err.message);
  }
}

runDemo();