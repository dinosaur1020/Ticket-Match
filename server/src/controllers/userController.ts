import { Request, Response } from 'express';
import * as db from '../db';

export const register = async (req: Request, res: Response) => {
  const { user_name, email, password, role = 'User' } = req.body;

  try {
    await db.query('BEGIN');

    // Generate user_id
    const userId = `USR${Date.now().toString().slice(-6)}`;

    // Insert User
    await db.query(
      'INSERT INTO "USER" (user_id, user_name, email, password) VALUES ($1, $2, $3, $4)',
      [userId, user_name, email, password]
    );

    // Insert Role
    await db.query(
      'INSERT INTO USER_ROLE (user_id, role) VALUES ($1, $2)',
      [userId, role]
    );

    await db.query('COMMIT');
    res.status(201).json({
      message: 'User registered successfully',
      user: { user_id: userId, user_name, email }
    });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Registration failed' });
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(
      'SELECT * FROM "USER" WHERE email = $1 AND password = $2',
      [email, password]
    );

    if (result.rows.length > 0) {
      const user = result.rows[0];
      res.json({ message: 'Login successful', user });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Login failed' });
  }
};

