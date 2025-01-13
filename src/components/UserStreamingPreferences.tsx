import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Checkbox } from "./ui/checkbox";
import { useToast } from "./ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";

interface StreamingService {
  id: string;
  name: string;
  logo_url: string | null;
}

export const UserStreamingPreferences = () => {
  const [services, setServices] = useState<StreamingService[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    fetchStreamingServices();
    fetchUserPreferences();
  }, []);

  const fetchStreamingServices = async () => {
    const { data, error } = await supabase
      .from('streaming_services')
      .select('*');
    
    if (error) {
      toast({
        variant: "destructive",
        title: t("errors.loadingServices"),
        description: error.message,
      });
    } else if (data) {
      setServices(data);
    }
    setIsLoading(false);
  };

  const fetchUserPreferences = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: preferences, error } = await supabase
      .from('user_streaming_preferences')
      .select('service_id')
      .eq('user_id', user.id);
    
    if (error) {
      toast({
        variant: "destructive",
        title: t("errors.loadingPreferences"),
        description: error.message,
      });
    } else if (preferences) {
      setSelectedServices(preferences.map(pref => pref.service_id));
    }
  };

  const handleServiceToggle = async (serviceId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        variant: "destructive",
        title: t("errors.auth"),
        description: t("errors.notAuthenticated"),
      });
      return;
    }

    const isSelected = selectedServices.includes(serviceId);
    
    if (isSelected) {
      const { error } = await supabase
        .from('user_streaming_preferences')
        .delete()
        .eq('service_id', serviceId)
        .eq('user_id', user.id);
      
      if (error) {
        toast({
          variant: "destructive",
          title: t("errors.removingService"),
          description: error.message,
        });
        return;
      }
    } else {
      const { error } = await supabase
        .from('user_streaming_preferences')
        .insert({ 
          service_id: serviceId,
          user_id: user.id
        });
      
      if (error) {
        toast({
          variant: "destructive",
          title: t("errors.addingService"),
          description: error.message,
        });
        return;
      }
    }

    setSelectedServices(prev =>
      isSelected
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );

    toast({
      title: t(isSelected ? "services.removed" : "services.added"),
      description: t("services.preferencesUpdated"),
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse p-4 space-y-4">
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <Card className="shadow-lg bg-gradient-to-br from-background/80 to-background border-blue-600/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
          {t("services.preferences")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {services.map((service) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center space-x-2 p-3 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <Checkbox
              id={service.id}
              checked={selectedServices.includes(service.id)}
              onCheckedChange={() => handleServiceToggle(service.id)}
              className="data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
            />
            <div className="flex items-center space-x-2">
              {service.logo_url && (
                <img
                  src={service.logo_url}
                  alt={service.name}
                  className="w-6 h-6 object-contain"
                />
              )}
              <label
                htmlFor={service.id}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                {service.name}
              </label>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};