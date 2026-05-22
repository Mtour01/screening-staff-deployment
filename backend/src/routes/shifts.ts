import { Router, Request, Response } from 'express';
import { ShiftModel } from '../models/Shift';

const router = Router();

// Create new shift
router.post('/', async (req: Request, res: Response) => {
  try {
    const { name, startTime, endTime, durationHours } = req.body;

    if (!name || !startTime || !endTime || durationHours === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const shift = await ShiftModel.create({
      name,
      startTime,
      endTime,
      durationHours,
      active: true
    });

    res.status(201).json(shift);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all shifts
router.get('/', async (req: Request, res: Response) => {
  try {
    const { active } = req.query;

    let shifts;
    if (active === 'true') {
      shifts = await ShiftModel.findActive();
    } else {
      shifts = await ShiftModel.findAll();
    }

    res.json(shifts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get shift by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const shift = await ShiftModel.findById(req.params.id);
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    res.json(shift);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update shift
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const shift = await ShiftModel.update(req.params.id, req.body);
    if (!shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    res.json(shift);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete shift
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await ShiftModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Shift not found' });
    }
    res.json({ message: 'Shift deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
