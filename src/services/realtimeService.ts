
import { supabase } from '@/integrations/supabase/client';
import { RealtimeChannel } from '@supabase/supabase-js';

export type RealtimeSubscriptionCallback = (payload: any) => void;

export const subscribeToAttendanceChanges = (callback: RealtimeSubscriptionCallback): RealtimeChannel => {
  const channel = supabase
    .channel('attendance-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'attendance_records'
      },
      (payload) => callback(payload)
    )
    .subscribe();

  return channel;
};

export const subscribeToEmployeeChanges = (callback: RealtimeSubscriptionCallback): RealtimeChannel => {
  const channel = supabase
    .channel('employee-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'employees'
      },
      (payload) => callback(payload)
    )
    .subscribe();

  return channel;
};

export const subscribeToSettingsChanges = (callback: RealtimeSubscriptionCallback): RealtimeChannel => {
  const channel = supabase
    .channel('settings-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'attendance_settings'
      },
      (payload) => callback(payload)
    )
    .subscribe();

  return channel;
};

export const subscribeToScheduleChanges = (callback: RealtimeSubscriptionCallback): RealtimeChannel => {
  const channel = supabase
    .channel('schedule-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'employee_schedules'
      },
      (payload) => callback(payload)
    )
    .subscribe();

  return channel;
};

export const unsubscribeFromChannel = (channel: RealtimeChannel): void => {
  supabase.removeChannel(channel);
};

/**
 * Get real-time current day attendance stats
 */
export const getCurrentDayAttendanceStats = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data: records, error } = await supabase
      .from('attendance_records')
      .select('status')
      .eq('date', today);
      
    if (error) throw error;
    
    const stats = {
      present: 0,
      late: 0,
      absent: 0,
      leave: 0,
      holiday: 0
    };
    
    records?.forEach(record => {
      if (stats[record.status] !== undefined) {
        stats[record.status]++;
      }
    });
    
    // Get total employee count to calculate absent
    const { count: totalEmployees, error: countError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true });
      
    if (!countError && totalEmployees) {
      // Calculate absent as total employees minus those who have a record
      stats.absent = totalEmployees - (stats.present + stats.late + stats.leave + stats.holiday);
      if (stats.absent < 0) stats.absent = 0;
    }
    
    return stats;
  } catch (error) {
    console.error("Error fetching attendance stats:", error);
    return {
      present: 0,
      late: 0,
      absent: 0,
      leave: 0,
      holiday: 0
    };
  }
};
