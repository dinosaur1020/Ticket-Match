import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint (fast response)
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req, res) => {
  res.send('TicketMatch API is running');
});

// Import routes (lazy load to speed up startup)
import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';
import listingRoutes from './routes/listingRoutes';
import ticketRoutes from './routes/ticketRoutes';
import tradeRoutes from './routes/tradeRoutes';

// API routes
app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/trades', tradeRoutes);

// Start server
const server = app.listen(port, () => {
  console.log(`🚀 Server is running on port ${port}`);
  console.log(`📊 Health check: http://localhost:${port}/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

