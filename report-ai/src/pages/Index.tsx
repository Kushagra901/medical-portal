import { useState } from "react";
import { Activity, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import FileUploadZone from "@/components/FileUploadZone";
import AnalysisResults from "@/components/AnalysisResults";

const Index = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<any>(null);
  const { toast } = useToast();

  const analyzeReport = async (text: string) => {
    setIsAnalyzing(true);
    setResults(null);

    try {
      const { data, error } = await supabase.functions.invoke("analyze-report", {
        body: { reportText: text },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setResults(data);
    } catch (err: any) {
      console.error("Analysis error:", err);
      toast({
        title: "Analysis Failed",
        description: err.message || "Could not analyze the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-bold text-foreground leading-tight">LabLens</h1>
            <p className="text-xs text-muted-foreground">AI-Powered Lab Report Analysis</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-8">
        <section>
          <h2 className="font-heading font-bold text-2xl text-foreground mb-1">Analyze Your Report</h2>
          <p className="text-muted-foreground text-sm mb-6">
            Upload or paste your lab report to instantly detect anomalies and get insights.
          </p>
          <FileUploadZone onFileContent={analyzeReport} isAnalyzing={isAnalyzing} />
        </section>

        {isAnalyzing && (
          <div className="flex flex-col items-center gap-4 py-16 animate-slide-up">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center animate-pulse-slow">
              <Loader2 className="w-7 h-7 text-primary-foreground animate-spin" />
            </div>
            <div className="text-center">
              <p className="font-heading font-semibold text-foreground">Analyzing your report</p>
              <p className="text-sm text-muted-foreground mt-1">Our AI is reviewing each test result...</p>
            </div>
          </div>
        )}

        {results && !isAnalyzing && <AnalysisResults data={results} />}
      </main>
    </div>
  );
};

export default Index;
