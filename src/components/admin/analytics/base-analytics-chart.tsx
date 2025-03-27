'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface ChartDataset {
  label: string;
  data: number[];
  color?: string;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface BaseAnalyticsChartProps {
  data: ChartData;
  height?: number;
  yAxisLabel?: string;
  type?: 'line' | 'bar';
}

export function BaseAnalyticsChart({ 
  data, 
  height = 300, 
  yAxisLabel = '', 
  type = 'line' 
}: BaseAnalyticsChartProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const t = useTranslations('admin');

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
    
    // Chart dimensions
    const padding = { top: 20, right: 20, bottom: 30, left: 50 };
    const chartWidth = rect.width - padding.left - padding.right;
    const chartHeight = rect.height - padding.top - padding.bottom;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // If no data, show message
    if (data.labels.length === 0 || data.datasets.length === 0) {
      ctx.font = '14px Arial';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
      ctx.textAlign = 'center';
      ctx.fillText(t('analytics.charts.noData'), rect.width / 2, rect.height / 2);
      return;
    }
    
    // Find min and max values
    let minValue = 0; // Start from 0 for better visualization
    let maxValue = 0;
    
    data.datasets.forEach(dataset => {
      dataset.data.forEach(value => {
        maxValue = Math.max(maxValue, value);
      });
    });
    
    // Add some padding to the max value
    maxValue = maxValue * 1.1;
    
    // Draw axes
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
    ctx.lineWidth = 1;
    
    // Y-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, rect.height - padding.bottom);
    ctx.stroke();
    
    // X-axis
    ctx.beginPath();
    ctx.moveTo(padding.left, rect.height - padding.bottom);
    ctx.lineTo(rect.width - padding.right, rect.height - padding.bottom);
    ctx.stroke();
    
    // Draw Y-axis labels
    ctx.font = '10px Arial';
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-secondary');
    ctx.textAlign = 'right';
    
    const yTickCount = 5;
    for (let i = 0; i <= yTickCount; i++) {
      const value = minValue + (maxValue - minValue) * (yTickCount - i) / yTickCount;
      const y = padding.top + (chartHeight * i) / yTickCount;
      
      ctx.fillText(value.toFixed(0), padding.left - 5, y + 3);
      
      // Draw grid line
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(128, 128, 128, 0.1)';
      ctx.moveTo(padding.left, y);
      ctx.lineTo(rect.width - padding.right, y);
      ctx.stroke();
    }
    
    // Draw X-axis labels
    ctx.textAlign = 'center';
    
    // Only show a subset of labels if there are too many
    const labelStep = Math.max(1, Math.floor(data.labels.length / 10));
    
    data.labels.forEach((label, i) => {
      if (i % labelStep === 0) {
        const x = padding.left + (chartWidth * i) / (data.labels.length - 1);
        ctx.fillText(label, x, rect.height - padding.bottom + 15);
      }
    });
    
    // Draw Y-axis label if provided
    if (yAxisLabel) {
      ctx.save();
      ctx.translate(10, rect.height / 2);
      ctx.rotate(-Math.PI / 2);
      ctx.textAlign = 'center';
      ctx.fillText(yAxisLabel, 0, 0);
      ctx.restore();
    }
    
    // Define colors for datasets
    const colors = [
      '#3b82f6', // blue
      '#10b981', // green
      '#ef4444', // red
      '#f59e0b', // yellow
      '#8b5cf6', // purple
      '#f97316'  // orange
    ];
    
    // Draw data series
    data.datasets.forEach((dataset, datasetIndex) => {
      const color = dataset.color || colors[datasetIndex % colors.length];
      
      const points = dataset.data.map((value, i) => {
        const x = padding.left + (chartWidth * i) / (data.labels.length - 1);
        const y = padding.top + chartHeight - (chartHeight * (value - minValue)) / (maxValue - minValue);
        return { x, y };
      });
      
      if (type === 'line') {
        // Draw line
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        
        points.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        
        ctx.stroke();
        
        // Draw area under the line
        ctx.beginPath();
        ctx.fillStyle = `${color}20`; // 20 is hex for 12% opacity
        
        points.forEach((point, i) => {
          if (i === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        
        ctx.lineTo(points[points.length - 1].x, rect.height - padding.bottom);
        ctx.lineTo(points[0].x, rect.height - padding.bottom);
        ctx.closePath();
        ctx.fill();
      } else if (type === 'bar') {
        // Draw bars
        const barWidth = (chartWidth / (data.labels.length * data.datasets.length)) * 0.8;
        const barSpacing = barWidth * 0.2;
        
        points.forEach((point, i) => {
          const x = point.x - (barWidth * data.datasets.length) / 2 + (barWidth + barSpacing) * datasetIndex;
          const y = point.y;
          
          ctx.fillStyle = color;
          ctx.fillRect(x, y, barWidth, rect.height - padding.bottom - y);
        });
      }
    });
    
    // Draw legend
    const legendX = padding.left;
    const legendY = padding.top - 5;
    const legendItemWidth = 80;
    
    data.datasets.forEach((dataset, i) => {
      const x = legendX + i * legendItemWidth;
      const color = dataset.color || colors[i % colors.length];
      
      // Draw color box
      ctx.fillStyle = color;
      ctx.fillRect(x, legendY, 10, 10);
      
      // Draw label
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
      ctx.textAlign = 'left';
      ctx.fillText(dataset.label, x + 15, legendY + 8);
    });
    
  }, [data, height, yAxisLabel, type, t]);

  return (
    <div className="w-full">
      <canvas 
        ref={canvasRef} 
        className="w-full"
        style={{ height: `${height}px` }}
      />
    </div>
  );
}