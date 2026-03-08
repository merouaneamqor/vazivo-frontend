/* Patch performance.measure to avoid Turbopack/React "negative time stamp" (vercel/next.js#86060) */
(function () {
  var p = typeof performance !== "undefined" ? performance : null;
  if (!p || typeof p.measure !== "function" || p._measurePatched) return;
  p._measurePatched = 1;
  var o = p.measure.bind(p);
  p.measure = function () {
    try {
      return o.apply(p, arguments);
    } catch (e) {
      return;
    }
  };
})();
