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

      return res.json({
        success: true,
        data,
        meta: {
          ...req.context,
          ...meta,
        },
      });
    };

    // Add custom error function
    res.error = (message, status) => {
      res.status(status);
      return res.json({
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
