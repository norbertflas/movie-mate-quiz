
import { 
  Settings, 
  Palette, 
  Globe, 
  Volume2, 
  VolumeX, 
  Monitor,
  Smartphone,
  Sun,
  Moon,
  Zap
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { useTheme } from '@/hooks/use-theme';
import { motion } from 'framer-motion';

interface QuickSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const QuickSettings = ({ open, onOpenChange }: QuickSettingsProps) => {
  const [soundEnabled, setSoundEnabled] = useLocalStorage('sound_enabled', true);
  const [animationsEnabled, setAnimationsEnabled] = useLocalStorage('animations_enabled', true);
  const [notificationsEnabled, setNotificationsEnabled] = useLocalStorage('notifications_enabled', true);
  const [autoplay, setAutoplay] = useLocalStorage('autoplay_trailers', false);
  const [reducedMotion, setReducedMotion] = useLocalStorage('reduced_motion', false);
  const [language, setLanguage] = useLocalStorage('language', 'en');
  
  const { theme, setTheme } = useTheme();

  const settings = [
    {
      category: "Appearance",
      icon: Palette,
      items: [
        {
          label: "Dark Mode",
          description: "Toggle between light and dark themes",
          control: (
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4" />
              <Switch 
                checked={theme === 'dark'} 
                onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
              />
              <Moon className="h-4 w-4" />
            </div>
          )
        },
        {
          label: "Reduced Motion",
          description: "Minimize animations and transitions",
          control: (
            <Switch 
              checked={reducedMotion} 
              onCheckedChange={setReducedMotion}
            />
          )
        }
      ]
    },
    {
      category: "Experience",
      icon: Zap,
      items: [
        {
          label: "Sound Effects",
          description: "Play sounds for interactions",
          control: (
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              <Switch 
                checked={soundEnabled} 
                onCheckedChange={setSoundEnabled}
              />
            </div>
          )
        },
        {
          label: "Autoplay Trailers",
          description: "Automatically play movie trailers",
          control: (
            <Switch 
              checked={autoplay} 
              onCheckedChange={setAutoplay}
            />
          )
        },
        {
          label: "Enhanced Animations",
          description: "Enable rich motion and effects",
          control: (
            <Switch 
              checked={animationsEnabled} 
              onCheckedChange={setAnimationsEnabled}
            />
          )
        }
      ]
    },
    {
      category: "Notifications",
      icon: Globe,
      items: [
        {
          label: "Push Notifications",
          description: "Receive recommendations and updates",
          control: (
            <Switch 
              checked={notificationsEnabled} 
              onCheckedChange={setNotificationsEnabled}
            />
          )
        }
      ]
    }
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
    { code: 'pl', name: 'Polski', flag: '🇵🇱' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 gap-0 max-h-[80vh] overflow-hidden">
        <DialogHeader className="p-4 pb-2">
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Settings
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Language Selection */}
            <div>
              <Label className="text-sm font-medium">Language</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {languages.map((lang) => (
                  <Button
                    key={lang.code}
                    variant={language === lang.code ? "default" : "outline"}
                    size="sm"
                    onClick={() => setLanguage(lang.code)}
                    className="justify-start"
                  >
                    <span className="mr-2">{lang.flag}</span>
                    {lang.name}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Settings Categories */}
            {settings.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <category.icon className="h-4 w-4 text-primary" />
                  <Label className="text-sm font-medium">{category.category}</Label>
                </div>
                
                <div className="space-y-4">
                  {category.items.map((item, itemIndex) => (
                    <div key={itemIndex} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-medium">{item.label}</Label>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {item.description}
                        </p>
                      </div>
                      {item.control}
                    </div>
                  ))}
                </div>
                
                {categoryIndex < settings.length - 1 && (
                  <Separator className="mt-4" />
                )}
              </motion.div>
            ))}

            {/* Device Info */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Monitor className="h-4 w-4" />
                <Label className="text-sm font-medium">Device Info</Label>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-muted-foreground">Screen:</span>
                  <br />
                  {typeof window !== 'undefined' ? `${window.screen.width}×${window.screen.height}` : 'N/A'}
                </div>
                <div>
                  <span className="text-muted-foreground">Connection:</span>
                  <br />
                  {typeof navigator !== 'undefined' ? (navigator.onLine ? 'Online' : 'Offline') : 'N/A'}
                </div>
              </div>
            </div>

            {/* Performance Badge */}
            <div className="flex justify-center">
              <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
                Performance: Excellent
              </Badge>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Settings auto-saved</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Reset to defaults
                setSoundEnabled(true);
                setAnimationsEnabled(true);
                setNotificationsEnabled(true);
                setAutoplay(false);
                setReducedMotion(false);
                setLanguage('en');
                setTheme('dark');
              }}
            >
              Reset to Defaults
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
