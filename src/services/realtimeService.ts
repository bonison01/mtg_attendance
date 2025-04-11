
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
        table: 'staff'  // Using 'staff' table as a substitute for attendance records
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
        table: 'staff'  // Using 'staff' as our employees table
      },
      (payload) => callback(payload)
    )
    .subscribe();

  return channel;
};

export const unsubscribeFromChannel = (channel: RealtimeChannel): void => {
  supabase.removeChannel(channel);
};
