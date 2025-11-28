# TicketMatch

TicketMatch is a ticket exchange and resale platform focusing on secure ownership transfer and transaction consistency.

## Prerequisites

- Node.js (v14+)
- PostgreSQL (v12+)

## Setup Database

1. Create a PostgreSQL database named `ticketmatch`.
2. Run the initialization script to create tables and indexes:

```bash
psql -d ticketmatch -f server/database/init.sql
```

## Setup Backend (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Create a `.env` file in `server/` based on `.env.example`.
   - Ensure DB credentials match your local setup.
4. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`.

## Setup Frontend (Client)

1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the client:
   ```bash
   npm run dev
   ```
   Client runs on `http://localhost:5173`.

## Usage Flow

1. **Register**: Create two users (e.g., User A and User B) via `/register`.
2. **Login**: Login as User A.
3. **Events**: Browse events on the home page.
4. **Listings**: View active listings for an event.
5. **Trade**:
   - User B views a listing by User A.
   - User B clicks "Trade".
   - A trade request is created.
6. **Confirm**:
   - Both User A and User B go to their "Dashboard".
   - They see the pending trade and click "Confirm".
   - Once BOTH confirm, the transaction completes:
     - Tickets are transferred to User B.
     - Listing is closed.
     - Trade status becomes 'Completed'.
