
import { PageContainer } from "@/components/home/PageContainer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, DollarSign, Clock, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

const Refunds = () => {
  const refundSteps = [
    {
      step: 1,
      title: "Submit Request",
      description: "Contact our support team with your refund request and reason."
    },
    {
      step: 2,
      title: "Review Process",
      description: "We'll review your request within 24-48 hours."
    },
    {
      step: 3,
      title: "Approval",
      description: "If approved, you'll receive confirmation via email."
    },
    {
      step: 4,
      title: "Processing",
      description: "Refunds are processed back to your original payment method."
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
          <h1 className="text-4xl font-bold">Refund Policy</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Learn about our refund policy and how to request a refund.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Current Status
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="space-y-4">
                  <Badge variant="secondary" className="text-lg px-4 py-2">
                    MovieFinder is FREE
                  </Badge>
                  <p className="text-muted-foreground">
                    MovieFinder is completely free to use. All features including movie recommendations, 
                    streaming availability, and watchlist management are available at no cost.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Since our service is free, there are no charges to refund. This policy is provided 
                    for transparency and potential future premium features.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Future Premium Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If we introduce premium features in the future, our refund policy will include:
                </p>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>30-day money-back guarantee</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Pro-rated refunds for annual subscriptions</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>No questions asked cancellation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Quick processing (3-5 business days)</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5" />
                  Refund Process
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {refundSteps.map((step, index) => (
                    <motion.div
                      key={step.step}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0 w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-primary">{step.step}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about our refund policy or need assistance with your account, 
                  our support team is here to help.
                </p>
                <div className="space-y-2">
                  <Button className="w-full">
                    Contact Support
                  </Button>
                  <Button variant="outline" className="w-full">
                    Visit Help Center
                  </Button>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Email: support@moviefinder.com</p>
                  <p>Response time: Usually within 24 hours</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Refunds;
