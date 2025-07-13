
import { PageContainer } from "@/components/home/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";

const Privacy = () => {
  return (
    <PageContainer>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">Privacy Policy</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn how we collect, use, and protect your personal information.
          </p>
        </motion.div>

        <Card>
          <CardHeader>
            <CardTitle>Privacy Policy</CardTitle>
            <p className="text-sm text-muted-foreground">Last updated: June 15, 2025</p>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[600px] pr-4">
              <div className="space-y-6">
                <section>
                  <h3 className="text-lg font-semibold mb-3">1. Information We Collect</h3>
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium">Personal Information</h4>
                      <p className="text-muted-foreground">When you create an account, we collect your email address, username, and any profile information you choose to provide.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Usage Information</h4>
                      <p className="text-muted-foreground">We collect information about how you use our service, including movies you view, rate, and add to your watchlist.</p>
                    </div>
                    <div>
                      <h4 className="font-medium">Technical Information</h4>
                      <p className="text-muted-foreground">We automatically collect certain technical information such as your IP address, browser type, device information, and usage analytics.</p>
                    </div>
                  </div>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">2. How We Use Your Information</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>To provide and improve our movie recommendation service</li>
                    <li>To personalize your experience and content</li>
                    <li>To communicate with you about updates and new features</li>
                    <li>To analyze usage patterns and improve our algorithms</li>
                    <li>To ensure the security and integrity of our service</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">3. Information Sharing</h3>
                  <p className="text-muted-foreground mb-3">
                    We do not sell, trade, or otherwise transfer your personal information to third parties without your consent, except in the following circumstances:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>With service providers who help us operate our platform</li>
                    <li>When required by law or to protect our rights</li>
                    <li>In connection with a business transfer or merger</li>
                    <li>With your explicit consent</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">4. Data Security</h3>
                  <p className="text-muted-foreground">
                    We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. This includes encryption, secure servers, and regular security audits.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">5. Cookies and Tracking</h3>
                  <p className="text-muted-foreground mb-3">
                    We use cookies and similar tracking technologies to enhance your experience. This includes:
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Essential cookies for website functionality</li>
                    <li>Analytics cookies to understand usage patterns</li>
                    <li>Preference cookies to remember your settings</li>
                    <li>Marketing cookies for personalized content</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">6. Your Rights</h3>
                  <p className="text-muted-foreground mb-3">You have the right to:</p>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Access and update your personal information</li>
                    <li>Delete your account and associated data</li>
                    <li>Opt out of marketing communications</li>
                    <li>Request a copy of your data</li>
                    <li>Withdraw consent for data processing</li>
                  </ul>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">7. Data Retention</h3>
                  <p className="text-muted-foreground">
                    We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete your personal data within 30 days.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">8. International Data Transfers</h3>
                  <p className="text-muted-foreground">
                    Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place to protect your data during these transfers.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">9. Children's Privacy</h3>
                  <p className="text-muted-foreground">
                    Our service is not intended for children under 13. We do not knowingly collect personal information from children under 13. If we become aware of such collection, we will delete the information immediately.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">10. Changes to This Policy</h3>
                  <p className="text-muted-foreground">
                    We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date.
                  </p>
                </section>

                <Separator />

                <section>
                  <h3 className="text-lg font-semibold mb-3">11. Contact Us</h3>
                  <p className="text-muted-foreground">
                    If you have any questions about this privacy policy, please contact us at privacy@moviefinder.com or through our contact page.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Privacy;
