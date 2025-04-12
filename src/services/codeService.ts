
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
 * Validates a selfie image by comparing it to the user's profile image
 * In a real implementation, this would use facial recognition
 */
export const validateSelfie = async (employeeId: string, selfieImage: string): Promise<boolean> => {
  try {
    // Check if employee exists
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('image_url')
      .eq('id', employeeId)
      .single();
      
    if (employeeError) throw employeeError;
    
    if (selfieImage) {
      // Store the selfie for this employee if verification passes
      const fileExt = 'jpg';
      const fileName = `${employeeId}_${Date.now()}.${fileExt}`;
      const filePath = `selfies/${fileName}`;
      
      // Convert base64 to blob
      const base64Data = selfieImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];
      
      for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
        const slice = byteCharacters.slice(offset, offset + 1024);
        
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }
      
      const blob = new Blob(byteArrays, { type: 'image/jpeg' });
      
      // Upload to Supabase storage (if available)
      try {
        const { error: uploadError } = await supabase.storage
          .from('employee-biometrics')
          .upload(filePath, blob);
          
        if (!uploadError) {
          // On successful upload, update employee with reference to the selfie
          // Using image_url instead of last_selfie_url as that's what exists in the database
          await supabase
            .from('employees')
            .update({ 
              image_url: filePath 
            })
            .eq('id', employeeId);
        }
      } catch (storageError) {
        console.error('Storage not configured or error:', storageError);
        // Continue with verification even if storage fails
      }
    }
    
    // For demo purposes, we'll simulate a successful verification most of the time
    // In a real app, this would compare the selfie against stored images
    return Math.random() > 0.1;
  } catch (error) {
    console.error("Error validating selfie:", error);
    return false;
  }
};

/**
 * Validates a fingerprint scan against the stored fingerprint data
 * In a real implementation, this would use actual biometric comparison
 */
export const validateFingerprint = async (employeeId: string): Promise<boolean> => {
  try {
    // Check if employee has fingerprint data
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('fingerprint')
      .eq('id', employeeId)
      .single();
      
    if (employeeError) throw employeeError;
    
    // Generate a mock fingerprint hash and store it
    const mockFingerprintHash = `fp_${Math.random().toString(36).substring(2, 15)}`;
    
    // Store the fingerprint for this employee if none exists
    if (!employee.fingerprint) {
      await supabase
        .from('employees')
        .update({ 
          fingerprint: mockFingerprintHash 
        })
        .eq('id', employeeId);
    }
    
    // For demo purposes, we'll simulate a high success rate
    return Math.random() > 0.1;
  } catch (error) {
    console.error("Error validating fingerprint:", error);
    return false;
  }
};

/**
 * Fetches the current day's verification requirements from the database
 */
export const getVerificationRequirements = async (): Promise<{ 
  requireCode: boolean;
  requireSelfie: boolean;
  requireFingerprint: boolean;
}> => {
  try {
    // Use the attendance_settings table
    const { data, error } = await supabase
      .from('attendance_settings')
      .select('require_code, require_selfie, require_fingerprint')
      .single();
      
    if (error) throw error;
    
    // Return all methods as true to allow switching between them
    return {
      requireCode: true,
      requireSelfie: true,
      requireFingerprint: true
    };
  } catch (error) {
    console.error("Error fetching verification requirements:", error);
    // Default to enabling all methods
    return {
      requireCode: true,
      requireSelfie: true,
      requireFingerprint: true
    };
  }
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
    // Use the newly created employee_schedules table
    const { data, error } = await supabase
      .from('employee_schedules')
      .select('expected_clock_in, holidays')
      .eq('employee_id', employeeId)
      .single();
      
    if (error) {
      console.error("Error fetching employee schedule:", error);
      
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
    }
    
    return {
      expectedClockInTime: data?.expected_clock_in || "09:00",
      holidays: data?.holidays || []
    };
  } catch (error) {
    console.error("Error fetching employee schedule:", error);
    return {
      expectedClockInTime: "09:00", // Default
      holidays: []
    };
  }
};

/**
 * Record attendance from public dashboard
 * @param employeeId - The employee's ID
 * @param action - 'in' for clock in, 'out' for clock out
 * @param verificationMethod - How the employee was verified
 * @returns Success status and message
 */
export const recordAttendance = async (
  employeeId: string, 
  action: 'in' | 'out',
  verificationMethod: 'selfie' | 'fingerprint' | 'code'
): Promise<{ success: boolean; message: string }> => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date().toLocaleTimeString();
    
    // Get employee schedule to determine if late
    const schedule = await getEmployeeSchedule(employeeId);
    const isHoliday = schedule.holidays.includes(today);
    
    if (action === 'in') {
      // Check if already clocked in today
      const { data: existingRecord, error: checkError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .single();
        
      if (existingRecord?.time_in) {
        return { 
          success: false, 
          message: 'Already clocked in today' 
        };
      }
      
      // Determine status based on time
      const [hours, minutes] = now.split(':').map(Number);
      const [expectedHours, expectedMinutes] = schedule.expectedClockInTime.split(':').map(Number);
      
      let status = 'present';
      if (isHoliday) {
        status = 'holiday';
      } else if (hours > expectedHours || (hours === expectedHours && minutes > (expectedMinutes + 15))) {
        status = 'late';
      }
      
      const attendanceData = {
        employee_id: employeeId,
        date: today,
        time_in: now,
        status: status,
        note: `Verified with ${verificationMethod}`
      };
      
      const { error } = await supabase
        .from('attendance_records')
        .upsert(attendanceData);
        
      if (error) throw error;
      
      return { 
        success: true, 
        message: `Clocked in at ${now}` 
      };
    } else {
      // For clock out, find existing record
      const { data: record, error: findError } = await supabase
        .from('attendance_records')
        .select('*')
        .eq('employee_id', employeeId)
        .eq('date', today)
        .single();
        
      if (findError || !record) {
        return { 
          success: false, 
          message: 'No clock-in record found for today' 
        };
      }
      
      if (record.time_out) {
        return { 
          success: false, 
          message: 'Already clocked out today' 
        };
      }
      
      const { error: updateError } = await supabase
        .from('attendance_records')
        .update({ 
          time_out: now,
          note: record.note + ` | Clocked out with ${verificationMethod}`
        })
        .eq('id', record.id);
        
      if (updateError) throw updateError;
      
      return { 
        success: true, 
        message: `Clocked out at ${now}` 
      };
    }
  } catch (error: any) {
    console.error("Error recording attendance:", error);
    return { 
      success: false, 
      message: error.message || 'Failed to record attendance' 
    };
  }
};
