import { Request, Response } from 'express';
import * as db from '../db';

export const createTicket = async (req: Request, res: Response) => {
  const { ticket_id, event_id, owner_id, seat_area, seat_number, price } = req.body;
  try {
    await db.query(
      `INSERT INTO TICKET (ticket_id, event_id, owner_id, seat_area, seat_number, price)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [ticket_id, event_id, owner_id, seat_area, seat_number, price]
    );
    res.status(201).json({ message: 'Ticket created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create ticket' });
  }
};

export const getMyTickets = async (req: Request, res: Response) => {
  const { user_id } = req.params;
  try {
    const result = await db.query('SELECT * FROM TICKET WHERE owner_id = $1', [user_id]);
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch tickets' });
  }
};

export const getTicketsByListing = async (req: Request, res: Response) => {
    const { listing_id } = req.params;
    try {
        const result = await db.query('SELECT * FROM TICKET WHERE listing_id = $1', [listing_id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch listing tickets' });
    }
}
