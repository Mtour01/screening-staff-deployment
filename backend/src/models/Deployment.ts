import { query } from '../db';

export interface Deployment {
  id?: string;
  staffId: string;
  locationId: string;
  shiftId: string;
  deploymentDate: Date;
  status?: 'scheduled' | 'confirmed' | 'completed' | 'absent' | 'cancelled';
  notes?: string;
}

export const DeploymentModel = {
  async create(deployment: Deployment): Promise<Deployment> {
    const result = await query(
      `INSERT INTO deployments (staff_id, location_id, shift_id, deployment_date, status, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, staff_id as "staffId", location_id as "locationId", shift_id as "shiftId", deployment_date as "deploymentDate", status, notes`,
      [deployment.staffId, deployment.locationId, deployment.shiftId, deployment.deploymentDate, deployment.status || 'scheduled', deployment.notes]
    );
    return result.rows[0];
  },

  async findByDate(date: Date): Promise<Deployment[]> {
    const result = await query(
      `SELECT d.id, d.staff_id as "staffId", d.location_id as "locationId", d.shift_id as "shiftId", 
              d.deployment_date as "deploymentDate", d.status, d.notes,
              s.first_name as "staffFirstName", s.last_name as "staffLastName", s.role,
              l.name as "locationName", l.code as "locationCode",
              sh.name as "shiftName", sh.start_time as "shiftStart", sh.end_time as "shiftEnd"
       FROM deployments d
       JOIN staff s ON d.staff_id = s.id
       JOIN locations l ON d.location_id = l.id
       JOIN shifts sh ON d.shift_id = sh.id
       WHERE d.deployment_date = $1
       ORDER BY l.name, sh.start_time`,
      [date]
    );
    return result.rows;
  },

  async findByStaffAndDate(staffId: string, date: Date): Promise<Deployment | null> {
    const result = await query(
      `SELECT id, staff_id as "staffId", location_id as "locationId", shift_id as "shiftId", deployment_date as "deploymentDate", status, notes
       FROM deployments WHERE staff_id = $1 AND deployment_date = $2`,
      [staffId, date]
    );
    return result.rows[0] || null;
  },

  async findByLocation(locationId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const result = await query(
      `SELECT d.id, d.staff_id as "staffId", d.location_id as "locationId", d.shift_id as "shiftId", 
              d.deployment_date as "deploymentDate", d.status, d.notes,
              s.first_name as "staffFirstName", s.last_name as "staffLastName", s.role
       FROM deployments d
       JOIN staff s ON d.staff_id = s.id
       WHERE d.location_id = $1 AND d.deployment_date BETWEEN $2 AND $3
       ORDER BY d.deployment_date, d.shift_id`,
      [locationId, startDate, endDate]
    );
    return result.rows;
  },

  async findByStaff(staffId: string, startDate: Date, endDate: Date): Promise<any[]> {
    const result = await query(
      `SELECT d.id, d.staff_id as "staffId", d.location_id as "locationId", d.shift_id as "shiftId", 
              d.deployment_date as "deploymentDate", d.status, d.notes,
              l.name as "locationName", l.code as "locationCode",
              sh.name as "shiftName"
       FROM deployments d
       JOIN locations l ON d.location_id = l.id
       JOIN shifts sh ON d.shift_id = sh.id
       WHERE d.staff_id = $1 AND d.deployment_date BETWEEN $2 AND $3
       ORDER BY d.deployment_date, d.shift_id`,
      [staffId, startDate, endDate]
    );
    return result.rows;
  },

  async update(id: string, deployment: Partial<Deployment>): Promise<Deployment | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (deployment.status) {
      updates.push(`status = $${paramCount++}`);
      values.push(deployment.status);
    }
    if (deployment.notes) {
      updates.push(`notes = $${paramCount++}`);
      values.push(deployment.notes);
    }

    if (updates.length === 0) return null;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE deployments SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, staff_id as "staffId", location_id as "locationId", shift_id as "shiftId", deployment_date as "deploymentDate", status, notes`,
      values
    );

    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM deployments WHERE id = $1`, [id]);
    return result.rowCount! > 0;
  },

  async deleteByDate(date: Date): Promise<number> {
    const result = await query(`DELETE FROM deployments WHERE deployment_date = $1`, [date]);
    return result.rowCount!;
  }
};
