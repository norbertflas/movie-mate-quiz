import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFavoriteCreators, removeFavoriteCreator, type Creator } from "@/services/creators";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";

export const FavoriteCreators = () => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: creators, isLoading } = useQuery({
    queryKey: ['favoriteCreators'],
    queryFn: getFavoriteCreators,
  });

  const removeMutation = useMutation({
    mutationFn: removeFavoriteCreator,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoriteCreators'] });
      toast({
        title: t("creators.removed"),
        description: t("creators.removedDescription"),
      });
    },
    onError: () => {
      toast({
        title: t("errors.title"),
        description: t("errors.removeCreator"),
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return <div className="animate-pulse h-48 bg-muted rounded-lg" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{t("creators.favoriteCreators")}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {creators?.map((creator: Creator) => (
          <div
            key={creator.id}
            className="p-4 border rounded-lg flex items-center justify-between"
          >
            <div>
              <h3 className="font-medium">{creator.name}</h3>
              <p className="text-sm text-muted-foreground">{creator.role}</p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => removeMutation.mutate(creator.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
};