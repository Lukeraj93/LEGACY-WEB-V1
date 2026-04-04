function readRuntimeCache(store, key, ttlMs) {
  const entry = store.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() - Number(entry.createdAt || 0) > Number(ttlMs || 0)) {
    store.delete(key);
    return null;
  }

  return entry.value;
}

function writeRuntimeCache(store, key, value) {
  store.set(key, {
    value,
    createdAt: Date.now(),
  });
  return value;
}

async function getOrSetRuntimeCache(store, key, ttlMs, loader) {
  const cached = readRuntimeCache(store, key, ttlMs);
  if (cached !== null) {
    return cached;
  }

  const value = await loader();
  return writeRuntimeCache(store, key, value);
}

module.exports = {
  getOrSetRuntimeCache,
  readRuntimeCache,
  writeRuntimeCache,
};
