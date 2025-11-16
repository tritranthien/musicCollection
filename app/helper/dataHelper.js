/**
 * So sánh sâu giữa hai giá trị (deep compare)
 * @param {*} a 
 * @param {*} b 
 * @returns {boolean}
 */
export function deepEqual(a, b) {
  // Trường hợp giống hệt nhau (bao gồm cả NaN)
  if (Object.is(a, b)) return true;

  // Nếu một trong hai không phải object hoặc null => so sánh bình thường
  if (typeof a !== 'object' || a === null ||
      typeof b !== 'object' || b === null) {
    return false;
  }

  // Nếu là Array
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  // Nếu một là array, một không phải => false
  if (Array.isArray(a) !== Array.isArray(b)) return false;

  // So sánh object
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual(a[key], b[key])) return false;
  }

  return true;
}

