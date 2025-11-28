const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'ticketmatch',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

const query = (text, params) => pool.query(text, params);

async function seedDatabase() {
  try {
    console.log('Starting database seeding...');

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'database', 'init.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Creating tables...');
    await query(schema);
    console.log('Tables created successfully');

    // Insert users
    console.log('Inserting users...');
    const users = [
      { user_id: 'USR001', user_name: 'John Smith', email: 'john.smith@email.com', password: 'password123', user_status: 'Active' },
      { user_id: 'USR002', user_name: 'Sarah Johnson', email: 'sarah.johnson@email.com', password: 'password123', user_status: 'Active' },
      { user_id: 'USR003', user_name: 'Mike Chen', email: 'mike.chen@email.com', password: 'password123', user_status: 'Active' },
      { user_id: 'USR004', user_name: 'Emma Davis', email: 'emma.davis@email.com', password: 'password123', user_status: 'Active' },
      { user_id: 'USR005', user_name: 'Alex Rodriguez', email: 'alex.rodriguez@email.com', password: 'password123', user_status: 'Active' },
      { user_id: 'USR006', user_name: 'Lisa Wang', email: 'lisa.wang@email.com', password: 'password123', user_status: 'Active' },
      { user_id: 'USR007', user_name: 'David Brown', email: 'david.brown@email.com', password: 'password123', user_status: 'Active' },
      { user_id: 'USR008', user_name: 'Maria Garcia', email: 'maria.garcia@email.com', password: 'password123', user_status: 'Active' }
    ];

    for (const user of users) {
      await query(
        'INSERT INTO "USER" (user_id, user_name, email, password, user_status) VALUES ($1, $2, $3, $4, $5)',
        [user.user_id, user.user_name, user.email, user.password, user.user_status]
      );
    }

    // Insert user roles
    console.log('Inserting user roles...');
    const userRoles = [
      ['USR001', 'Buyer'], ['USR001', 'Seller'],
      ['USR002', 'Seller'], ['USR002', 'Exchanger'],
      ['USR003', 'Buyer'], ['USR003', 'Exchanger'],
      ['USR004', 'Seller'],
      ['USR005', 'Buyer'], ['USR005', 'Seller'], ['USR005', 'Exchanger'],
      ['USR006', 'Buyer'],
      ['USR007', 'Seller'], ['USR007', 'Exchanger'],
      ['USR008', 'Buyer'], ['USR008', 'Seller']
    ];

    for (const [userId, role] of userRoles) {
      await query('INSERT INTO USER_ROLE (user_id, role) VALUES ($1, $2)', [userId, role]);
    }

    // Insert events
    console.log('Inserting events...');
    const events = [
      { event_id: 'EVT001', event_name: 'Taylor Swift - Eras Tour', venue: 'SoFi Stadium' },
      { event_id: 'EVT002', event_name: 'Los Angeles Lakers vs Golden State Warriors', venue: 'Crypto.com Arena' },
      { event_id: 'EVT003', event_name: 'Metallica World Tour', venue: 'Hollywood Bowl' },
      { event_id: 'EVT004', event_name: 'Hamilton: An American Musical', venue: 'Ahmanson Theatre' },
      { event_id: 'EVT005', event_name: 'Coachella Music Festival', venue: 'Empire Polo Club' },
      { event_id: 'EVT006', event_name: 'Los Angeles Dodgers vs San Francisco Giants', venue: 'Dodger Stadium' }
    ];

    for (const event of events) {
      await query(
        'INSERT INTO EVENT (event_id, event_name, venue) VALUES ($1, $2, $3)',
        [event.event_id, event.event_name, event.venue]
      );
    }

    // Insert event times
    console.log('Inserting event times...');
    const currentYear = new Date().getFullYear() + 1; // Next year to ensure future dates
    const eventTimes = [
      ['EVT001', `${currentYear}-03-15 19:00:00+00`],
      ['EVT001', `${currentYear}-03-16 19:00:00+00`],
      ['EVT002', `${currentYear}-02-20 19:30:00+00`],
      ['EVT003', `${currentYear}-04-10 20:00:00+00`],
      ['EVT004', `${currentYear}-03-05 20:00:00+00`],
      ['EVT004', `${currentYear}-03-06 20:00:00+00`],
      ['EVT005', `${currentYear}-04-12 12:00:00+00`],
      ['EVT005', `${currentYear}-04-13 12:00:00+00`],
      ['EVT006', `${currentYear}-05-01 19:10:00+00`]
    ];

    for (const [eventId, eventTime] of eventTimes) {
      await query('INSERT INTO EVENT_TIME (event_id, event_time) VALUES ($1, $2)', [eventId, eventTime]);
    }

    // Insert performers
    console.log('Inserting performers...');
    const performers = [
      ['EVT001', 'Taylor Swift'],
      ['EVT002', 'Los Angeles Lakers'],
      ['EVT002', 'Golden State Warriors'],
      ['EVT003', 'Metallica'],
      ['EVT004', 'Hamilton Cast'],
      ['EVT005', 'Various Artists'],
      ['EVT005', 'Lana Del Rey'],
      ['EVT005', 'Harry Styles'],
      ['EVT006', 'Los Angeles Dodgers'],
      ['EVT006', 'San Francisco Giants']
    ];

    for (const [eventId, performer] of performers) {
      await query('INSERT INTO PERFORMER (event_id, performer) VALUES ($1, $2)', [eventId, performer]);
    }

    // Insert listings
    console.log('Inserting listings...');
    const currentYear = new Date().getFullYear() + 1; // Next year to ensure future dates
    const listings = [
      { listing_id: 'LST001', owner_id: 'USR002', event_id: 'EVT001', event_date: `${currentYear}-03-15`, content: 'Looking for floor seats near stage', status: 'Open', type: 'Wanted' },
      { listing_id: 'LST002', owner_id: 'USR004', event_id: 'EVT001', event_date: `${currentYear}-03-16`, content: 'Have 2 premium seats to trade for different date', status: 'Open', type: 'Trade' },
      { listing_id: 'LST003', owner_id: 'USR005', event_id: 'EVT002', event_date: `${currentYear}-02-20`, content: 'Selling 4 center court tickets', status: 'Open', type: 'Sale' },
      { listing_id: 'LST004', owner_id: 'USR007', event_id: 'EVT003', event_date: `${currentYear}-04-10`, content: 'Premium pavilion seats available', status: 'Open', type: 'Sale' },
      { listing_id: 'LST005', owner_id: 'USR002', event_id: 'EVT004', event_date: `${currentYear}-03-05`, content: 'Need orchestra seats for Hamilton', status: 'Open', type: 'Wanted' },
      { listing_id: 'LST006', owner_id: 'USR008', event_id: 'EVT005', event_date: `${currentYear}-04-12`, content: 'Weekend pass for Coachella', status: 'Open', type: 'Sale' },
      { listing_id: 'LST007', owner_id: 'USR003', event_id: 'EVT006', event_date: `${currentYear}-05-01`, content: 'Field level tickets to trade', status: 'Open', type: 'Trade' }
    ];

    for (const listing of listings) {
      await query(
        'INSERT INTO LISTING (listing_id, owner_id, event_id, event_date, content, status, type) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        [listing.listing_id, listing.owner_id, listing.event_id, listing.event_date, listing.content, listing.status, listing.type]
      );
    }

    // Insert tickets
    console.log('Inserting tickets...');
    const tickets = [
      { ticket_id: 'TKT001', event_id: 'EVT001', owner_id: 'USR002', seat_area: 'Floor', seat_number: 'A1-A2', price: 450.00, status: 'Active', listing_id: 'LST002' },
      { ticket_id: 'TKT002', event_id: 'EVT001', owner_id: 'USR002', seat_area: 'Floor', seat_number: 'A3-A4', price: 450.00, status: 'Active', listing_id: 'LST002' },
      { ticket_id: 'TKT003', event_id: 'EVT002', owner_id: 'USR005', seat_area: 'Center Court', seat_number: '101-104', price: 280.00, status: 'Active', listing_id: 'LST003' },
      { ticket_id: 'TKT004', event_id: 'EVT002', owner_id: 'USR005', seat_area: 'Center Court', seat_number: '105-108', price: 280.00, status: 'Active', listing_id: 'LST003' },
      { ticket_id: 'TKT005', event_id: 'EVT003', owner_id: 'USR007', seat_area: 'Pavilion', seat_number: 'B12-B13', price: 120.00, status: 'Active', listing_id: 'LST004' },
      { ticket_id: 'TKT006', event_id: 'EVT005', owner_id: 'USR008', seat_area: 'General Admission', seat_number: 'GA-001', price: 450.00, status: 'Active', listing_id: 'LST006' },
      { ticket_id: 'TKT007', event_id: 'EVT006', owner_id: 'USR003', seat_area: 'Field Level', seat_number: '12-13', price: 180.00, status: 'Active', listing_id: 'LST007' },
      { ticket_id: 'TKT008', event_id: 'EVT004', owner_id: 'USR001', seat_area: 'Orchestra', seat_number: 'O15', price: null, status: 'Active', listing_id: null },
      { ticket_id: 'TKT009', event_id: 'EVT001', owner_id: 'USR004', seat_area: 'Mezzanine', seat_number: 'M5-M6', price: 320.00, status: 'Active', listing_id: null },
      { ticket_id: 'TKT010', event_id: 'EVT003', owner_id: 'USR006', seat_area: 'Lawn', seat_number: 'LA-45', price: 75.00, status: 'Active', listing_id: null }
    ];

    for (const ticket of tickets) {
      await query(
        'INSERT INTO TICKET (ticket_id, event_id, owner_id, seat_area, seat_number, price, status, listing_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
        [ticket.ticket_id, ticket.event_id, ticket.owner_id, ticket.seat_area, ticket.seat_number, ticket.price, ticket.status, ticket.listing_id]
      );
    }

    // Insert trades
    console.log('Inserting trades...');
    const currentYear = new Date().getFullYear();
    const trades = [
      { trade_id: 'TRD001', listing_id: 'LST003', status: 'Pending', created_at: `${currentYear}-11-15 10:30:00+00`, updated_at: null },
      { trade_id: 'TRD002', listing_id: 'LST007', status: 'Completed', created_at: `${currentYear}-11-10 14:20:00+00`, updated_at: `${currentYear}-11-12 16:45:00+00` },
      { trade_id: 'TRD003', listing_id: 'LST002', status: 'Pending', created_at: `${currentYear}-11-20 09:15:00+00`, updated_at: null }
    ];

    for (const trade of trades) {
      await query(
        'INSERT INTO TRADE (trade_id, listing_id, status, created_at, updated_at) VALUES ($1, $2, $3, $4, $5)',
        [trade.trade_id, trade.listing_id, trade.status, trade.created_at, trade.updated_at]
      );
    }

    // Insert trade participants
    console.log('Inserting trade participants...');
    const currentYear = new Date().getFullYear();
    const tradeParticipants = [
      ['TRD001', 'USR005', 'Seller', true, `${currentYear}-11-15 10:35:00+00`], // Seller offering Lakers tickets
      ['TRD001', 'USR001', 'Buyer', false, null], // Buyer interested
      ['TRD002', 'USR003', 'Exchanger', true, `${currentYear}-11-10 14:25:00+00`], // Person trading Dodgers tickets
      ['TRD002', 'USR007', 'Exchanger', true, `${currentYear}-11-11 11:30:00+00`], // Person receiving Dodgers tickets
      ['TRD003', 'USR002', 'Seller', true, `${currentYear}-11-20 09:20:00+00`], // Seller offering Taylor Swift tickets
      ['TRD003', 'USR006', 'Buyer', false, null] // Buyer interested
    ];

    for (const [tradeId, userId, role, confirmed, confirmedAt] of tradeParticipants) {
      await query(
        'INSERT INTO TRADE_PARTICIPANT (trade_id, user_id, role, confirmed, confirmed_at) VALUES ($1, $2, $3, $4, $5)',
        [tradeId, userId, role, confirmed, confirmedAt]
      );
    }

    // Insert trade tickets
    console.log('Inserting trade tickets...');
    const tradeTickets = [
      ['TRD001', 'TKT003', 'USR005', 'USR001'], // Lakers tickets from seller to buyer
      ['TRD001', 'TKT004', 'USR005', 'USR001'],
      ['TRD002', 'TKT007', 'USR003', 'USR007'], // Dodgers ticket exchange
      ['TRD003', 'TKT001', 'USR002', 'USR006'], // Taylor Swift tickets
      ['TRD003', 'TKT002', 'USR002', 'USR006']
    ];

    for (const [tradeId, ticketId, fromUserId, toUserId] of tradeTickets) {
      await query(
        'INSERT INTO TRADE_TICKET (trade_id, ticket_id, from_user_id, to_user_id) VALUES ($1, $2, $3, $4)',
        [tradeId, ticketId, fromUserId, toUserId]
      );
    }

    console.log('Database seeded successfully with realistic test data!');
    console.log('\nSummary of seeded data:');
    console.log('- 8 users with various roles');
    console.log('- 6 events (concerts, sports, theater, festival)');
    console.log('- 7 listings (wanted, for sale, trade offers)');
    console.log('- 10 tickets with different seat types and prices');
    console.log('- 3 trades in various states (pending, completed)');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    process.exit();
  }
}

seedDatabase();
