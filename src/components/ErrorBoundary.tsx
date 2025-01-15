import React from "react";
import { Button } from "./ui/button";
import { motion } from "framer-motion";

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full space-y-6 text-center"
          >
            <div className="space-y-4">
              <h2 className="text-2xl font-bold tracking-tight">Oops! Something went wrong</h2>
              <p className="text-muted-foreground">
                We're sorry for the inconvenience. Please try refreshing the page.
              </p>
            </div>
            
            <div className="space-y-4">
              <Button
                onClick={() => window.location.reload()}
                className="w-full"
                size="lg"
              >
                Refresh Page
              </Button>
              <Button
                onClick={() => window.location.href = '/'}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Go to Homepage
              </Button>
            </div>
          </motion.div>
        </div>
      );
    }

    return this.props.children;
  }
}