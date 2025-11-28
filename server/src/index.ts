import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

import userRoutes from './routes/userRoutes';
import eventRoutes from './routes/eventRoutes';

import listingRoutes from './routes/listingRoutes';

import ticketRoutes from './routes/ticketRoutes';

import tradeRoutes from './routes/tradeRoutes';

app.use('/api/users', userRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/trades', tradeRoutes);


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

