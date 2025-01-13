import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getFavoriteCreators, removeFavoriteCreator, type Creator } from "@/services/creators";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("creators.favoriteCreators")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {creators?.map((creator: Creator) => (
            <div
              key={creator.id}
              className="p-4 border rounded-lg flex items-center justify-between bg-card hover:bg-accent transition-colors"
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
          {creators?.length === 0 && (
            <p className="text-muted-foreground col-span-full text-center py-4">
              {t("creators.noFavorites")}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};