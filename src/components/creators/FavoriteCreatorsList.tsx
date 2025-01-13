import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { UserPlus, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";

interface Creator {
  id: string;
  name: string;
  role: string;
  tmdb_person_id: number;
}

export const FavoriteCreatorsList = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [role, setRole] = useState<string>();
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: creators, isLoading } = useQuery({
    queryKey: ['favorite-creators'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('favorite_creators')
        .select('*');
      
      if (error) throw error;
      return data as Creator[];
    },
  });

  const addCreator = useMutation({
    mutationFn: async (creator: { name: string; role: string }) => {
      const { error } = await supabase
        .from('favorite_creators')
        .insert([
          { 
            name: creator.name,
            role: creator.role,
            tmdb_person_id: 0 // We'll implement TMDB search in a future update
          }
        ]);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-creators'] });
      setIsOpen(false);
      setName("");
      setRole(undefined);
      toast({
        title: t("creators.added"),
        description: t("creators.addedDescription"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const removeCreator = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('favorite_creators')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorite-creators'] });
      toast({
        title: t("creators.removed"),
        description: t("creators.removedDescription"),
      });
    },
    onError: (error) => {
      toast({
        title: t("common.error"),
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleAddCreator = () => {
    if (!name.trim() || !role) {
      toast({
        title: t("common.error"),
        description: t("creators.requiredFields"),
        variant: "destructive",
      });
      return;
    }

    addCreator.mutate({ name, role });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">{t("creators.favoriteCreators")}</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              {t("creators.add")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t("creators.add")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("creators.name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("creators.namePlaceholder")}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">{t("creators.role")}</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder={t("creators.selectRole")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="director">Director</SelectItem>
                    <SelectItem value="actor">Actor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleAddCreator} className="w-full">
                {t("creators.add")}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-gray-200 dark:bg-gray-800" />
              <CardContent className="h-12 bg-gray-100 dark:bg-gray-700" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators?.map((creator) => (
            <Card key={creator.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl">{creator.name}</CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCreator.mutate(creator.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground capitalize">
                  {creator.role}
                </p>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};