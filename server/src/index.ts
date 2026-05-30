import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { config } from 'dotenv';

// Load environment variables
config();

const app = new Hono();

// Middleware
app.use('*', cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

app.use('*', logger());

// Health check
app.get('/health', (c) => {
  return c.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV 
  });
});

// API routes
import authRoutes from './routes/auth';
import settingsRoutes from './routes/settings';
import categoriesRoutes from './routes/categories';
import productsRoutes from './routes/products-simple';
import stockRoutes from './routes/stock-simple';
import posRoutes from './routes/pos';

app.route('/api/auth', authRoutes);
app.route('/api/settings', settingsRoutes);
app.route('/api/categories', categoriesRoutes);
app.route('/api/products', productsRoutes);
app.route('/api/stock', stockRoutes);
app.route('/api/pos', posRoutes);

const port = Number(process.env.PORT) || 3000;

console.log(`🚀 Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port,
});
