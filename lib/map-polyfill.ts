declare global {
  interface Map<K, V> {
    getOrInsertComputed?(key: K, callback: (key: K) => V): V;
  }
}

/**
 * pdfjs-dist (5.6.205) calls Map.prototype.getOrInsertComputed, a Map
 * upsert method that Chrome ships but Firefox doesn't yet — that throws
 * "getOrInsertComputed is not a function" mid-parse on Firefox and aborts
 * the whole convert/read flow. Patch it in before any pdfjs-dist code runs.
 */
if (typeof Map.prototype.getOrInsertComputed !== "function") {
  Map.prototype.getOrInsertComputed = function <K, V>(
    this: Map<K, V>,
    key: K,
    callback: (key: K) => V,
  ): V {
    if (this.has(key)) return this.get(key) as V;
    const value = callback(key);
    this.set(key, value);
    return value;
  };
}

export {};
