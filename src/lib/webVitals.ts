/**
 * Web Vitals Performance Monitoring
 * 
 * Tracks Core Web Vitals metrics in development:
 * - LCP (Largest Contentful Paint): Main content load time
 * - CLS (Cumulative Layout Shift): Visual stability
 * - INP (Interaction to Next Paint): Responsiveness
 * - FCP (First Contentful Paint): Initial render time
 * - TTFB (Time to First Byte): Server response time
 * 
 * @module lib/webVitals
 */

import { onLCP, onCLS, onINP, onFCP, onTTFB, Metric } from 'web-vitals';

interface VitalsReport {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
  navigationType: string;
}

// Thresholds based on Google's Core Web Vitals guidelines
const THRESHOLDS = {
  LCP: { good: 2500, needsImprovement: 4000 },  // milliseconds
  CLS: { good: 0.1, needsImprovement: 0.25 },   // score
  INP: { good: 200, needsImprovement: 500 },    // milliseconds
  FCP: { good: 1800, needsImprovement: 3000 },  // milliseconds
  TTFB: { good: 800, needsImprovement: 1800 }   // milliseconds
};

// Store metrics for reporting
const metricsStore: VitalsReport[] = [];

function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
  const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
  if (!threshold) return 'good';
  
  if (value <= threshold.good) return 'good';
  if (value <= threshold.needsImprovement) return 'needs-improvement';
  return 'poor';
}

function formatMetric(metric: Metric): VitalsReport {
  return {
    name: metric.name,
    value: Math.round(metric.value * 100) / 100,
    rating: getRating(metric.name, metric.value),
    delta: Math.round(metric.delta * 100) / 100,
    id: metric.id,
    navigationType: metric.navigationType || 'unknown'
  };
}

function logMetric(metric: Metric) {
  const formatted = formatMetric(metric);
  metricsStore.push(formatted);
  
  const emoji = formatted.rating === 'good' ? '✅' : 
                formatted.rating === 'needs-improvement' ? '⚠️' : '❌';
  
  const unit = ['CLS'].includes(metric.name) ? '' : 'ms';
  
  console.log(
    `${emoji} [WebVitals] ${metric.name}: ${formatted.value}${unit} (${formatted.rating})`,
    {
      delta: `${formatted.delta}${unit}`,
      navigationType: formatted.navigationType
    }
  );
}

/**
 * Initialize Web Vitals monitoring
 * Only runs in development mode
 */
export function initWebVitals() {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.log('📊 [WebVitals] Monitoring initialized');
  
  onLCP(logMetric);
  onCLS(logMetric);
  onINP(logMetric);
  onFCP(logMetric);
  onTTFB(logMetric);
}

/**
 * Get all collected metrics
 */
export function getWebVitalsReport(): VitalsReport[] {
  return [...metricsStore];
}

/**
 * Log a summary of all metrics
 */
export function logWebVitalsSummary() {
  if (metricsStore.length === 0) {
    console.log('📊 [WebVitals] No metrics collected yet');
    return;
  }
  
  console.group('📊 [WebVitals] Summary');
  
  const byName = metricsStore.reduce((acc, m) => {
    if (!acc[m.name]) acc[m.name] = [];
    acc[m.name].push(m);
    return acc;
  }, {} as Record<string, VitalsReport[]>);
  
  Object.entries(byName).forEach(([name, metrics]) => {
    const latest = metrics[metrics.length - 1];
    const unit = ['CLS'].includes(name) ? '' : 'ms';
    console.log(`${name}: ${latest.value}${unit} (${latest.rating})`);
  });
  
  console.groupEnd();
}

export default initWebVitals;
