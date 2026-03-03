import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';

export const validator = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.error('[Validator] Validation failed:', JSON.stringify(errors.array(), null, 2));
        return res.status(422).json({ errors: errors.array() });
    }
    next();
};
