export async function asyncFilterAwait(array, asyncPredicate) {
  const results = [];

  for (const item of array) {
    const shouldInclude = await asyncPredicate(item);
    if (shouldInclude) {
      results.push(item);
    }
  }

  return results;
}

export function asyncFilterWithAbort(array, asyncPredicate, signal) {
  return new Promise(function(resolve, reject) {
    if (signal && signal.aborted) {
      reject(new Error('Aborted before start'));
      return;
    }

    const promises = array.map(function(item) {
      return asyncPredicate(item, signal).then(function(shouldInclude) {
        if (signal && signal.aborted) {
          throw new Error('Operation was aborted');
        }
        return { item: item, include: shouldInclude };
      });
    });

    if (signal) {
      signal.addEventListener('abort', function() {
        reject(new Error('Aborted by user'));
      });
    }

    Promise.all(promises)
      .then(function(results) {
        const filtered = results
          .filter(function(r) { return r.include; })
          .map(function(r) { return r.item; });
        resolve(filtered);
      })
      .catch(reject);
  });
}