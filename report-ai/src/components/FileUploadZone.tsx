import { useCallback, useState } from "react";
import { Upload, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import * as pdfjsLib from "pdfjs-dist";

pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

async function extractTextFromPdf(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const text = content.items
      .map((item: any) => item.str)
      .join(" ");
    pages.push(text);
  }
  return pages.join("\n\n");
}

interface FileUploadZoneProps {
  onFileContent: (text: string) => void;
  isAnalyzing: boolean;
}

const FileUploadZone = ({ onFileContent, isAnalyzing }: FileUploadZoneProps) => {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [textInput, setTextInput] = useState("");
  const [extracting, setExtracting] = useState(false);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    if (f.type === "application/pdf" || f.name.toLowerCase().endsWith(".pdf")) {
      setExtracting(true);
      try {
        const text = await extractTextFromPdf(f);
        onFileContent(text);
      } catch (err) {
        console.error("PDF extraction error:", err);
        // Fallback: read as text
        const text = await f.text();
        onFileContent(text);
      } finally {
        setExtracting(false);
      }
    } else {
      const text = await f.text();
      onFileContent(text);
    }
  }, [onFileContent]);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const onFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const clearFile = () => {
    setFile(null);
    setTextInput("");
  };

  return (
    <div className="space-y-4">
      {!file && !textInput ? (
        <>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`relative border-2 border-dashed rounded-lg p-12 text-center transition-all duration-300 cursor-pointer
              ${dragOver
                ? "border-primary bg-accent/50 scale-[1.01]"
                : "border-border hover:border-primary/50 hover:bg-accent/30"
              }`}
          >
            <input
              type="file"
              accept=".txt,.csv,.tsv,.text,.log,.pdf"
              onChange={onFileInput}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex flex-col items-center gap-4">
              <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center">
                <Upload className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold font-heading text-foreground">
                  Drop your lab report here
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports PDF, TXT, CSV, and text-based files
                </p>
              </div>
            </div>
          </div>

          <div className="relative flex items-center gap-4">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">or paste text</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <textarea
            placeholder="Paste your lab report text here..."
            className="w-full h-40 rounded-lg border border-border bg-card p-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none font-body"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
          />

          {textInput.trim() && (
            <Button
              onClick={() => onFileContent(textInput)}
              disabled={isAnalyzing}
              className="w-full gradient-primary text-primary-foreground font-heading font-semibold h-12 text-base"
            >
              Analyze Report
            </Button>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 p-4 rounded-lg bg-accent/50 border border-border">
          <FileText className="w-5 h-5 text-primary" />
          <span className="flex-1 text-sm font-medium text-foreground truncate">
            {file ? file.name : "Pasted text"}
            {extracting && " — Extracting text..."}
          </span>
          {!isAnalyzing && !extracting && (
            <button onClick={clearFile} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
