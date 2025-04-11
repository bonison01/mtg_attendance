
/**
 * Service for managing verification code validation and attendance rules
 */
import { supabase } from '@/integrations/supabase/client';
import { getDailyCode } from '@/utils/codeGenerator';

/**
 * Validates the provided code against the current daily code
 */
export const validateCode = (inputCode: string): boolean => {
  const todayCode = getDailyCode();
  return inputCode === todayCode;
};

/**
 * Fetches the current day's verification requirements from the database
 * In a real implementation, this would fetch from Supabase
 */
export const getVerificationRequirements = async (): Promise<{ 
  requireCode: boolean;
  requireSelfie: boolean;
  requireFingerprint: boolean;
}> => {
  // In a real implementation, this would fetch from Supabase
  // For now, we'll simulate this with default values
  return {
    requireCode: true,
    requireSelfie: false,
    requireFingerprint: false
  };
};

/**
 * Calculates salary deductions based on attendance records
 * @param clockInTime - The time employee clocked in (string format HH:MM:SS)
 * @param expectedClockInTime - The expected clock-in time for this employee (string format HH:MM)
 * @param isPresent - Whether the employee was present at all
 * @param isHoliday - Whether it's a holiday for this employee
 * @returns The amount to deduct from salary in Rupees
 */
export const calculateSalaryDeduction = (
  clockInTime: string | undefined,
  expectedClockInTime: string,
  isPresent: boolean,
  isHoliday: boolean
): number => {
  // No deduction for holidays
  if (isHoliday) return 0;
  
  // Deduct Rs 500 for absence
  if (!isPresent) return 500;
  
  // No clock-in time recorded but employee is marked present
  if (!clockInTime) return 0;
  
  // Parse times for comparison
  const [clockInHours, clockInMinutes] = clockInTime.split(':').map(Number);
  const [expectedHours, expectedMinutes] = expectedClockInTime.split(':').map(Number);
  
  // Convert both times to minutes for easier comparison
  const clockInTotalMinutes = clockInHours * 60 + clockInMinutes;
  const expectedTotalMinutes = expectedHours * 60 + expectedMinutes;
  
  // Calculate minutes late
  const minutesLate = clockInTotalMinutes - expectedTotalMinutes;
  
  // Deduct Rs 250 if more than 15 minutes late
  return minutesLate > 15 ? 250 : 0;
};

/**
 * Get employee-specific work schedule information
 * @param employeeId - The employee's ID
 * @returns Work schedule information including expected clock-in time and holidays
 */
export const getEmployeeSchedule = async (employeeId: string): Promise<{
  expectedClockInTime: string;
  holidays: string[]; // Array of dates in format YYYY-MM-DD
}> => {
  try {
    // In a real implementation, this would fetch from Supabase
    // For demo purposes, we'll return mock data based on employee ID
    
    // This simulates different schedules for different employees
    const lastChar = employeeId.charAt(employeeId.length - 1);
    const charCode = lastChar.charCodeAt(0);
    
    // Assign different schedules based on the employee ID
    if (charCode % 3 === 0) {
      return {
        expectedClockInTime: "09:00",
        holidays: ["2025-04-14", "2025-04-21", "2025-04-28"]  // Mondays off
      };
    } else if (charCode % 3 === 1) {
      return {
        expectedClockInTime: "10:00",
        holidays: ["2025-04-12", "2025-04-13", "2025-04-19", "2025-04-20", "2025-04-26", "2025-04-27"] // Weekends off
      };
    } else {
      return {
        expectedClockInTime: "08:30",
        holidays: ["2025-04-15", "2025-04-22", "2025-04-29"] // Tuesdays off
      };
    }
  } catch (error) {
    console.error("Error fetching employee schedule:", error);
    return {
      expectedClockInTime: "09:00", // Default
      holidays: []
    };
  }
};
