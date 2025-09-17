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
      res.status(status);
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
