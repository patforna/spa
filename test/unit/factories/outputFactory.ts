import { Output } from '../../../lib/output.js';

export const nullOutput: Output = {
  log: () => {},
  error: () => {},
};

export const createCapturingOutput = () => {
  const logs: string[] = [];
  const errors: string[] = [];
  return {
    output: {
      log: (msg: string) => logs.push(msg),
      error: (msg: string) => errors.push(msg),
    } as Output,
    logs,
    errors,
  };
};
