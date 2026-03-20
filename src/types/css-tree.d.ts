declare module 'css-tree' {
  export function parse(content: string, options?: any): any;
  export function walk(ast: any, callback: (node: any) => void): void;
}
