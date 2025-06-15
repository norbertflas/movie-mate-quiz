
import { PageContainer } from "@/components/home/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Download, Calendar, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

const Press = () => {
  const pressReleases = [
    {
      title: "MovieFinder Launches Advanced AI Recommendations",
      date: "2024-06-01",
      description: "New machine learning algorithms provide more accurate movie suggestions based on viewing history and preferences."
    },
    {
      title: "MovieFinder Reaches 1 Million Users Milestone",
      date: "2024-05-15",
      description: "Platform celebrates significant growth in user base and movie discovery engagement."
    },
    {
      title: "Partnership with Major Streaming Services Announced",
      date: "2024-04-20",
      description: "New integrations provide real-time availability across multiple streaming platforms."
    }
  ];

  const mediaKit = [
    { name: "Company Logo (PNG)", size: "2.3 MB" },
    { name: "Company Logo (SVG)", size: "15 KB" },
    { name: "Screenshots Package", size: "8.7 MB" },
    { name: "Brand Guidelines", size: "1.2 MB" }
  ];

  return (
    <PageContainer>
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl font-bold">Press & Media</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Latest news, press releases, and media resources for MovieFinder.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Press Releases
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pressReleases.map((release, index) => (
                  <motion.div
                    key={release.title}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="border-l-2 border-primary/20 pl-4 space-y-2"
                  >
                    <h3 className="font-semibold">{release.title}</h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(release.date).toLocaleDateString()}
                    </div>
                    <p className="text-sm text-muted-foreground">{release.description}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Read More
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  Media Kit
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {mediaKit.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{item.size}</p>
                    </div>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </motion.div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Press Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">Sarah Johnson</p>
                  <p className="text-sm text-muted-foreground">Head of Communications</p>
                </div>
                <div>
                  <p className="text-sm">press@moviefinder.com</p>
                  <p className="text-sm">+1 (555) 123-4567</p>
                </div>
                <Button className="w-full mt-4">
                  Contact Press Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Press;
