import { Request, Response } from 'express';
import * as db from '../db';

// ========== USER MANAGEMENT ==========

// Get all users (admin only, excludes passwords)
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT u.user_id, u.user_name, u.email, u.user_status,
              COALESCE(
                json_agg(DISTINCT ur.role) FILTER (WHERE ur.role IS NOT NULL),
                '[]'::json
              ) as roles
       FROM "USER" u
       LEFT JOIN USER_ROLE ur ON u.user_id = ur.user_id
       GROUP BY u.user_id, u.user_name, u.email, u.user_status
       ORDER BY u.user_id`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Get user details (admin only, excludes password)
export const getUserDetails = async (req: Request, res: Response) => {
  const { userId } = req.params;
  try {
    const userResult = await db.query(
      `SELECT user_id, user_name, email, user_status 
       FROM "USER" 
       WHERE user_id = $1`,
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const rolesResult = await db.query(
      'SELECT role FROM USER_ROLE WHERE user_id = $1',
      [userId]
    );

    res.json({
      ...userResult.rows[0],
      roles: rolesResult.rows.map((r: any) => r.role)
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { roles } = req.body; // Array of role strings

  if (!Array.isArray(roles)) {
    return res.status(400).json({ error: 'Roles must be an array' });
  }

  try {
    await db.query('BEGIN');

    // Remove all existing roles
    await db.query('DELETE FROM USER_ROLE WHERE user_id = $1', [userId]);

    // Add new roles
    for (const role of roles) {
      await db.query(
        'INSERT INTO USER_ROLE (user_id, role) VALUES ($1, $2)',
        [userId, role]
      );
    }

    await db.query('COMMIT');
    res.json({ message: 'User roles updated successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Failed to update user roles' });
  }
};

// Update user status
export const updateUserStatus = async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { user_status } = req.body;

  if (!['Active', 'Inactive', 'Suspended'].includes(user_status)) {
    return res.status(400).json({ error: 'Invalid user status' });
  }

  try {
    await db.query(
      'UPDATE "USER" SET user_status = $1 WHERE user_id = $2',
      [user_status, userId]
    );
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// ========== LISTING MANAGEMENT ==========

// Get all listings (including closed ones)
export const getAllListings = async (req: Request, res: Response) => {
  try {
    const result = await db.query(
      `SELECT l.*, u.user_name as owner_name, e.event_name
       FROM LISTING l
       LEFT JOIN "USER" u ON l.owner_id = u.user_id
       LEFT JOIN EVENT e ON l.event_id = e.event_id
       ORDER BY l.event_date DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch listings' });
  }
};

// Update listing
export const updateListing = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  const { status, content, type } = req.body;

  try {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (status !== undefined) {
      updates.push(`status = $${paramCount++}`);
      values.push(status);
    }
    if (content !== undefined) {
      updates.push(`content = $${paramCount++}`);
      values.push(content);
    }
    if (type !== undefined) {
      updates.push(`type = $${paramCount++}`);
      values.push(type);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    values.push(listingId);
    await db.query(
      `UPDATE LISTING SET ${updates.join(', ')} WHERE listing_id = $${paramCount}`,
      values
    );

    res.json({ message: 'Listing updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update listing' });
  }
};

// Delete listing
export const deleteListing = async (req: Request, res: Response) => {
  const { listingId } = req.params;
  try {
    await db.query('DELETE FROM LISTING WHERE listing_id = $1', [listingId]);
    res.json({ message: 'Listing deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete listing' });
  }
};

// ========== EVENT MANAGEMENT ==========

// Create event (admin only)
export const createEvent = async (req: Request, res: Response) => {
  const { event_id, event_name, venue, event_times, performers } = req.body;

  if (!event_id || !event_name) {
    return res.status(400).json({ error: 'event_id and event_name are required' });
  }

  try {
    await db.query('BEGIN');

    // Insert event
    await db.query(
      'INSERT INTO EVENT (event_id, event_name, venue) VALUES ($1, $2, $3)',
      [event_id, event_name, venue]
    );

    // Insert event times if provided
    if (Array.isArray(event_times)) {
      for (const event_time of event_times) {
        await db.query(
          'INSERT INTO EVENT_TIME (event_id, event_time) VALUES ($1, $2)',
          [event_id, event_time]
        );
      }
    }

    // Insert performers if provided
    if (Array.isArray(performers)) {
      for (const performer of performers) {
        await db.query(
          'INSERT INTO PERFORMER (event_id, performer) VALUES ($1, $2)',
          [event_id, performer]
        );
      }
    }

    await db.query('COMMIT');
    res.status(201).json({ message: 'Event created successfully' });
  } catch (error) {
    await db.query('ROLLBACK');
    console.error(error);
    res.status(500).json({ error: 'Failed to create event' });
  }
};

// Delete event (admin only)
export const deleteEvent = async (req: Request, res: Response) => {
  const { eventId } = req.params;

  try {
    await db.query('BEGIN');

    const ticketResult = await db.query(
      'SELECT ticket_id FROM TICKET WHERE event_id = $1',
      [eventId]
    );
    const ticketIds = ticketResult.rows.map((row: any) => row.ticket_id);

    if (ticketIds.length > 0) {
      await db.query(
        'DELETE FROM trade_ticket WHERE ticket_id = ANY($1)',
        [ticketIds]
      );
    }

    const listingResult = await db.query(
      'SELECT listing_id FROM LISTING WHERE event_id = $1',
      [eventId]
    );
    const listingIds = listingResult.rows.map((row: any) => row.listing_id);

    if (listingIds.length > 0) {
      await db.query(
        'DELETE FROM trade_ticket WHERE trade_id IN (SELECT trade_id FROM TRADE WHERE listing_id = ANY($1))',
        [listingIds]
      );
      await db.query(
        'DELETE FROM trade_participant WHERE trade_id IN (SELECT trade_id FROM TRADE WHERE listing_id = ANY($1))',
        [listingIds]
      );
      await db.query(
        'DELETE FROM TRADE WHERE listing_id = ANY($1)',
        [listingIds]
      );
    }

    await db.query('DELETE FROM TICKET WHERE event_id = $1', [eventId]);
    await db.query('DELETE FROM LISTING WHERE event_id = $1', [eventId]);
    await db.query('DELETE FROM EVENT_TIME WHERE event_id = $1', [eventId]);
    await db.query('DELETE FROM PERFORMER WHERE event_id = $1', [eventId]);
    const deleteEventResult = await db.query(
      'DELETE FROM EVENT WHERE event_id = $1',
      [eventId]
    );

    await db.query('COMMIT');

    if (deleteEventResult.rowCount === 0) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    await db.query('ROLLBACK');
    console.error(error);

    if (error.code === '23503') {
      return res.status(409).json({
        error: 'Event cannot be deleted because related data still exists'
      });
    }

    res.status(500).json({ error: 'Failed to delete event' });
  }
};