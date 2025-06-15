
import { PageContainer } from "@/components/home/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Cookie, Settings, Shield, BarChart } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Cookies = () => {
  const [cookieSettings, setCookieSettings] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    preferences: true
  });
  const { toast } = useToast();

  const handleSaveSettings = () => {
    toast({
      title: "Cookie Settings Saved",
      description: "Your cookie preferences have been updated successfully.",
    });
  };

  const cookieTypes = [
    {
      id: "essential",
      name: "Essential Cookies",
      icon: Shield,
      description: "These cookies are necessary for the website to function and cannot be switched off.",
      required: true,
      examples: ["Authentication", "Security", "Session management"]
    },
    {
      id: "analytics",
      name: "Analytics Cookies",
      icon: BarChart,
      description: "These cookies help us understand how visitors interact with our website.",
      required: false,
      examples: ["Page views", "User behavior", "Performance metrics"]
    },
    {
      id: "preferences",
      name: "Preference Cookies",
      icon: Settings,
      description: "These cookies remember your settings and preferences for a better experience.",
      required: false,
      examples: ["Theme selection", "Language preference", "Filter settings"]
    },
    {
      id: "marketing",
      name: "Marketing Cookies",
      icon: Cookie,
      description: "These cookies are used to make advertising messages more relevant to you.",
      required: false,
      examples: ["Personalized ads", "Social media integration", "Retargeting"]
    }
  ];

  return (
    <PageContainer>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">Cookie Policy</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn about how we use cookies and manage your preferences.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>What Are Cookies?</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4 text-sm">
                    <p className="text-muted-foreground">
                      Cookies are small text files that are placed on your computer or mobile device when you visit our website. They help us provide you with a better experience by remembering your preferences and understanding how you use our site.
                    </p>

                    <section>
                      <h4 className="font-semibold mb-2">How We Use Cookies</h4>
                      <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-4">
                        <li>To keep you signed in to your account</li>
                        <li>To remember your preferences and settings</li>
                        <li>To analyze website traffic and usage patterns</li>
                        <li>To improve our services and user experience</li>
                        <li>To provide personalized content and recommendations</li>
                      </ul>
                    </section>

                    <section>
                      <h4 className="font-semibold mb-2">Third-Party Cookies</h4>
                      <p className="text-muted-foreground">
                        Some cookies are set by third-party services that appear on our pages. We use services like Google Analytics to help us understand how our website is being used. These services may set their own cookies.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold mb-2">Managing Cookies</h4>
                      <p className="text-muted-foreground">
                        You can control and manage cookies in various ways. Please note that removing or blocking cookies can impact your user experience and parts of our website may no longer be accessible or function properly.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold mb-2">Browser Settings</h4>
                      <p className="text-muted-foreground">
                        Most web browsers allow you to control cookies through their settings. You can usually find these settings in the "Options" or "Preferences" menu of your browser.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Cookie Categories</h2>
              {cookieTypes.map((type, index) => (
                <motion.div
                  key={type.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <type.icon className="h-5 w-5 text-primary mt-1" />
                          <div className="space-y-2 flex-1">
                            <h3 className="font-semibold">{type.name}</h3>
                            <p className="text-sm text-muted-foreground">{type.description}</p>
                            <div>
                              <p className="text-xs font-medium mb-1">Examples:</p>
                              <div className="flex flex-wrap gap-1">
                                {type.examples.map((example) => (
                                  <span key={example} className="text-xs bg-muted px-2 py-1 rounded">
                                    {example}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {type.required ? (
                            <span className="text-xs text-muted-foreground">Required</span>
                          ) : (
                            <Switch
                              checked={cookieSettings[type.id as keyof typeof cookieSettings]}
                              onCheckedChange={(checked) =>
                                setCookieSettings(prev => ({ ...prev, [type.id]: checked }))
                              }
                            />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Cookie Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Customize your cookie preferences below. Essential cookies cannot be disabled as they are required for the website to function.
                </p>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Essential</span>
                    <span className="text-xs text-muted-foreground">Always On</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Analytics</span>
                    <Switch
                      checked={cookieSettings.analytics}
                      onCheckedChange={(checked) =>
                        setCookieSettings(prev => ({ ...prev, analytics: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Preferences</span>
                    <Switch
                      checked={cookieSettings.preferences}
                      onCheckedChange={(checked) =>
                        setCookieSettings(prev => ({ ...prev, preferences: checked }))
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Marketing</span>
                    <Switch
                      checked={cookieSettings.marketing}
                      onCheckedChange={(checked) =>
                        setCookieSettings(prev => ({ ...prev, marketing: checked }))
                      }
                    />
                  </div>
                </div>

                <Button onClick={handleSaveSettings} className="w-full">
                  Save Settings
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  If you have questions about our use of cookies, please contact us.
                </p>
                <Button variant="outline" className="w-full">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Cookies;
