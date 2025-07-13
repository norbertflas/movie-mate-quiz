
import { PageContainer } from "@/components/home/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Copyright as CopyrightIcon, FileText, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Copyright = () => {
  const [dmcaForm, setDmcaForm] = useState({
    name: "",
    email: "",
    copyrightWork: "",
    infringingContent: "",
    statement: ""
  });
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast({
      title: "DMCA Notice Submitted",
      description: "We have received your copyright notice and will review it within 24 hours.",
    });
    setDmcaForm({
      name: "",
      email: "",
      copyrightWork: "",
      infringingContent: "",
      statement: ""
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setDmcaForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <PageContainer>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">Copyright & DMCA</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Information about copyright policies and how to report copyright infringement.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CopyrightIcon className="h-5 w-5" />
                  Copyright Policy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[400px] pr-4">
                  <div className="space-y-4 text-sm">
                    <section>
                      <h4 className="font-semibold mb-2">Our Commitment</h4>
                      <p className="text-muted-foreground">
                        MovieFinder respects the intellectual property rights of others and expects our users to do the same. We comply with the Digital Millennium Copyright Act (DMCA) and will respond to valid copyright infringement notices.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold mb-2">Content Sources</h4>
                      <p className="text-muted-foreground">
                        All movie information, including titles, descriptions, and metadata, is sourced from public databases and APIs. Movie posters and images are used under fair use provisions for informational purposes.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold mb-2">User-Generated Content</h4>
                      <p className="text-muted-foreground">
                        Users are responsible for ensuring that any content they submit (reviews, ratings, comments) does not infringe on third-party copyrights. We reserve the right to remove infringing content without notice.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold mb-2">Reporting Infringement</h4>
                      <p className="text-muted-foreground">
                        If you believe your copyright has been infringed, please submit a DMCA notice using the form on this page. We will investigate all valid claims promptly.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold mb-2">Repeat Infringers</h4>
                      <p className="text-muted-foreground">
                        We have a policy of terminating accounts of users who are repeat copyright infringers in appropriate circumstances.
                      </p>
                    </section>

                    <section>
                      <h4 className="font-semibold mb-2">Counter-Notices</h4>
                      <p className="text-muted-foreground">
                        If you believe content was removed in error, you may submit a counter-notice. Please contact our legal team for guidance on this process.
                      </p>
                    </section>
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Submit DMCA Notice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Full Name</label>
                    <Input
                      name="name"
                      value={dmcaForm.name}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Email Address</label>
                    <Input
                      name="email"
                      type="email"
                      value={dmcaForm.email}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description of Copyrighted Work</label>
                    <Textarea
                      name="copyrightWork"
                      placeholder="Describe the copyrighted work that you believe has been infringed"
                      value={dmcaForm.copyrightWork}
                      onChange={handleChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Location of Infringing Content</label>
                    <Textarea
                      name="infringingContent"
                      placeholder="Provide the URL or specific location of the allegedly infringing content"
                      value={dmcaForm.infringingContent}
                      onChange={handleChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">Good Faith Statement</label>
                    <Textarea
                      name="statement"
                      placeholder="I have a good faith belief that the use of the material is not authorized by the copyright owner, its agent, or the law."
                      value={dmcaForm.statement}
                      onChange={handleChange}
                      rows={3}
                      required
                    />
                  </div>

                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-xs text-muted-foreground">
                      By submitting this form, you swear under penalty of perjury that the information is accurate and that you are the copyright owner or authorized to act on behalf of the owner.
                    </p>
                  </div>

                  <Button type="submit" className="w-full">
                    Submit DMCA Notice
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Alternative Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">DMCA Agent</p>
                  <p className="text-sm text-muted-foreground">MovieFinder Legal Team</p>
                </div>
                <div>
                  <p className="text-sm">Email: dmca@moviefinder.com</p>
                  <p className="text-sm">Phone: +1 (555) 123-4567</p>
                </div>
                <div>
                  <p className="text-sm">
                    123 Movie Street<br />
                    Los Angeles, CA 90210<br />
                    United States
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Copyright;
