import { Request, Response, NextFunction } from 'express';
import * as db from '../db';

// Extend Express Request to include user info
declare global {
  namespace Express {
    interface Request {
      user?: {
        user_id: string;
        user_name: string;
        email: string;
        roles: string[];
      };
    }
  }
}

// Middleware to check if user is authenticated
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get user_id from request header or body
    const userId = req.headers['x-user-id'] as string || req.body.user_id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Get user info
    const userResult = await db.query(
      'SELECT user_id, user_name, email, user_status FROM "USER" WHERE user_id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(401).json({ error: 'User not found' });
    }

    if (userResult.rows[0].user_status !== 'Active') {
      return res.status(403).json({ error: 'User account is not active' });
    }

    // Get user roles
    const rolesResult = await db.query(
      'SELECT role FROM USER_ROLE WHERE user_id = $1',
      [userId]
    );

    req.user = {
      ...userResult.rows[0],
      roles: rolesResult.rows.map((r: any) => r.role)
    };

    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Authentication failed' });
  }
};

// Middleware to check if user is admin
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  await authenticate(req, res, () => {
    if (!req.user || !req.user.roles.includes('Admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
};