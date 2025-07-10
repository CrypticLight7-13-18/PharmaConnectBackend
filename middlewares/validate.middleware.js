import { ZodError } from "zod";
import AppError from "../utils/app-error.utils.js";

/**
 * Generates an Express middleware that validates req.body (default) against a Zod schema.
 * On success, the parsed data is stored in req.validated and next() is called.
 * On failure, forwards an AppError(400) with aggregated messages.
 *
 * @param {import('zod').ZodSchema|Object} schema - Zod schema or object {body, query, params}
 * @param {('body'|'query'|'params')} [target='body'] - Deprecated; prefer object param.
 */
export const validate = (schema, target = "body") => {
  return (req, res, next) => {
    console.log(req[target])
    try {
      if (schema && typeof schema.safeParse === "function") {
        // console.log(schema)
        const result = schema.safeParse(req[target]);
        console.log(result)
        if (!result.success) {
          const msg = result.error.errors.map((e) => e.message).join("; ");
          // console.log(msg)
          return next(new AppError(msg, 400));
        }
        // attach parsed data
        req.validated = result.data;
      } else {
        // handle object style { body, query, params }
        for (const key of ["body", "query", "params"]) {
          if (!schema[key]) continue;
          const resParse = schema[key].safeParse(req[key]);
          if (!resParse.success) {
            const msg = resParse.error.errors.map((e) => e.message).join("; ");
            return next(new AppError(msg, 400));
          }
          req[`validated_${key}`] = resParse.data;
        }
      }
      next();
    } catch (err) {
      if (err instanceof ZodError)
        return next(new AppError("Invalid request payload", 400));
      next(err);
    }
  };
};
