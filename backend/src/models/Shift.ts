import { query } from '../db';

export interface Shift {
  id?: string;
  name: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  active: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export const ShiftModel = {
  async create(shift: Shift): Promise<Shift> {
    const result = await query(
      `INSERT INTO shifts (name, start_time, end_time, duration_hours, active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, start_time as "startTime", end_time as "endTime", duration_hours as "durationHours", active`,
      [shift.name, shift.startTime, shift.endTime, shift.durationHours, shift.active]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<Shift | null> {
    const result = await query(
      `SELECT id, name, start_time as "startTime", end_time as "endTime", duration_hours as "durationHours", active, created_at as "createdAt", updated_at as "updatedAt"
       FROM shifts WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findActive(): Promise<Shift[]> {
    const result = await query(
      `SELECT id, name, start_time as "startTime", end_time as "endTime", duration_hours as "durationHours", active
       FROM shifts WHERE active = true ORDER BY start_time`
    );
    return result.rows;
  },

  async findAll(): Promise<Shift[]> {
    const result = await query(
      `SELECT id, name, start_time as "startTime", end_time as "endTime", duration_hours as "durationHours", active
       FROM shifts ORDER BY start_time`
    );
    return result.rows;
  },

  async update(id: string, shift: Partial<Shift>): Promise<Shift | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (shift.name) {
      updates.push(`name = $${paramCount++}`);
      values.push(shift.name);
    }
    if (shift.startTime) {
      updates.push(`start_time = $${paramCount++}`);
      values.push(shift.startTime);
    }
    if (shift.endTime) {
      updates.push(`end_time = $${paramCount++}`);
      values.push(shift.endTime);
    }
    if (shift.durationHours !== undefined) {
      updates.push(`duration_hours = $${paramCount++}`);
      values.push(shift.durationHours);
    }
    if (shift.active !== undefined) {
      updates.push(`active = $${paramCount++}`);
      values.push(shift.active);
    }

    if (updates.length === 0) return null;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE shifts SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, start_time as "startTime", end_time as "endTime", duration_hours as "durationHours", active`,
      values
    );

    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM shifts WHERE id = $1`, [id]);
    return result.rowCount! > 0;
  }
};
