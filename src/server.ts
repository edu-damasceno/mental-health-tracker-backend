import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import WebSocket from 'ws';
import { config } from './config/env';
import authRoutes from './routes/auth';
import logsRoutes from './routes/logs';
import rateLimit from 'express-rate-limit';

export const app = express();

app.use(cors({
  origin: config.ALLOWED_ORIGINS,
  credentials: true
}));

app.use(helmet());
app.use(express.json());

// Rate limiter
export const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT.WINDOW_MS,
  max: config.RATE_LIMIT.MAX_REQUESTS
});

app.use('/auth', authRoutes);
app.use('/logs', logsRoutes);

let server: any;
let wss: WebSocket.Server;

export const start = () => {
  return new Promise((resolve) => {
    server = app.listen(config.PORT, () => {
      const address = server.address();
      const port = typeof address === 'object' ? address.port : config.PORT;
      console.log(`Server running on port ${port}`);
      
      wss = new WebSocket.Server({ port: config.WS_PORT });
      resolve({ port, wsPort: wss.options.port });
    });
  });
};

export const close = async () => {
  return new Promise((resolve) => {
    server?.close(() => {
      wss?.close(() => {
        resolve(true);
      });
    });
  });
};

export { wss };

// Start server if not in test environment
if (process.env.NODE_ENV !== 'test') {
  start();
} 