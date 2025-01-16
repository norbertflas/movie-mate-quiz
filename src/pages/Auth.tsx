import { useState } from "react";
import { Auth as SupabaseAuth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const { toast } = useToast();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container max-w-md mx-auto p-4"
    >
      <Card className="p-6">
        <SupabaseAuth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: "rgb(99, 102, 241)",
                  brandAccent: "rgb(79, 70, 229)",
                },
              },
            },
            className: {
              button: "!bg-primary hover:!bg-primary/90",
              container: "!gap-6",
              divider: "!bg-border",
              label: "!text-foreground",
              input: "!bg-background",
              message: "!text-destructive",
            },
          }}
          theme="default"
          providers={['google']}
          redirectTo={window.location.origin}
        />
      </Card>
    </motion.div>
  );
};

export default Auth;