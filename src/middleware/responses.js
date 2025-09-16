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

    // Add custom success function
    res.success = (data, meta = {}, status = null) => {
      if (status) {
        res.status(status);
      } else {
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
            if (data === undefined) {
              res.status(StatusCodes.NO_CONTENT);
            } else {
              res.status(StatusCodes.OK);
            }
            break;
        }
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
    res.error = (message, status = StatusCodes.BAD_REQUEST) => {
      res.status(status);
      return originalJsonMethod({
        success: false,
        error: { message },
        meta: {
          ...req.context,
        },
      });
    };

    next();
  };
}
