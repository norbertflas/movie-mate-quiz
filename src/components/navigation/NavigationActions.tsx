
import { motion } from 'framer-motion';
import { Search, Sparkles, Command, Bell, Settings } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserActions } from './UserActions';
import { useIsMobile } from '@/hooks/use-mobile';

interface NavigationActionsProps {
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  onSettingsClick: () => void;
  unreadCount: number;
}

export const NavigationActions = ({
  onSearchClick,
  onNotificationsClick,
  onSettingsClick,
  unreadCount
}: NavigationActionsProps) => {
  const isMobile = useIsMobile();

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.2 }}
      className="flex items-center gap-1 md:gap-2 md:w-1/4 justify-end"
    >
      {/* Search Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onSearchClick}
              className="relative p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-all duration-200 hover:text-primary flex items-center gap-1 group"
            >
              <Search className="h-4 w-4" />
              {!isMobile && (
                <>
                  <span className="hidden sm:inline text-sm font-medium">Search</span>
                  <div className="hidden lg:flex items-center gap-1 ml-2 px-2 py-1 bg-muted/50 rounded text-xs text-muted-foreground">
                    <Command className="h-3 w-3" />
                    K
                  </div>
                </>
              )}
              <motion.span 
                className="absolute -right-1 -top-1" 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <Sparkles className="h-3 w-3 text-primary" />
              </motion.span>
            </motion.button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Search movies {!isMobile && "(⌘K)"}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Notifications Button */}
      {!isMobile && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onNotificationsClick}
                className="relative p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-all duration-200 hover:text-primary"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                  >
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </Badge>
                )}
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Notifications {unreadCount > 0 && `(${unreadCount})`}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {/* Quick Settings */}
      {!isMobile && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSettingsClick}
                className="p-2 rounded-full bg-muted/30 hover:bg-primary/20 transition-all duration-200 hover:text-primary"
              >
                <Settings className="h-4 w-4" />
              </motion.button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Quick Settings</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
      
      <UserActions />
    </motion.div>
  );
};
