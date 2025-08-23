export function omit(obj, ...props) {
  const result = { ...obj };
  props.forEach(function (prop) {
    delete result[prop];
  });
  return result;
}

// Hack because req.query is a getter
export function patchQuery(req, query) {
  return {
    ...req,
    query: {
      ...req.query,
      ...query,
    },
  };
}
