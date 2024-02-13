import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";

// check that all validations passed
export const checkValidation = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
}

export const auth = (req: Request, res: Response, next: NextFunction) => {
    res.locals.user = jwt.verify(req.headers.authorization as string, process.env.JWT_SECRET as string)
    next();
}