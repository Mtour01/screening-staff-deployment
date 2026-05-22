import { Router, Request, Response } from 'express';
import { DeploymentModel } from '../models/Deployment';
import { deploymentService } from '../services/deploymentService';

const router = Router();

// Generate schedule for date range
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.body;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate' });
    }

    const result = await deploymentService.generateSchedule(
      new Date(startDate),
      new Date(endDate)
    );

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get deployments by date
router.get('/date/:date', async (req: Request, res: Response) => {
  try {
    const deployments = await DeploymentModel.findByDate(new Date(req.params.date));
    res.json(deployments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff workload
router.get('/staff/:staffId/workload', async (req: Request, res: Response) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Missing startDate or endDate' });
    }

    const workload = await deploymentService.getStaffWorkload(
      req.params.staffId,
      new Date(startDate as string),
      new Date(endDate as string)
    );

    res.json(workload);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get location summary
router.get('/location/:locationId/summary', async (req: Request, res: Response) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Missing date query parameter' });
    }

    const summary = await deploymentService.getLocationSummary(
      req.params.locationId,
      new Date(date as string)
    );

    res.json(summary);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update deployment status
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const deployment = await DeploymentModel.update(req.params.id, req.body);
    if (!deployment) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    res.json(deployment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete deployment
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await DeploymentModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Deployment not found' });
    }
    res.json({ message: 'Deployment deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Clear deployments for a date
router.delete('/clear/:date', async (req: Request, res: Response) => {
  try {
    const count = await DeploymentModel.deleteByDate(new Date(req.params.date));
    res.json({ message: `Deleted ${count} deployments` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
