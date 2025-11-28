import { Request, Response } from 'express';
import * as db from '../db';

export const createTrade = async (req: Request, res: Response) => {
  const { trade_id, listing_id, buyer_id, seller_id, ticket_ids } = req.body;
  // ticket_ids is an array of ticket_ids to be transferred

  try {
    await db.query('BEGIN');

    // 1. Create Trade
    await db.query(
      `INSERT INTO TRADE (trade_id, listing_id, status) VALUES ($1, $2, 'Pending')`,
      [trade_id, listing_id]
    );

    // 2. Add Participants
    await db.query(
      `INSERT INTO TRADE_PARTICIPANT (trade_id, user_id, role, confirmed) VALUES ($1, $2, 'Buyer', FALSE)`,
      [trade_id, buyer_id]
    );
    await db.query(
      `INSERT INTO TRADE_PARTICIPANT (trade_id, user_id, role, confirmed) VALUES ($1, $2, 'Seller', FALSE)`,
      [trade_id, seller_id]
    );

    // 3. Add Tickets to Trade
    // Assuming tickets go from seller to buyer for simplicity based on spec context
    for (const tid of ticket_ids) {
      await db.query(
        `INSERT INTO TRADE_TICKET (trade_id, ticket_id, from_user_id, to_user_id)
         VALUES ($1, $2, $3, $4)`,
        [trade_id, tid, seller_id, buyer_id]
      );
    }

    await db.query('COMMIT');
    res.status(201).json({ message: 'Trade created successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Failed to create trade' });
  }
};

export const confirmTrade = async (req: Request, res: Response) => {
  const { trade_id } = req.params;
  const { user_id } = req.body; // In real app, get from auth token

  try {
    // 1. Confirm for this user
    await db.query(
      `UPDATE TRADE_PARTICIPANT SET confirmed = TRUE, confirmed_at = NOW()
       WHERE trade_id = $1 AND user_id = $2`,
      [trade_id, user_id]
    );

    // 2. Check if all confirmed
    const pending = await db.query(
      `SELECT COUNT(*) as count FROM TRADE_PARTICIPANT
       WHERE trade_id = $1 AND confirmed = FALSE`,
      [trade_id]
    );

    if (parseInt(pending.rows[0].count) === 0) {
      // Execute Final Transaction
      await executeTradeCompletion(trade_id);
      res.json({ message: 'Trade confirmed and completed' });
    } else {
      res.json({ message: 'Trade confirmed. Waiting for other participants.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to confirm trade' });
  }
};

const executeTradeCompletion = async (trade_id: string) => {
  try {
    await db.query('BEGIN');

    // Double check locking trade
    await db.query('SELECT * FROM TRADE WHERE trade_id = $1 FOR UPDATE', [trade_id]);

    // Check confirmed again (safety)
    const check = await db.query(
        `SELECT COUNT(*) as count FROM TRADE_PARTICIPANT
         WHERE trade_id = $1 AND confirmed = FALSE`,
        [trade_id]
    );
    if (parseInt(check.rows[0].count) > 0) {
        throw new Error("Not all participants confirmed");
    }

    // Update Tickets
    // "UPDATE TICKET t SET owner_id = tt.to_user_id ..."
    // Postgres specific update join syntax
    await db.query(`
      UPDATE TICKET t
      SET owner_id = tt.to_user_id,
          status = 'Transferred',
          listing_id = NULL
      FROM TRADE_TICKET tt
      WHERE t.ticket_id = tt.ticket_id
        AND tt.trade_id = $1
    `, [trade_id]);

    // Close Listing
    await db.query(`
      UPDATE LISTING
      SET status = 'Closed'
      WHERE listing_id = (SELECT listing_id FROM TRADE WHERE trade_id = $1)
    `, [trade_id]);

    // Complete Trade
    await db.query(`
      UPDATE TRADE
      SET status = 'Completed', updated_at = NOW()
      WHERE trade_id = $1
    `, [trade_id]);

    await db.query('COMMIT');
  } catch (error) {
    await db.query('ROLLBACK');
    throw error;
  }
};

export const getTradeHistory = async (req: Request, res: Response) => {
    const { user_id } = req.params;
    try {
        const result = await db.query(`
            SELECT tp.trade_id, tp.role, t.status, t.created_at
            FROM TRADE_PARTICIPANT tp
            JOIN TRADE t ON t.trade_id = tp.trade_id
            WHERE tp.user_id = $1
            ORDER BY t.created_at DESC
        `, [user_id]);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch trade history' });
    }
}

export const getTradeDetails = async (req: Request, res: Response) => {
    const { trade_id } = req.params;
    try {
        const trade = await db.query(`SELECT * FROM TRADE WHERE trade_id = $1`, [trade_id]);
        const participants = await db.query(`SELECT * FROM TRADE_PARTICIPANT WHERE trade_id = $1`, [trade_id]);
        const tickets = await db.query(`SELECT * FROM TRADE_TICKET WHERE trade_id = $1`, [trade_id]);
        
        if (trade.rows.length === 0) {
            res.status(404).json({error: "Trade not found"});
            return;
        }

        res.json({
            ...trade.rows[0],
            participants: participants.rows,
            tickets: tickets.rows
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch trade details' });
    }
}

