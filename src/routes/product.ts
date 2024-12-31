import { NextFunction, Response, Router } from "express";
import * as TE from "fp-ts/TaskEither";
import { pipe } from "fp-ts/function";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/db/product";
import { DomainError } from "@/types/errors";
import { Product } from "@/types/product";
import StatusCode from "status-code-enum";

const router = Router();

const onLeft: (next: NextFunction) => (error: DomainError) => void =
  (next) => (error) =>
    next(error);

const onRight: (
  res: Response
) => (statusCode: StatusCode) => (p: Product | Product[]) => void =
  (res) => (statusCode) => (p) =>
    res.status(statusCode).json({ data: p });

router.get("/", (_req, res, next) =>
  pipe(
    getProducts(),
    TE.match(onLeft(next), onRight(res)(StatusCode.SuccessOK))
  )()
);

router.get("/:id", (req, res, next) =>
  pipe(
    getProduct(req.params.id),
    TE.match(onLeft(next), onRight(res)(StatusCode.SuccessOK))
  )()
);

router.post("/", (req, res, next) =>
  pipe(
    createProduct(req.body),
    TE.match(onLeft(next), onRight(res)(StatusCode.SuccessCreated))
  )()
);

router.put("/:id", (req, res, next) =>
  pipe(
    req.body,
    updateProduct(req.params.id),
    TE.match(onLeft(next), onRight(res)(StatusCode.SuccessOK))
  )()
);

router.delete("/:id", (req, res, next) =>
  pipe(
    deleteProduct(req.params.id),
    TE.match(onLeft(next), onRight(res)(StatusCode.SuccessOK))
  )()
);

export default router;
