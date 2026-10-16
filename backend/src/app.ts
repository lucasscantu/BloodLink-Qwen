import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import { authRouter } from './routes/auth.routes';
import { usersRouter } from './routes/users.routes';
import { institutionsRouter } from './routes/institutions.routes';
import { bloodBagsRouter } from './routes/blood-bags.routes';
import { demandsRouter } from './routes/demands.routes';
import { transfersRouter } from './routes/transfers.routes';
import { temperatureRouter } from './routes/temperature.routes';
import { auditRouter } from './routes/audit.routes';
import { blockchainRouter } from './routes/blockchain.routes';
import { errorHandler } from './middleware/error-handler';

const app = express();

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/institutions', institutionsRouter);
app.use('/api/blood-bags', bloodBagsRouter);
app.use('/api/demands', demandsRouter);
app.use('/api/transfers', transfersRouter);
app.use('/api/temperature', temperatureRouter);
app.use('/api/audit', auditRouter);
app.use('/api/blockchain', blockchainRouter);

// Error handler
app.use(errorHandler);

export default app;
