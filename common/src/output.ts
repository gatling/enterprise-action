export interface Output {
  set: (name: string, value: any) => Promise<void>;
}
