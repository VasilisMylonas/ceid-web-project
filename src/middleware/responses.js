export function wrapResponse() {
  return (req, res, next) => {
    // Keep original res.json()
    const originalJsonMethod = res.json.bind(res);

    // Use (function) so that (this) is the same (res) that res.json() gets
    function customJsonMethod(payload) {
      const isSuccess = this.statusCode >= 200 && this.statusCode < 300;

      // Wrap the data
      const wrapped = {
        success: isSuccess,
        meta: {
          timestamp: new Date().toISOString(),
          path: req.originalUrl,
        },
      };

      if (isSuccess) {
        wrapped.data = payload;
      } else {
        wrapped.error = payload;
      }

      return originalJsonMethod(wrapped);
    }

    res.json = customJsonMethod;

    next();
  };
}
