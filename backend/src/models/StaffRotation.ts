import { query } from '../db';

export interface StaffRotation {
  id?: string;
  staffId: string;
  consecutiveWorkDays: number;
  lastWorkDate?: Date;
  lastOffDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export const StaffRotationModel = {
  async create(staffId: string): Promise<StaffRotation> {
    const result = await query(
      `INSERT INTO staff_rotations (staff_id, consecutive_work_days)
       VALUES ($1, $2)
       RETURNING id, staff_id as "staffId", consecutive_work_days as "consecutiveWorkDays", last_work_date as "lastWorkDate", last_off_date as "lastOffDate"`,
      [staffId, 0]
    );
    return result.rows[0];
  },

  async findByStaffId(staffId: string): Promise<StaffRotation | null> {
    const result = await query(
      `SELECT id, staff_id as "staffId", consecutive_work_days as "consecutiveWorkDays", last_work_date as "lastWorkDate", last_off_date as "lastOffDate", created_at as "createdAt", updated_at as "updatedAt"
       FROM staff_rotations WHERE staff_id = $1`,
      [staffId]
    );
    return result.rows[0] || null;
  },

  async updateWorkDay(staffId: string, workDate: Date): Promise<StaffRotation | null> {
    const rotation = await this.findByStaffId(staffId);

    if (!rotation) {
      return await this.create(staffId);
    }

    const newConsecutiveDays = (rotation.consecutiveWorkDays || 0) + 1;

    const result = await query(
      `UPDATE staff_rotations
       SET consecutive_work_days = $1, last_work_date = $2, updated_at = CURRENT_TIMESTAMP
       WHERE staff_id = $3
       RETURNING id, staff_id as "staffId", consecutive_work_days as "consecutiveWorkDays", last_work_date as "lastWorkDate", last_off_date as "lastOffDate"`,
      [newConsecutiveDays, workDate, staffId]
    );

    return result.rows[0] || null;
  },

  async updateOffDay(staffId: string, offDate: Date): Promise<StaffRotation | null> {
    const result = await query(
      `UPDATE staff_rotations
       SET consecutive_work_days = 0, last_off_date = $1, updated_at = CURRENT_TIMESTAMP
       WHERE staff_id = $2
       RETURNING id, staff_id as "staffId", consecutive_work_days as "consecutiveWorkDays", last_work_date as "lastWorkDate", last_off_date as "lastOffDate"`,
      [offDate, staffId]
    );

    return result.rows[0] || null;
  },

  async getNeedingOffDay(): Promise<StaffRotation[]> {
    const result = await query(
      `SELECT id, staff_id as "staffId", consecutive_work_days as "consecutiveWorkDays", last_work_date as "lastWorkDate", last_off_date as "lastOffDate"
       FROM staff_rotations WHERE consecutive_work_days >= 6`
    );
    return result.rows;
  }
};
