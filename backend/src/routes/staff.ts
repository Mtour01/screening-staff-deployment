import { Router, Request, Response } from 'express';
import { StaffModel } from '../models/Staff';

const router = Router();

// Create new staff member
router.post('/', async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, role, hireDate, notes } = req.body;

    if (!firstName || !lastName || !email || !phone || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const staff = await StaffModel.create({
      firstName,
      lastName,
      email,
      phone,
      role,
      hireDate: new Date(hireDate),
      active: true,
      notes
    });

    res.status(201).json(staff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all staff
router.get('/', async (req: Request, res: Response) => {
  try {
    const { active, role } = req.query;

    let staff;
    if (active === 'true') {
      staff = await StaffModel.findActive();
    } else if (role) {
      staff = await StaffModel.findByRole(role as string);
    } else {
      staff = await StaffModel.findAll();
    }

    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get staff by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const staff = await StaffModel.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update staff
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const staff = await StaffModel.update(req.params.id, req.body);
    if (!staff) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json(staff);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Delete staff
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const success = await StaffModel.delete(req.params.id);
    if (!success) {
      return res.status(404).json({ error: 'Staff not found' });
    }
    res.json({ message: 'Staff deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
