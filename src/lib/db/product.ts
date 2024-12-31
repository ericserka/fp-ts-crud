import * as TE from "fp-ts/TaskEither";
import { handlePrismaError, prisma } from "@/lib/prisma";
import { pipe } from "fp-ts/function";
import {
  validateCreateProduct,
  validateUpdateProduct,
} from "@/lib/validation/product";
import { Product } from "@/types/product";
import { DomainError } from "@/types/errors";

export const getProducts = (): TE.TaskEither<DomainError, Product[]> =>
  TE.tryCatch(() => prisma.product.findMany(), handlePrismaError);

export const getProduct = (id: string): TE.TaskEither<DomainError, Product> =>
  TE.tryCatch(
    () => prisma.product.findUniqueOrThrow({ where: { id } }),
    handlePrismaError
  );

export const createProduct = (
  input: unknown
): TE.TaskEither<DomainError, Product> =>
  pipe(
    validateCreateProduct(input),
    TE.fromEither,
    TE.flatMap((validInput) =>
      TE.tryCatch(
        () => prisma.product.create({ data: validInput }),
        handlePrismaError
      )
    )
  );

export const updateProduct: (
  id: string
) => (input: unknown) => TE.TaskEither<DomainError, Product> =
  (id: string) => (input: unknown) =>
    pipe(
      validateUpdateProduct(input),
      TE.fromEither,
      TE.flatMap((validInput) =>
        TE.tryCatch(
          () => prisma.product.update({ where: { id }, data: validInput }),
          handlePrismaError
        )
      )
    );

export const deleteProduct = (
  id: string
): TE.TaskEither<DomainError, Product> =>
  TE.tryCatch(
    () => prisma.product.delete({ where: { id } }),
    handlePrismaError
  );

