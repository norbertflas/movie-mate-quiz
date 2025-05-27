
import { useState, useEffect } from 'react';
import { WifiOff, Wifi } from 'lucide-react';
import { Badge } from './ui/badge';
import { motion, AnimatePresence } from 'framer-motion';

export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showOfflineMessage, setShowOfflineMessage] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowOfflineMessage(false);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowOfflineMessage(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {showOfflineMessage && (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50"
        >
          <Badge 
            variant="destructive" 
            className="px-3 py-2 flex items-center gap-2"
          >
            <WifiOff className="h-3 w-3" />
            You're offline. Some features may be limited.
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
