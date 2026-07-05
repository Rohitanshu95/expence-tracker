// Defense-in-depth against NoSQL operator injection: recursively strip any keys
// that begin with `$` (Mongo operators) or contain `.` (dotted-path targeting)
// from request bodies and params before they reach any query.
function scrub(obj) {
  if (Array.isArray(obj)) {
    obj.forEach(scrub);
    return;
  }
  if (obj && typeof obj === 'object') {
    for (const key of Object.keys(obj)) {
      if (key.startsWith('$') || key.includes('.')) {
        delete obj[key];
      } else {
        scrub(obj[key]);
      }
    }
  }
}

const sanitize = (req, res, next) => {
  if (req.body) scrub(req.body);
  if (req.params) scrub(req.params);
  next();
};

module.exports = sanitize;
