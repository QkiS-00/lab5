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