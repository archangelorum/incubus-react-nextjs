'use client';

import { useEffect, useRef } from 'react';
import { useTranslations } from 'next-intl';

interface DataPoint {
  time: string;
  value: number;
}

interface DataSeries {
  id: string;
  data: DataPoint[];
  color: string;
}

interface MetricsChartProps {
  title: string;
  data: DataSeries[];
  yAxisLabel?: string;
}

export function MetricsChart({ title, data, yAxisLabel }: MetricsChartProps) {
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
    if (data.length === 0 || data[0].data.length === 0) {
      ctx.font = '14px Arial';
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
      ctx.textAlign = 'center';
      ctx.fillText(t('monitoring.charts.noData'), rect.width / 2, rect.height / 2);
      return;
    }
    
    // Find min and max values
    let minValue = Number.MAX_VALUE;
    let maxValue = Number.MIN_VALUE;
    
    data.forEach(series => {
      series.data.forEach(point => {
        minValue = Math.min(minValue, point.value);
        maxValue = Math.max(maxValue, point.value);
      });
    });
    
    // Add some padding to the min/max values
    const valueRange = maxValue - minValue;
    minValue = Math.max(0, minValue - valueRange * 0.1);
    maxValue = maxValue + valueRange * 0.1;
    
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
    
    const timeLabels = data[0].data.filter((_, i) => i % 4 === 0).map(d => {
      const date = new Date(d.time);
      return date.getHours() + ':00';
    });
    
    timeLabels.forEach((label, i) => {
      const x = padding.left + (chartWidth * i * 4) / (data[0].data.length - 1);
      ctx.fillText(label, x, rect.height - padding.bottom + 15);
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
    
    // Draw data series
    data.forEach(series => {
      const points = series.data.map((point, i) => {
        const x = padding.left + (chartWidth * i) / (series.data.length - 1);
        const y = padding.top + chartHeight - (chartHeight * (point.value - minValue)) / (maxValue - minValue);
        return { x, y };
      });
      
      // Draw line
      ctx.beginPath();
      ctx.strokeStyle = getColorForSeries(series.color);
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
      ctx.fillStyle = `${getColorForSeries(series.color)}20`; // 20 is hex for 12% opacity
      
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
    });
    
    // Draw legend
    const legendX = padding.left;
    const legendY = padding.top - 5;
    const legendItemWidth = 80;
    
    data.forEach((series, i) => {
      const x = legendX + i * legendItemWidth;
      
      // Draw color box
      ctx.fillStyle = getColorForSeries(series.color);
      ctx.fillRect(x, legendY, 10, 10);
      
      // Draw label
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-primary');
      ctx.textAlign = 'left';
      ctx.fillText(t(`monitoring.charts.series.${series.id}`), x + 15, legendY + 8);
    });
    
  }, [data, title, yAxisLabel, t]);
  
  // Helper function to get color based on theme
  const getColorForSeries = (color: string) => {
    const isDarkMode = document.documentElement.classList.contains('dark');
    
    const colorMap: Record<string, { light: string, dark: string }> = {
      'blue': { light: '#3b82f6', dark: '#60a5fa' },
      'green': { light: '#10b981', dark: '#34d399' },
      'red': { light: '#ef4444', dark: '#f87171' },
      'yellow': { light: '#f59e0b', dark: '#fbbf24' },
      'purple': { light: '#8b5cf6', dark: '#a78bfa' },
      'orange': { light: '#f97316', dark: '#fb923c' }
    };
    
    if (colorMap[color]) {
      return isDarkMode ? colorMap[color].dark : colorMap[color].light;
    }
    
    return color;
  };

  return (
    <div className="w-full">
      <h3 className="text-sm font-medium mb-3">{title}</h3>
      <div className="relative w-full h-64">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
          style={{ width: '100%', height: '100%' }}
        />
      </div>
    </div>
  );
}