import { StaffModel } from '../models/Staff';
import { LocationModel } from '../models/Location';
import { ShiftModel } from '../models/Shift';
import { DeploymentModel } from '../models/Deployment';
import { StaffRotationModel } from '../models/StaffRotation';

interface DeploymentResult {
  success: boolean;
  message: string;
  deploymentsCreated?: number;
  conflicts?: string[];
}

export const deploymentService = {
  /**
   * Generate optimal schedule for given date range
   * Ensures:
   * - Each location has required staff (3 X-Ray, 6 PDS)
   * - PDS balanced by gender (3 Male, 3 Female)
   * - Staff rotation enforced (6 work days, 1 off day)
   * - No double bookings
   */
  async generateSchedule(startDate: Date, endDate: Date, autoAssign = true): Promise<DeploymentResult> {
    try {
      const conflicts: string[] = [];
      let deploymentsCreated = 0;

      // Get all active staff and locations
      const staff = await StaffModel.findActive();
      const locations = await LocationModel.findActive();
      const shifts = await ShiftModel.findAll();

      if (staff.length === 0 || locations.length === 0 || shifts.length === 0) {
        return {
          success: false,
          message: 'Missing staff, locations, or shifts',
          conflicts
        };
      }

      // Group staff by role
      const xrayStaff = staff.filter(s => s.role === 'xray');
      const pdsMaleStaff = staff.filter(s => s.role === 'pds_male');
      const pdsFemaleStaff = staff.filter(s => s.role === 'pds_female');

      // Iterate through each day in range
      const currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];

        // For each location
        for (const location of locations) {
          // Deploy for each shift
          for (const shift of shifts) {
            try {
              // Get available staff for this day/shift
              const availableXray = await this.getAvailableStaff(
                xrayStaff,
                currentDate,
                shift.id!
              );

              const availablePdsMale = await this.getAvailableStaff(
                pdsMaleStaff,
                currentDate,
                shift.id!
              );

              const availablePdsFemale = await this.getAvailableStaff(
                pdsFemaleStaff,
                currentDate,
                shift.id!
              );

              // Check if we have enough staff
              if (
                availableXray.length < location.requiredXray ||
                availablePdsMale.length < 3 ||
                availablePdsFemale.length < 3
              ) {
                conflicts.push(
                  `${dateStr} - ${location.name} - ${shift.name}: Insufficient staff`
                );
                continue;
              }

              // Assign X-Ray operators
              for (let i = 0; i < location.requiredXray; i++) {
                const selectedStaff = availableXray[i];
                await DeploymentModel.create({
                  staffId: selectedStaff.id!,
                  locationId: location.id!,
                  shiftId: shift.id!,
                  deploymentDate: currentDate,
                  status: 'scheduled'
                });
                deploymentsCreated++;

                // Update rotation
                await StaffRotationModel.updateWorkDay(selectedStaff.id!, currentDate);
              }

              // Assign PDS Male
              for (let i = 0; i < 3; i++) {
                const selectedStaff = availablePdsMale[i];
                await DeploymentModel.create({
                  staffId: selectedStaff.id!,
                  locationId: location.id!,
                  shiftId: shift.id!,
                  deploymentDate: currentDate,
                  status: 'scheduled'
                });
                deploymentsCreated++;

                await StaffRotationModel.updateWorkDay(selectedStaff.id!, currentDate);
              }

              // Assign PDS Female
              for (let i = 0; i < 3; i++) {
                const selectedStaff = availablePdsFemale[i];
                await DeploymentModel.create({
                  staffId: selectedStaff.id!,
                  locationId: location.id!,
                  shiftId: shift.id!,
                  deploymentDate: currentDate,
                  status: 'scheduled'
                });
                deploymentsCreated++;

                await StaffRotationModel.updateWorkDay(selectedStaff.id!, currentDate);
              }
            } catch (error) {
              console.error(`Error deploying for ${location.name} on ${dateStr}:`, error);
              conflicts.push(`${dateStr} - ${location.name}: Deployment error`);
            }
          }
        }

        // Move to next day
        currentDate.setDate(currentDate.getDate() + 1);
      }

      return {
        success: conflicts.length === 0,
        message: `Generated schedule with ${deploymentsCreated} deployments`,
        deploymentsCreated,
        conflicts: conflicts.length > 0 ? conflicts : undefined
      };
    } catch (error) {
      console.error('Error generating schedule:', error);
      return {
        success: false,
        message: 'Schedule generation failed',
        conflicts: ['System error occurred']
      };
    }
  },

  /**
   * Get staff available for a specific date and shift
   */
  async getAvailableStaff(staffList: any[], date: Date, shiftId: string) {
    const available = [];

    for (const staffMember of staffList) {
      // Check if already deployed that day
      const existingDeployment = await DeploymentModel.findByStaffAndDate(
        staffMember.id,
        date
      );

      if (existingDeployment) {
        continue;
      }

      // Check rotation status
      const rotation = await StaffRotationModel.findByStaffId(staffMember.id);
      if (rotation && rotation.consecutiveWorkDays >= 6) {
        // Staff needs off day
        continue;
      }

      available.push(staffMember);
    }

    return available;
  },

  /**
   * Get deployment summary for a location
   */
  async getLocationSummary(locationId: string, date: Date) {
    const deployments = await DeploymentModel.findByLocation(
      locationId,
      date,
      date
    );

    const summary = {
      xrayCount: 0,
      pdsMaleCount: 0,
      pdsFemaleCount: 0,
      total: deployments.length,
      staff: deployments.map(d => ({
        id: d.staffId,
        name: `${d.staffFirstName} ${d.staffLastName}`,
        role: d.role,
        shift: d.shiftName
      }))
    };

    for (const deployment of deployments) {
      if (deployment.role === 'xray') summary.xrayCount++;
      else if (deployment.role === 'pds_male') summary.pdsMaleCount++;
      else if (deployment.role === 'pds_female') summary.pdsFemaleCount++;
    }

    return summary;
  },

  /**
   * Get staff workload summary
   */
  async getStaffWorkload(staffId: string, startDate: Date, endDate: Date) {
    const deployments = await DeploymentModel.findByStaff(staffId, startDate, endDate);

    return {
      staffId,
      totalDeployments: deployments.length,
      deploymentsByLocation: {},
      deploymentsByShift: {},
      deployments: deployments.map(d => ({
        date: d.deploymentDate,
        location: d.locationName,
        shift: d.shiftName,
        status: d.status
      }))
    };
  }
};
