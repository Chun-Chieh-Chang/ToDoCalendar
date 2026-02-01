// 临时类型定义文件，用于修复TypeScript错误
// 在安装依赖之前使用

declare module 'react' {
  export interface ReactNode { }
  export interface ReactElement { }
  export interface MouseEvent<T = Element> {
    target: EventTarget | null;
  }
  export interface KeyboardEvent<T = Element> {
    key: string;
    preventDefault(): void;
  }
  export interface ChangeEvent<T = Element> {
    target: {
      name: string;
      value: string;
      checked?: boolean;
    };
  }
  export interface FormEvent<T = Element> {
    preventDefault(): void;
  }
  export interface DragEvent<T = Element> {
    preventDefault(): void;
    dataTransfer: {
      setData(key: string, value: string): void;
      getData(key: string): string;
    };
  }

  export function createElement(
    type: any,
    props: any,
    ...children: ReactNode[]
  ): ReactElement;
  export function useState<T>(initialState: T | (() => T)): [T, (state: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: any[]): void;
  export function useContext<T>(context: any): T;
  export function useReducer<TState, TAction>(
    reducer: (state: TState, action: TAction) => TState,
    initialState: TState
  ): [TState, (action: TAction) => void];
  export const Fragment: any;
  export type FC<P = {}> = (props: P) => ReactElement | null;

  // JSX 類型定義
  namespace JSX {
    interface Element { }
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

declare module 'react/jsx-runtime' {
  export function jsx(type: any, props: any, key?: any): any;
  export function jsxs(type: any, props: any, key?: any): any;
  export const Fragment: any;
}

declare module 'react-dom/client' {
  export function createRoot(container: Element | DocumentFragment): {
    render(children: React.ReactNode): void;
    unmount(): void;
  };
}

declare module 'date-fns' {
  export function format(date: Date, formatStr: string, options?: any): string;
  export function startOfMonth(date: Date): Date;
  export function endOfMonth(date: Date): Date;
  export function startOfWeek(date: Date, options?: any): Date;
  export function endOfWeek(date: Date, options?: any): Date;
  export function addMonths(date: Date, amount: number): Date;
  export function subMonths(date: Date, amount: number): Date;
  export function addDays(date: Date, amount: number): Date;
  export function isSameMonth(dateLeft: Date, dateRight: Date): boolean;
  export function isToday(date: Date): boolean;
  export function isSameDay(dateLeft: Date, dateRight: Date): boolean;
}

declare module 'date-fns/locale' {
  export const zhTW: any;
  export const enUS: any;
}

// JSX 命名空間
declare namespace JSX {
  interface Element { }
  interface IntrinsicElements {
    [elem: string]: any;
  }
  interface ElementChildrenAttribute {
    children: {};
  }
}