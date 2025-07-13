
import { useState, useEffect } from 'react';
import { Bell, X } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocalStorage } from '@/hooks/use-local-storage';

export const NotificationPermission = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [permissionAsked, setPermissionAsked] = useLocalStorage('notification_permission_asked', false);

  useEffect(() => {
    // Show notification permission prompt after user has been active for 2 minutes
    if (!permissionAsked && 'Notification' in window && Notification.permission === 'default') {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 120000); // 2 minutes

      return () => clearTimeout(timer);
    }
  }, [permissionAsked]);

  const handleAllow = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification('MovieFinder', {
          body: 'You\'ll now receive notifications about new recommendations!',
          icon: '/icons/icon-192x192.png'
        });
      }
    }
    setPermissionAsked(true);
    setShowPrompt(false);
  };

  const handleDeny = () => {
    setPermissionAsked(true);
    setShowPrompt(false);
  };

  if (!showPrompt || !('Notification' in window)) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed top-20 right-4 z-50 max-w-sm"
      >
        <Card className="border-primary/20 bg-background/95 backdrop-blur-lg">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <Bell className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-sm">Stay Updated</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Get notified about new movie recommendations tailored for you
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDeny}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={handleAllow} className="flex-1">
                Allow
              </Button>
              <Button variant="outline" size="sm" onClick={handleDeny}>
                Not Now
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};
