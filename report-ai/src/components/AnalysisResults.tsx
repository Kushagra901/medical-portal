import { Activity, CheckCircle, AlertTriangle, User, Calendar, Building } from "lucide-react";
import AnomalyCard from "./AnomalyCard";

interface AnalysisData {
  patientInfo: {
    name: string;
    date: string;
    labName: string;
  };
  summary: string;
  totalTests: number;
  anomalies: Array<{
    testName: string;
    value: string;
    normalRange: string;
    severity: "high" | "medium" | "low";
    explanation: string;
  }>;
  normalResults: Array<{
    testName: string;
    value: string;
    normalRange: string;
  }>;
}

const AnalysisResults = ({ data }: { data: AnalysisData }) => {
  const highCount = data.anomalies.filter((a) => a.severity === "high").length;
  const medCount = data.anomalies.filter((a) => a.severity === "medium").length;
  const lowCount = data.anomalies.filter((a) => a.severity === "low").length;

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Patient Info */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: User, label: "Patient", value: data.patientInfo.name },
          { icon: Calendar, label: "Date", value: data.patientInfo.date },
          { icon: Building, label: "Lab", value: data.patientInfo.labName },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 p-3 rounded-lg bg-secondary/50">
            <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
              <p className="text-sm font-medium text-foreground truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="p-4 rounded-lg bg-card shadow-card border border-border">
        <p className="text-sm text-foreground leading-relaxed">{data.summary}</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard icon={Activity} label="Total Tests" value={data.totalTests} className="text-primary" />
        <StatCard icon={AlertTriangle} label="High" value={highCount} className="text-destructive" />
        <StatCard icon={AlertTriangle} label="Medium" value={medCount} className="text-warning" />
        <StatCard icon={CheckCircle} label="Normal" value={data.normalResults.length} className="text-success" />
      </div>

      {/* Anomalies */}
      {data.anomalies.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            Anomalies Found ({data.anomalies.length})
          </h3>
          <div className="space-y-3">
            {data.anomalies.map((anomaly, i) => (
              <AnomalyCard key={i} anomaly={anomaly} index={i} />
            ))}
          </div>
        </div>
      )}

      {/* Normal Results */}
      {data.normalResults.length > 0 && (
        <div>
          <h3 className="font-heading font-semibold text-lg text-foreground mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-success" />
            Normal Results ({data.normalResults.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {data.normalResults.map((result, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3 rounded-lg bg-success/5 border border-success/10 animate-slide-up"
                style={{ animationDelay: `${(data.anomalies.length + i) * 40}ms`, animationFillMode: "backwards" }}
              >
                <span className="text-sm font-medium text-foreground">{result.testName}</span>
                <span className="text-sm text-muted-foreground">{result.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const StatCard = ({ icon: Icon, label, value, className }: { icon: any; label: string; value: number; className: string }) => (
  <div className="text-center p-3 rounded-lg bg-card shadow-card border border-border">
    <Icon className={`w-5 h-5 mx-auto mb-1 ${className}`} />
    <p className="text-2xl font-heading font-bold text-foreground">{value}</p>
    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">{label}</p>
  </div>
);

export default AnalysisResults;
