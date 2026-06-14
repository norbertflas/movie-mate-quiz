import { getUserPreferences } from "@/services/preferences";

export const getPlatformScore = async (platform: string): Promise<{ score: number; explanation: string }> => {
  try {
    const preferences = await getUserPreferences();

    if (preferences.includes(platform)) {
      return {
        score: 1,
        explanation: `Available on your preferred platform: ${platform}`
      };
    }

    return { score: 0, explanation: "" };
  } catch (error) {
    console.error('Error in platform scoring:', error);
    return { score: 0, explanation: "" };
  }
};
