import { Request, Response } from 'express';
import * as db from '../db';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const result = await db.query('SELECT * FROM EVENT');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
};

export const getEventDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const event = await db.query('SELECT * FROM EVENT WHERE event_id = $1', [id]);
    const times = await db.query('SELECT * FROM EVENT_TIME WHERE event_id = $1', [id]);
    const performers = await db.query('SELECT * FROM PERFORMER WHERE event_id = $1', [id]);
    
    if (event.rows.length === 0) {
      res.status(404).json({ error: 'Event not found' });
      return; // Ensure we return here
    }
    
    res.json({
      ...event.rows[0],
      times: times.rows,
      performers: performers.rows
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch event details' });
  }
};

