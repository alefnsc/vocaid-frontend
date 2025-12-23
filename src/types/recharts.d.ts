/**
 * Recharts type declarations to fix React 18 compatibility issues
 * 
 * This fixes the "X cannot be used as a JSX component" error
 * that occurs with certain recharts components in React 18
 */

import 'recharts';

declare module 'recharts' {
  // Override the problematic component types to fix JSX compatibility
  export interface PolarAngleAxisProps {
    dataKey?: string;
    tick?: React.SVGProps<SVGTextElement> | React.ReactElement | ((props: any) => React.ReactElement) | boolean | { fontSize?: number; fill?: string };
    tickLine?: boolean;
    axisLine?: boolean;
    stroke?: string;
    [key: string]: any;
  }

  export interface PolarRadiusAxisProps {
    angle?: number;
    domain?: [number, number];
    tick?: React.SVGProps<SVGTextElement> | React.ReactElement | ((props: any) => React.ReactElement) | boolean | { fontSize?: number; fill?: string };
    tickLine?: boolean;
    axisLine?: boolean;
    stroke?: string;
    [key: string]: any;
  }
}
