import { Auth as SupabaseAuth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import type { AuthError } from '@supabase/supabase-js';

const Auth = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const { t } = useTranslation();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="container max-w-lg mx-auto px-4 py-8"
    >
      <Card className="p-6 space-y-6 bg-gradient-to-br from-background/80 via-background/50 to-purple-500/5">
        <h1 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600 bg-clip-text text-transparent">
          {t('auth.welcome')}
        </h1>
        
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: 'rgb(124 58 237)',
                  brandAccent: 'rgb(139 92 246)',
                },
              },
            },
          }}
          providers={['google']}
          redirectTo={window.location.origin}
        />
      </Card>
    </motion.div>
  );
};

export default Auth;