import { Request, Response, NextFunction } from 'express';

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = (req as any).user;
    if (!roles.includes(role)) {
      return res.status(403).json({ message: 'Access denied' });
    }
    next();
  };
};
