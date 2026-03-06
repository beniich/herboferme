import { Request } from 'express';

export interface AuthenticatedRequest extends Omit<Request, 'user'> {
  user?: {
    id: string;
    _id?: string;
    role?: string;
    email?: string;
  };
  organizationId?: string;
  membership?: any;
}
