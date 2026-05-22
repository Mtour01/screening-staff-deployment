import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import staffRoutes from './routes/staff';
import locationRoutes from './routes/locations';
import shiftRoutes from './routes/shifts';
import deploymentRoutes from './routes/deployments';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/staff', staffRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/deployments', deploymentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
});
