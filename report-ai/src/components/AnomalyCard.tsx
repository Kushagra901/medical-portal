import { AlertTriangle, AlertCircle, Info } from "lucide-react";

interface Anomaly {
  testName: string;
  value: string;
  normalRange: string;
  severity: "high" | "medium" | "low";
  explanation: string;
}

const severityConfig = {
  high: {
    icon: AlertTriangle,
    label: "High",
    borderClass: "border-l-anomaly-high",
    bgClass: "bg-destructive/5",
    badgeClass: "bg-destructive/10 text-destructive",
    iconClass: "text-destructive",
  },
  medium: {
    icon: AlertCircle,
    label: "Medium",
    borderClass: "border-l-anomaly-medium",
    bgClass: "bg-warning/5",
    badgeClass: "bg-warning/10 text-warning-foreground",
    iconClass: "text-warning",
  },
  low: {
    icon: Info,
    label: "Low",
    borderClass: "border-l-anomaly-low",
    bgClass: "bg-accent/50",
    badgeClass: "bg-accent text-accent-foreground",
    iconClass: "text-anomaly-low",
  },
};

const AnomalyCard = ({ anomaly, index }: { anomaly: Anomaly; index: number }) => {
  const config = severityConfig[anomaly.severity];
  const Icon = config.icon;

  return (
    <div
      className={`border-l-4 ${config.borderClass} ${config.bgClass} rounded-lg p-5 shadow-card animate-slide-up`}
      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
    >
      <div className="flex items-start gap-3">
        <Icon className={`w-5 h-5 mt-0.5 ${config.iconClass} shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-heading font-semibold text-foreground">{anomaly.testName}</h4>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.badgeClass}`}>
              {config.label}
            </span>
          </div>
          <div className="flex items-center gap-4 mt-2 text-sm">
            <span className="text-foreground font-medium">
              Result: <span className="font-semibold">{anomaly.value}</span>
            </span>
            <span className="text-muted-foreground">
              Normal: {anomaly.normalRange}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
            {anomaly.explanation}
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnomalyCard;
