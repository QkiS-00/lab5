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