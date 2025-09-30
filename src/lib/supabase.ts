import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase credentials are configured
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project') || supabaseAnonKey.includes('your-anon-key')) {
  console.warn('Supabase credentials not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.');
}

export const supabase = supabaseUrl && supabaseAnonKey && !supabaseUrl.includes('your-project') && !supabaseAnonKey.includes('your-anon-key')
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Authentication functions
export const signInWithOTP = async (phone: string) => {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }
  const { data, error } = await supabase.auth.signInWithOtp({
    phone,
    options: {
      shouldCreateUser: true,
    },
  });
  return { data, error };
};

export const verifyOTP = async (phone: string, token: string) => {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }
  const { data, error } = await supabase.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });
  return { data, error };
};

export const signOut = async () => {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  if (!supabase) {
    return null;
  }
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// User management functions
export const createOrUpdateUser = async (userData: {
  phone: string;
  name?: string;
  email?: string;
}) => {
  const { data, error } = await supabase
    .from('users')
    .upsert([userData], { onConflict: 'phone' })
    .select()
    .single();
  return { data, error };
};

export const getUserByPhone = async (phone: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('phone', phone)
    .single();
  return { data, error };
};

// Farm management functions
export const getUserFarms = async (userPhone: string) => {
  if (!supabase) {
    throw new Error('Supabase not configured. Please set up your environment variables.');
  }
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('user_phone', userPhone)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createFarm = async (farmData: any) => {
  const { data, error } = await supabase
    .from('farms')
    .insert([farmData])
    .select()
    .single();
  return { data, error };
};

export const updateFarm = async (farmId: string, farmData: any) => {
  const { data, error } = await supabase
    .from('farms')
    .update(farmData)
    .eq('id', farmId)
    .select()
    .single();
  return { data, error };
};

export const deleteFarm = async (farmId: string) => {
  const { error } = await supabase
    .from('farms')
    .delete()
    .eq('id', farmId);
  return { error };
};

export const getFarmByFieldId = async (fieldId: string) => {
  const { data, error } = await supabase
    .from('farms')
    .select('*')
    .eq('field_id', fieldId)
    .single();
  return { data, error };
};

// Activity management functions
export const getUserActivities = async (userPhone: string, farmId?: string) => {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_phone', userPhone);
  
  if (farmId) {
    query = query.eq('farm_id', farmId);
  }
  
  const { data, error } = await query.order('date', { ascending: true });
  return { data, error };
};

export const createActivity = async (activityData: any) => {
  const { data, error } = await supabase
    .from('activities')
    .insert([activityData])
    .select()
    .single();
  return { data, error };
};

export const updateActivity = async (activityId: string, activityData: any) => {
  const { data, error } = await supabase
    .from('activities')
    .update(activityData)
    .eq('id', activityId)
    .select()
    .single();
  return { data, error };
};

export const deleteActivity = async (activityId: string) => {
  const { error } = await supabase
    .from('activities')
    .delete()
    .eq('id', activityId);
  return { error };
};

export const getActivitiesByDateRange = async (
  userPhone: string,
  startDate: string,
  endDate: string,
  farmId?: string
) => {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_phone', userPhone)
    .gte('date', startDate)
    .lte('date', endDate);
  
  if (farmId) {
    query = query.eq('farm_id', farmId);
  }
  
  const { data, error } = await query.order('date', { ascending: true });
  return { data, error };
};

export const getActivitiesByStatus = async (
  userPhone: string,
  status: string,
  farmId?: string
) => {
  let query = supabase
    .from('activities')
    .select('*')
    .eq('user_phone', userPhone)
    .eq('status', status);
  
  if (farmId) {
    query = query.eq('farm_id', farmId);
  }
  
  const { data, error } = await query.order('date', { ascending: true });
  return { data, error };
};

// User settings functions
export const getUserSettings = async (userPhone: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .select('*')
    .eq('user_phone', userPhone)
    .single();
  return { data, error };
};

export const createOrUpdateUserSettings = async (settingsData: {
  user_phone: string;
  language?: string;
  notifications?: any;
  profile_data?: any;
}) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert([settingsData], { onConflict: 'user_phone' })
    .select()
    .single();
  return { data, error };
};

export const updateUserLanguage = async (userPhone: string, language: string) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert([{ user_phone: userPhone, language }], { onConflict: 'user_phone' })
    .select()
    .single();
  return { data, error };
};

export const updateUserNotifications = async (userPhone: string, notifications: any) => {
  const { data, error } = await supabase
    .from('user_settings')
    .upsert([{ user_phone: userPhone, notifications }], { onConflict: 'user_phone' })
    .select()
    .single();
  return { data, error };
};

// Database utility functions
export const testConnection = async () => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) throw error;
    return { success: true, message: 'Database connection successful' };
  } catch (error: any) {
    return { success: false, message: error.message };
  }
};

// Real-time subscriptions
export const subscribeToFarmUpdates = (userPhone: string, callback: (payload: any) => void) => {
  return supabase
    .channel('farm-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'farms',
        filter: `user_phone=eq.${userPhone}`,
      },
      callback
    )
    .subscribe();
};

export const subscribeToActivityUpdates = (userPhone: string, callback: (payload: any) => void) => {
  return supabase
    .channel('activity-updates')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'activities',
        filter: `user_phone=eq.${userPhone}`,
      },
      callback
    )
    .subscribe();
};