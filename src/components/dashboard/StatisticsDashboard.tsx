import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface ViewingStats {
  totalWatched: number;
  favoriteGenre: string;
  averageRating: number;
  genreDistribution: { name: string; count: number; }[];
}

export const StatisticsDashboard = () => {
  const { t } = useTranslation();

  const { data: stats, isLoading } = useQuery({
    queryKey: ['viewingStats'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: watched } = await supabase
        .from('watched_movies')
        .select('*')
        .eq('user_id', user.id);

      const { data: favorites } = await supabase
        .from('saved_movies')
        .select('*')
        .eq('user_id', user.id);

      // Calculate statistics
      const totalWatched = watched?.length || 0;
      const averageRating = watched?.reduce((acc, movie) => acc + (movie.rating || 0), 0) / totalWatched || 0;

      return {
        totalWatched,
        averageRating: Math.round(averageRating * 10) / 10,
        favoriteCount: favorites?.length || 0,
        genreDistribution: [
          { name: t('movie.action'), count: 5 },
          { name: t('movie.comedy'), count: 3 },
          { name: t('movie.drama'), count: 7 },
        ]
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-6"
    >
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('stats.overview')}</h3>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground">{t('stats.totalWatched')}</p>
            <p className="text-2xl font-bold">{stats?.totalWatched}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('stats.averageRating')}</p>
            <p className="text-2xl font-bold">{stats?.averageRating}/10</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{t('stats.favoriteCount')}</p>
            <p className="text-2xl font-bold">{stats?.favoriteCount}</p>
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{t('stats.genreDistribution')}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stats?.genreDistribution}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </motion.div>
  );
};