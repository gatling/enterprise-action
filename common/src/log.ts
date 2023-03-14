export interface Logger {
  debug: (message: string) => void;
  log: (message: string) => void;
  group: (title: string, message: string) => void;
  annotateNotice: (message: string, title?: string) => void;
  annotateWarning: (message: string, title?: string) => void;
  annotateError: (message: string, title?: string) => void;
}
