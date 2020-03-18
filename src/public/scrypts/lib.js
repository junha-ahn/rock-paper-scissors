function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
const hasValue = value => value !== undefined && value !== null && value !== ''

const _ = {
  forEach: (iter, f) => {
    for (const a of iter) {
      f(a)
    }
  },
  map: (iter, f) => {
    const res = [];
    for (const a of iter) {
      res.push(f(a))
    }
    return res;
  }
}