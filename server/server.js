import express        from 'express';
import { createServer } from 'http';
import { Server }     from 'socket.io';
import cors            from 'cors';
import helmet           from 'helmet';
import cookieParser     from 'cookie-parser';
import dotenv            from 'dotenv';
import connectDB        from './src/config/db.js';
import boardRoutes      from './src/routes/boardRoutes.js';
import authRoutes       from './src/routes/authRoutes.js';
import joinRoutes       from './src/routes/joinRoutes.js';
import { initSocketHandlers } from './src/socket/socketHandler.js';
import { apiLimiter }   from './src/middleware/rateLimiter.js';
import { setIO }        from './src/socket/ioInstance.js';

dotenv.config();

const app        = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: { origin: process.env.CLIENT_URL, methods: ['GET','POST','DELETE'], credentials: true },
  maxHttpBufferSize: 5e6,
  pingTimeout: 60000,
  pingInterval: 25000,
});

setIO(io); // make io available to controllers

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use('/api', apiLimiter);

app.get('/health', (req, res) =>
  res.json({ status: 'ok', uptime: process.uptime(), timestamp: new Date().toISOString() })
);

app.use('/api/auth',   authRoutes);
app.use('/api/boards', boardRoutes);
app.use('/api/boards', joinRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

initSocketHandlers(io);

connectDB().then(() => {
  const PORT = process.env.PORT || 5000;
  httpServer.listen(PORT, () => console.log(`Server on port ${PORT} [${process.env.NODE_ENV}]`));
});