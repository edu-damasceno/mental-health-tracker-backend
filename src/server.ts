import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import WebSocket from 'ws';
import authRoutes from './routes/auth';
import logsRoutes from './routes/logs';

export const app = express();
export const wss = new WebSocket.Server({ port: 8081 });

app.use(cors());
app.use(helmet());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/logs', logsRoutes);

const server = app.listen(8080, () => {
  console.log('Server running on port 8080');
});

export const close = () => {
  server.close();
  wss.close();
}; 