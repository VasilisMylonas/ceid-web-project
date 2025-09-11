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

// We check both the authorization header and the token cookie
// The header has priority over the cookie if both are present
export function extractTokenFromRequest(req) {
  const authHeader = req.headers["authorization"];
  const authCookie = req.cookies["token"];

  if (!authHeader && !authCookie) {
    return null;
  }

  // Give the the header priority over the cookie
  if (authHeader) {
    // The header is "Bearer <token>"
    const match = authHeader.match(/^Bearer\s+(\S+)$/);
    return match == null ? null : match[1]; // [0] is the full match, [1] is the first group
  }

  return authCookie;
}
