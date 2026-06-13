import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useToast } from "./ui/use-toast";
import { getStreamingServices, getUserPreferences, setUserPreferences } from "@/services/preferences";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { ServiceList } from "./streaming/ServiceList";
import type { StreamingService } from "@/types/streaming";

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
    try {
      const data = await getStreamingServices();
      setServices(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Loading Services",
        description: error instanceof Error ? error.message : "Failed to load services",
      });
    }
    setIsLoading(false);
  };

  const fetchUserPreferences = async () => {
    try {
      const preferences = await getUserPreferences();
      setSelectedServices(preferences);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Loading Preferences",
        description: error instanceof Error ? error.message : "Failed to load preferences",
      });
    }
  };

  const handleServiceToggle = async (serviceId: string) => {
    const isSelected = selectedServices.includes(serviceId);
    const next = isSelected
      ? selectedServices.filter(id => id !== serviceId)
      : [...selectedServices, serviceId];

    try {
      await setUserPreferences(next);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Updating Preferences",
        description: error instanceof Error ? error.message : "You must be logged in to manage streaming preferences",
      });
      return;
    }

    setSelectedServices(next);

    toast({
      title: isSelected ? "Service Removed" : "Service Added",
      description: "Your streaming preferences have been updated",
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
    <Card className="shadow-xl bg-gradient-to-br from-background/80 via-background/50 to-purple-500/5 dark:from-background/80 dark:via-background/50 dark:to-purple-500/10 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-accent/20">
      <CardHeader>
        <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
          Streaming Services
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <ServiceList
          services={services}
          selectedServices={selectedServices}
          onServiceToggle={handleServiceToggle}
        />
      </CardContent>
    </Card>
  );
};