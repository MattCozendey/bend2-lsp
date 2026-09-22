export type OffsetRange = { start: number; end: number };

export type AnalysisDiagnostic = {
  uri: string;
  range: OffsetRange;
  message: string;
  code: "parsing" | "checking" | "imports" | "incomplete-law" | "holes";
};

export type AnalysisResult = {
  id: number;
  uri: string;
  version: number;
  versions: Record<string, number>;
  diagnostics: AnalysisDiagnostic[];
  hovers: Record<string, string>;
  definitions: Record<string, { uri: string; range: { start: { line: number; character: number }; end: { line: number; character: number } } }>;
};

export type Overlay = { uri: string; path: string; version: number; text: string };
export type AnalysisRequest = {
  type: "analyze";
  id: number;
  uri: string;
  path: string;
  version: number;
  text: string;
  overlays: Overlay[];
};
