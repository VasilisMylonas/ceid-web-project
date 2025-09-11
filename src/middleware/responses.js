import { StatusCodes } from "http-status-codes";
import { randomUUID } from "crypto";

export function wrapResponse() {
  return (req, res, next) => {
    // Add context
    req.context = {
      requestId: randomUUID(),
      timestamp: new Date().toISOString(),
      path: req.originalUrl,
    };

    // Keep original res.json()
    const originalJsonMethod = res.json.bind(res);

    // Use (function) so that (this) is the same (res) that res.json() gets

    // Add custom success function
    res.success = function (data, meta = {}) {
      switch (req.method) {
        case "DELETE":
          res.status(StatusCodes.NO_CONTENT);
          break;
        case "GET":
          res.status(StatusCodes.OK);
          break;
        case "POST":
          // TODO: OK or CREATED prefer CREATED
          res.status(StatusCodes.CREATED);
          break;
        default: // PUT, PATCH
          // TODO: OK or NO_CONTENT prefer OK
          res.status(StatusCodes.OK);
          break;
      }

      return originalJsonMethod({
        success: true,
        data,
        meta: {
          ...req.context,
          ...meta,
        },
      });
    };

    // Add custom error function
    // BAD_REQUEST, NOT_FOUND, INTERNAL_SERVER_ERROR, UNAUTHORIZED, FORBIDDEN, CONFLICT, NOT_IMPLEMENTED
    res.error = function (
      message,
      status = StatusCodes.BAD_REQUEST,
      meta = {}
    ) {
      res.status(status);
      return originalJsonMethod({
        success: false,
        error: { message },
        meta: {
          ...req.context,
          ...meta,
        },
      });
    };

    res.json = function (payload = {}) {
      if (this.statusCode === StatusCodes.NO_CONTENT) {
        // Respect NO_CONTENT
        return originalJsonMethod();
      }

      const isSuccess = this.statusCode >= 200 && this.statusCode < 300;

      if (isSuccess) {
        return res.success(payload);
      }

      return res.error(payload);
    };

    next();
  };
}
