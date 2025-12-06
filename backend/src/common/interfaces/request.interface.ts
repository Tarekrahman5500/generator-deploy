import { Request } from 'express';

// Define the structure of the JWT payload we put on the request
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

// Extend the Express Request type
export interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}
