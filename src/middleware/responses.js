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
    res.success = (data, meta = {}, status = StatusCodes.OK) => {
      res.set("X-Request-Id", req.context.requestId);
      res.set("X-Timestamp", req.context.timestamp);

      res.status(status);
      return res.json({
        success: true,
        data,
        meta: {
          path: req.context.path,
          ...meta,
        },
      });
    };

    // Add custom error function
    res.error = (message, status) => {
      res.set("X-Request-Id", req.context.requestId);
      res.set("X-Timestamp", req.context.timestamp);

      res.status(status);
      return res.json({
        success: false,
        error: { message },
        meta: {
          path: req.context.path,
        },
      });
    };

    next();
  };
}
