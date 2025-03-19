export * from './config';
export * from './get-info';
export * from './jiti-import';
export * from './loader';
export * from './parse';
export * from './parse';

export function assoc(path: string[], value: any, source: Record<string, any>) {
  const target = path.slice(0, -1).reduce((acc, cur) => acc[cur as any] ||= {}, source);

  target[path.at(-1)! as any] = value;
}
