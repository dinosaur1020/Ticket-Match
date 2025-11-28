import { Request, Response } from 'express';
import * as db from '../db';

export const getListings = async (req: Request, res: Response) => {
  const { event_id } = req.query;
  
  if (!event_id) {
    // Return all open listings if no event specified (optional, but good for exploration)
    try {
        const result = await db.query(
            "SELECT * FROM LISTING WHERE status = 'Open' ORDER BY event_date"
        );
        res.json(result.rows);
        return;
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch listings' });
        return;
    }
  }

  // Optimized query from spec
  try {
    const result = await db.query(
      `SELECT listing_id, event_id, event_date, status, owner_id, content, type
       FROM LISTING
       WHERE event_id = $1
         AND status = 'Open'
         AND event_date >= CURRENT_DATE
       ORDER BY event_date`,
      [event_id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

export const createListing = async (req: Request, res: Response) => {
  const { listing_id, owner_id, event_id, event_date, content, type } = req.body;
  try {
    await db.query(
      `INSERT INTO LISTING (listing_id, owner_id, event_id, event_date, content, type)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [listing_id, owner_id, event_id, event_date, content, type]
    );
    res.status(201).json({ message: 'Listing created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to create listing' });
  }
};

export const getListingDetails = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    // Get listing details
    const listingResult = await db.query(
      'SELECT * FROM LISTING WHERE listing_id = $1',
      [id]
    );

    if (listingResult.rows.length === 0) {
      res.status(404).json({ error: 'Listing not found' });
      return;
    }

    const listing = listingResult.rows[0];

    // Get event details
    const eventResult = await db.query(
      'SELECT * FROM EVENT WHERE event_id = $1',
      [listing.event_id]
    );

    // Get event times
    const timesResult = await db.query(
      'SELECT * FROM EVENT_TIME WHERE event_id = $1',
      [listing.event_id]
    );

    // Get performers
    const performersResult = await db.query(
      'SELECT * FROM PERFORMER WHERE event_id = $1',
      [listing.event_id]
    );

    // Get tickets for this listing
    const ticketsResult = await db.query(
      'SELECT * FROM TICKET WHERE listing_id = $1',
      [id]
    );

    // Get seller info
    const sellerResult = await db.query(
      'SELECT user_id, user_name, email FROM "USER" WHERE user_id = $1',
      [listing.owner_id]
    );

    res.json({
      listing,
      event: eventResult.rows[0],
      times: timesResult.rows,
      performers: performersResult.rows,
      tickets: ticketsResult.rows,
      seller: sellerResult.rows[0]
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listing details' });
  }
};

