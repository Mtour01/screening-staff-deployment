import { query } from '../db';

export interface Staff {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: 'xray' | 'pds_male' | 'pds_female';
  hireDate: Date;
  active: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const StaffModel = {
  async create(staff: Staff): Promise<Staff> {
    const result = await query(
      `INSERT INTO staff (first_name, last_name, email, phone, role, hire_date, active, notes)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, first_name as "firstName", last_name as "lastName", email, phone, role, hire_date as "hireDate", active, notes`,
      [staff.firstName, staff.lastName, staff.email, staff.phone, staff.role, staff.hireDate, staff.active, staff.notes]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<Staff | null> {
    const result = await query(
      `SELECT id, first_name as "firstName", last_name as "lastName", email, phone, role, hire_date as "hireDate", active, notes, created_at as "createdAt", updated_at as "updatedAt"
       FROM staff WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findActive(): Promise<Staff[]> {
    const result = await query(
      `SELECT id, first_name as "firstName", last_name as "lastName", email, phone, role, hire_date as "hireDate", active, notes
       FROM staff WHERE active = true ORDER BY last_name, first_name`
    );
    return result.rows;
  },

  async findByRole(role: string): Promise<Staff[]> {
    const result = await query(
      `SELECT id, first_name as "firstName", last_name as "lastName", email, phone, role, hire_date as "hireDate", active, notes
       FROM staff WHERE role = $1 AND active = true ORDER BY last_name, first_name`,
      [role]
    );
    return result.rows;
  },

  async findAll(): Promise<Staff[]> {
    const result = await query(
      `SELECT id, first_name as "firstName", last_name as "lastName", email, phone, role, hire_date as "hireDate", active, notes
       FROM staff ORDER BY last_name, first_name`
    );
    return result.rows;
  },

  async update(id: string, staff: Partial<Staff>): Promise<Staff | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (staff.firstName) {
      updates.push(`first_name = $${paramCount++}`);
      values.push(staff.firstName);
    }
    if (staff.lastName) {
      updates.push(`last_name = $${paramCount++}`);
      values.push(staff.lastName);
    }
    if (staff.email) {
      updates.push(`email = $${paramCount++}`);
      values.push(staff.email);
    }
    if (staff.phone) {
      updates.push(`phone = $${paramCount++}`);
      values.push(staff.phone);
    }
    if (staff.role) {
      updates.push(`role = $${paramCount++}`);
      values.push(staff.role);
    }
    if (staff.active !== undefined) {
      updates.push(`active = $${paramCount++}`);
      values.push(staff.active);
    }
    if (staff.notes) {
      updates.push(`notes = $${paramCount++}`);
      values.push(staff.notes);
    }

    if (updates.length === 0) return null;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE staff SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, first_name as "firstName", last_name as "lastName", email, phone, role, hire_date as "hireDate", active, notes`,
      values
    );

    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM staff WHERE id = $1`, [id]);
    return result.rowCount! > 0;
  }
};
