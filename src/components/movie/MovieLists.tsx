import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { ListPlus, Share2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { createMovieList, getMovieLists, type MovieList } from "@/services/movieLists";

export const MovieLists = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const { data: lists, isLoading } = useQuery({
    queryKey: ['movie-lists'],
    queryFn: getMovieLists,
  });

  const createList = useMutation({
    mutationFn: createMovieList,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['movie-lists'] });
      setIsOpen(false);
      setName("");
      setDescription("");
      setIsPublic(false);
      toast({
        title: t("movieLists.created"),
        description: t("movieLists.createdDescription"),
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

  const handleCreateList = () => {
    if (!name.trim()) {
      toast({
        title: t("common.error"),
        description: t("movieLists.nameRequired"),
        variant: "destructive",
      });
      return;
    }

    createList.mutate({
      name,
      description: description || undefined,
      is_public: isPublic,
    });
  };

  return (
    <div className="space-y-4 px-4 sm:px-0">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">{t("movieLists.myLists")}</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="w-full sm:w-auto">
              <ListPlus className="mr-2 h-4 w-4" />
              <span className="text-sm">{t("movieLists.createList")}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t("movieLists.createList")}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("movieLists.name")}</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t("movieLists.namePlaceholder")}
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("movieLists.description")}</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={t("movieLists.descriptionPlaceholder")}
                  className="w-full"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public"
                  checked={isPublic}
                  onCheckedChange={setIsPublic}
                />
                <Label htmlFor="public">{t("movieLists.makePublic")}</Label>
              </div>
              <Button onClick={handleCreateList} className="w-full">
                {t("movieLists.create")}
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
          {lists?.map((list: MovieList) => (
            <Card key={list.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle className="text-xl break-words">{list.name}</CardTitle>
                  {list.is_public && (
                    <Share2 className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                {list.description && (
                  <p className="text-sm text-muted-foreground break-words">{list.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {new Date(list.created_at).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};