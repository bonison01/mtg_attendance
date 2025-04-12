
import { supabase } from '@/integrations/supabase/client';

export type CompanySettings = {
  id: string;
  company_name: string;
  brand_color: string;
  updated_at: string;
  created_at: string;
};

/**
 * Fetch company settings from the database
 */
export const fetchCompanySettings = async (): Promise<CompanySettings | null> => {
  try {
    const { data, error } = await supabase
      .from('company_settings')
      .select('*')
      .single();

    if (error) {
      console.error("Error fetching company settings:", error);
      return null;
    }

    return data as CompanySettings;
  } catch (error) {
    console.error("Unexpected error fetching company settings:", error);
    return null;
  }
};

/**
 * Update company settings in the database
 */
export const updateCompanySettings = async (
  settings: Partial<CompanySettings>
): Promise<{ success: boolean; message: string }> => {
  try {
    // Get the ID of the first settings row (we only have one row in this table)
    const { data: existingSettings } = await supabase
      .from('company_settings')
      .select('id')
      .limit(1)
      .single();

    if (!existingSettings?.id) {
      return { success: false, message: 'Settings not found' };
    }

    const { error } = await supabase
      .from('company_settings')
      .update({
        ...settings,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingSettings.id);

    if (error) {
      console.error("Error updating company settings:", error);
      return { 
        success: false, 
        message: error.message || 'Failed to update settings' 
      };
    }

    return { 
      success: true, 
      message: 'Company settings updated successfully' 
    };
  } catch (error: any) {
    console.error("Unexpected error updating company settings:", error);
    return { 
      success: false, 
      message: error.message || 'An unexpected error occurred' 
    };
  }
};
