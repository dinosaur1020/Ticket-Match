# TicketMatch

TicketMatch is a ticket exchange and resale platform focusing on secure ownership transfer and transaction consistency.

## Prerequisites

- Node.js (v16+ recommended)
- PostgreSQL (v12+)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/dinosaur1020/Ticket-Match.git
cd Ticket-Match
```

### 2. Setup Database

1. Create a PostgreSQL database named `ticketmatch`.
2. **Restore the database from dump:**
   ```bash
   # Restore from dump (includes schema + all data)
   cd server && npm run db:restore
   ```

   **For maintainers: Create a new dump**
   ```bash
   cd server && npm run db:dump
   ```

### 3. Setup Backend (Server)

1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Copy the example environment file and update with your database credentials:

   ```bash
   cp .env.example .env
   ```

   Then edit `.env` with your actual database credentials.

4. Start the server:
   ```bash
   npm run dev
   ```
   Server runs on `http://localhost:3000`.

### 4. Setup Frontend (Client)

1. Open a new terminal and navigate to the client directory:
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
   Client runs on `http://localhost:5173` (or `http://localhost:5174` if 5173 is busy).

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
