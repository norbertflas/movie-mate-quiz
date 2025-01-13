import { supabase } from "@/integrations/supabase/client";

export const getPlatformScore = async (platform: string): Promise<{ score: number; explanation: string }> => {
  try {
    const userPreferences = await supabase
      .from('user_streaming_preferences')
      .select('service_id')
      .eq('user_id', (await supabase.auth.getUser()).data.user?.id);

    if (userPreferences.data?.some(pref => pref.service_id === platform)) {
      return { 
        score: 1, 
        explanation: `Available on your preferred platform: ${platform}` 
      };
    }
    
    return { score: 0, explanation: "" };
  } catch (error) {
    console.error('Error fetching platform preferences:', error);
    return { score: 0, explanation: "" };
  }
};