export interface Logger {
  debug: (message: string) => void;
  log: (message: string) => void;
  group: (title: string, message: string) => void;
  annotateNotice: (message: string, title?: string) => void;
  annotateWarning: (message: string, title?: string) => void;
  annotateError: (message: string, title?: string) => void;
  setOutput: (name: string, value: any) => void;
}

export const bright = (text: string): string => "\u001b[37;1m" + text + "\u001b[0m";

export const green = (text: string): string => "\u001b[32m" + text + "\u001b[0m";

export const yellow = (text: string): string => "\u001b[33m" + text + "\u001b[0m";

export const red = (text: string): string => "\u001b[31m" + text + "\u001b[0m";
