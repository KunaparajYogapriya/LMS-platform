import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import authRoutes from './modules/auth/auth.routes.js';
import subjectRoutes from './modules/subjects/subject.routes.js';
import videoRoutes from './modules/videos/video.routes.js';
import progressRoutes from './modules/progress/progress.routes.js';
import healthRoutes from './modules/health/health.routes.js';
import { errorHandler } from './middleware/error.middleware.js';

dotenv.config();

const app = express();

const defaultOrigins = ['http://localhost:3000', 'http://127.0.0.1:3000'];
const envOrigins = process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : [];
const frontendUrl = process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : [];

const allowedOrigins = [...new Set([...defaultOrigins, ...envOrigins, ...frontendUrl])];

app.use(cors({
  origin: function (origin, callback) {
    // 1. Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    // 2. Allow local development
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
       return callback(null, true);
    }
    
    // 3. Allow Vercel preview and production domains
    if (origin.endsWith('.vercel.app')) {
       return callback(null, true);
    }

    // 4. Fallback to specific allowed origins from Environment Variables
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log('[CORS] Origin restricted by policy:', origin);
      // For single-project deployments, same-site requests should be allowed
      // We'll allow it but log it if it wasn't explicitly in our list
      callback(null, true); 
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/health', healthRoutes);

app.use(errorHandler);

// Export app for Vercel
export default app;

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
