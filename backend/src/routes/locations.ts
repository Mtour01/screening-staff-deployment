import { Router, Request, Response } from 'express';
import { LocationModel } from '../models/Location';

const router = Router();

// Create new location
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, code, requiredXray, requiredPds, notes } = req.body;

    if (!name || !code || requiredXray === undefined || requiredPds === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const location = await LocationModel.create({
      name,
      code,
      requiredXray,
      requiredPds,
      active: true,
      notes
    });

    res.status(201).json(location);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all locations
router.get('/', async (req: Request, res: Response) => {
  try {
    const { active } = req.query;

    let locations;
    if (active === 'true') {
      locations = await LocationModel.findActive();
    } else {
      locations = await LocationModel.findAll();
    }

    res.json(locations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get location by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const location = await LocationModel.findById(req.params.id);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update location
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const location = await LocationModel.update(req.params.id, req.body);
    if (!location) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json(location);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete location
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await LocationModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Location not found' });
    }
    res.json({ message: 'Location deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
