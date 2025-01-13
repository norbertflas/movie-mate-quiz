import { useState } from "react";
import { Card } from "../ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { Loader2 } from "lucide-react";

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
}

interface MovieGoogleResultsProps {
  results: SearchResult[];
  isLoading: boolean;
}

export const MovieGoogleResults = ({ results, isLoading }: MovieGoogleResultsProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[300px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={index} className="p-4">
            <h3 className="text-sm font-medium">
              <a href={result.link} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                {result.title}
              </a>
            </h3>
            <p className="text-sm text-muted-foreground mt-1">{result.snippet}</p>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};