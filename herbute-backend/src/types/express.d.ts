import { JwtPayload } from '../middleware/security';

declare global {
  namespace Express {
    interface Request {
      id?: string;
      user?: JwtPayload;
      organizationId?: string;
      membership?: any;
      apiKey?: any;
    }
  }
}
