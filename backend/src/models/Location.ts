import { query } from '../db';

export interface Location {
  id?: string;
  name: string;
  code: string;
  requiredXray: number;
  requiredPds: number;
  active: boolean;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export const LocationModel = {
  async create(location: Location): Promise<Location> {
    const result = await query(
      `INSERT INTO locations (name, code, required_xray, required_pds, active, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, code, required_xray as "requiredXray", required_pds as "requiredPds", active, notes`,
      [location.name, location.code, location.requiredXray, location.requiredPds, location.active, location.notes]
    );
    return result.rows[0];
  },

  async findById(id: string): Promise<Location | null> {
    const result = await query(
      `SELECT id, name, code, required_xray as "requiredXray", required_pds as "requiredPds", active, notes, created_at as "createdAt", updated_at as "updatedAt"
       FROM locations WHERE id = $1`,
      [id]
    );
    return result.rows[0] || null;
  },

  async findActive(): Promise<Location[]> {
    const result = await query(
      `SELECT id, name, code, required_xray as "requiredXray", required_pds as "requiredPds", active, notes
       FROM locations WHERE active = true ORDER BY name`
    );
    return result.rows;
  },

  async findAll(): Promise<Location[]> {
    const result = await query(
      `SELECT id, name, code, required_xray as "requiredXray", required_pds as "requiredPds", active, notes
       FROM locations ORDER BY name`
    );
    return result.rows;
  },

  async update(id: string, location: Partial<Location>): Promise<Location | null> {
    const updates: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (location.name) {
      updates.push(`name = $${paramCount++}`);
      values.push(location.name);
    }
    if (location.code) {
      updates.push(`code = $${paramCount++}`);
      values.push(location.code);
    }
    if (location.requiredXray !== undefined) {
      updates.push(`required_xray = $${paramCount++}`);
      values.push(location.requiredXray);
    }
    if (location.requiredPds !== undefined) {
      updates.push(`required_pds = $${paramCount++}`);
      values.push(location.requiredPds);
    }
    if (location.active !== undefined) {
      updates.push(`active = $${paramCount++}`);
      values.push(location.active);
    }
    if (location.notes) {
      updates.push(`notes = $${paramCount++}`);
      values.push(location.notes);
    }

    if (updates.length === 0) return null;

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const result = await query(
      `UPDATE locations SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING id, name, code, required_xray as "requiredXray", required_pds as "requiredPds", active, notes`,
      values
    );

    return result.rows[0] || null;
  },

  async delete(id: string): Promise<boolean> {
    const result = await query(`DELETE FROM locations WHERE id = $1`, [id]);
    return result.rowCount! > 0;
  }
};
