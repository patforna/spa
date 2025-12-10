export interface Output {
  log(message: string): void;
  error(message: string): void;
}

export const consoleOutput: Output = {
  log: (msg) => console.log(msg),
  error: (msg) => console.error(msg),
};
