import { DomainError, ErrorType } from "@/types/errors";
import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import StatusCode from "status-code-enum";
import * as O from "fp-ts/Option";
import * as R from "fp-ts/Record";
import { pipe } from "fp-ts/function";

const errorStatusMap: Record<ErrorType, StatusCode> = {
  ValidationError: StatusCode.ClientErrorBadRequest,
  RequestError: StatusCode.ClientErrorBadRequest,
  NotFoundError: StatusCode.ClientErrorNotFound,
  DatabaseError: StatusCode.ServerErrorInternal,
};

const defaultError = {
  type: "UnexpectedError",
  message: "An unexpected error occurred",
};

export const domainErrorHandler: ErrorRequestHandler = (
  error: DomainError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  pipe(
    errorStatusMap,
    R.lookup(error.type),
    O.match(
      () =>
        res
          .status(StatusCode.ServerErrorInternal)
          .json({ error: defaultError }),
      (statusCode) => res.status(statusCode).json({ error })
    )
  );
}
