import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import StatusCode from "status-code-enum";
import { DomainError } from "@/types/errors";

export const parsingJsonErrorHandler: ErrorRequestHandler = (
  error: any,
  _req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (error.type === "entity.parse.failed") {
    const error: DomainError = {
      type: "RequestError",
      message: "Invalid JSON format. Please check your JSON syntax.",
    };

    res.status(StatusCode.ClientErrorBadRequest).json({
      error,
    });
  } else {
    next(error);
  }
};
