function asyncFilterCallback(array, asyncPredicate, callback) {
  const results = [];
  let completed = 0;
  let hasError = false;

  if (array.length === 0) {
    callback(null, []);
    return;
  }

  array.forEach(function(item, index) {
    asyncPredicate(item, function(err, shouldInclude) {
      if (hasError) return;

      if (err) {
        hasError = true;
        callback(err, null);
        return;
      }

      results[index] = { item, shouldInclude };
      completed += 1;

      if (completed === array.length) {
        const filtered = results
          .filter(function(r) { return r.shouldInclude; })
          .map(function(r) { return r.item; });
        callback(null, filtered);
      }
    });
  });
}

function asyncFilterPromise(array, asyncPredicate) {
  return Promise.all(
    array.map(function(item) {
      return asyncPredicate(item).then(function(shouldInclude) {
        return { item, shouldInclude };
      });
    })
  ).then(function(results) {
    return results
      .filter(function(r) { return r.shouldInclude; })
      .map(function(r) { return r.item; });
  });
}

async function asyncFilterAwait(array, asyncPredicate) {
  const results = [];
  for (const item of array) {
    const shouldInclude = await asyncPredicate(item);
    if (shouldInclude) {
      results.push(item);
    }
  }
  return results;
}

function asyncFilterWithAbort(array, asyncPredicate, signal) {
  return new Promise(function(resolve, reject) {
    if (signal && signal.aborted) {
      reject(new Error('Aborted before start'));
      return;
    }

    const onAbort = function() {
      // cleanup — видаляємо listener одразу
      signal.removeEventListener('abort', onAbort);
      reject(new Error('Aborted by user'));
    };

    if (signal) {
      signal.addEventListener('abort', onAbort);
    }

    const promises = array.map(function(item) {
      return new Promise(function(res, rej) {
        if (signal && signal.aborted) {
          rej(new Error('Aborted before processing item'));
          return;
        }

        asyncPredicate(item, signal)
          .then(function(shouldInclude) {
            if (signal && signal.aborted) {
              rej(new Error('Aborted after predicate'));
              return;
            }
            res({ item, shouldInclude });
          })
          .catch(rej);
      });
    });

    Promise.all(promises)
      .then(function(results) {
        if (signal) signal.removeEventListener('abort', onAbort);
        const filtered = results
          .filter(function(r) { return r.shouldInclude; })
          .map(function(r) { return r.item; });
        resolve(filtered);
      })
      .catch(function(err) {
        if (signal) signal.removeEventListener('abort', onAbort);
        reject(err);
      });
  });
}