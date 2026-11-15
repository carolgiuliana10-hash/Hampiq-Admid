/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChartDataPoint } from '../utils/menopause-ai';

interface ClinicalLineChartProps {
  points: ChartDataPoint[];
  maxY?: number;
  yAxisLabel?: string;
  strokeColor?: string;
  fillColor?: string;
  height?: number;
  compact?: boolean;
}

export const ClinicalLineChart: React.FC<ClinicalLineChartProps> = ({
  points,
  maxY = 10,
  yAxisLabel,
  strokeColor = '#0284c7',
  fillColor = 'rgba(2, 132, 199, 0.08)',
  height = 170,
  compact = false,
}) => {
  const validIndices = points
    .map((p, idx) => (p.value !== null && p.value !== undefined ? idx : -1))
    .filter((i) => i >= 0);

  const defaultIdx = validIndices.length > 0 ? validIndices[validIndices.length - 1] : 0;
  const [selectedIdx, setSelectedIdx] = useState<number>(defaultIdx);

  const width = compact ? 360 : 620;
  const padLeft = compact ? 34 : 42;
  const padRight = compact ? 18 : 24;
  const padTop = compact ? 16 : 20;
  const padBottom = compact ? 30 : 34;

  const plotW = width - padLeft - padRight;
  const plotH = height - padTop - padBottom;
  const innerPadX = points.length <= 1 ? 0 : Math.min(compact ? 22 : 32, plotW * 0.1);

  const getX = (index: number) => {
    if (points.length <= 1) return padLeft + plotW / 2;
    const usableW = plotW - innerPadX * 2;
    return padLeft + innerPadX + (index / (points.length - 1)) * usableW;
  };

  const getY = (val: number) => {
    const clamped = Math.max(0, Math.min(maxY, val));
    return padTop + plotH - (clamped / maxY) * plotH;
  };

  const yTicks = maxY === 12 ? [0, 3, 6, 9, 12] : [0, 2, 4, 6, 8, 10];

  // Build contiguous line segments across non-null values
  const segments: Array<Array<{ x: number; y: number; value: number; idx: number }>> = [];
  let currentSeg: Array<{ x: number; y: number; value: number; idx: number }> = [];

  points.forEach((pt, idx) => {
    if (pt.value !== null && pt.value !== undefined) {
      currentSeg.push({
        x: getX(idx),
        y: getY(pt.value),
        value: pt.value,
        idx,
      });
    } else if (currentSeg.length > 0) {
      segments.push(currentSeg);
      currentSeg = [];
    }
  });
  if (currentSeg.length > 0) {
    segments.push(currentSeg);
  }

  const safeSelectedIdx =
    selectedIdx >= 0 && selectedIdx < points.length ? selectedIdx : defaultIdx;
  const activePoint = points[safeSelectedIdx] || points[0];

  return (
    <div className="w-full">
      <div className="bg-slate-50/40 border border-slate-200/90 rounded-xl p-2">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block select-none"
          role="img"
          aria-label={yAxisLabel || 'Gráfico de evolución clínica por citas'}
        >
          {/* Plot background */}
          <rect
            x={padLeft}
            y={padTop}
            width={plotW}
            height={plotH}
            fill="#ffffff"
            stroke="#cbd5e1"
            strokeWidth="1"
          />

          {/* Horizontal gridlines + Y ticks */}
          {yTicks.map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={padLeft}
                  y1={y}
                  x2={padLeft + plotW}
                  y2={y}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  textAnchor="end"
                  fontSize="9.5"
                  fill="#64748b"
                  fontWeight="600"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Vertical gridlines + X ticks */}
          {points.map((pt, idx) => {
            const x = getX(idx);
            const isSel = idx === safeSelectedIdx;
            return (
              <g key={`${pt.etiqueta}-${idx}`}>
                <line
                  x1={x}
                  y1={padTop}
                  x2={x}
                  y2={padTop + plotH}
                  stroke={isSel ? '#bae6fd' : '#e2e8f0'}
                  strokeWidth={isSel ? '1.25' : '1'}
                  strokeDasharray={isSel ? '3 2' : undefined}
                />
                <text
                  x={x}
                  y={padTop + plotH + 14}
                  textAnchor="middle"
                  fontSize="10"
                  fill={isSel ? '#0369a1' : '#475569'}
                  fontWeight={isSel ? '700' : '600'}
                >
                  {pt.etiqueta}
                </text>
                {pt.fecha && !compact && (
                  <text
                    x={x}
                    y={padTop + plotH + 25}
                    textAnchor="middle"
                    fontSize="8.2"
                    fill="#94a3b8"
                  >
                    {pt.fecha}
                  </text>
                )}
              </g>
            );
          })}

          {/* Area fills + Polylines for contiguous segments */}
          {segments.map((seg, sIdx) => {
            if (seg.length === 0) return null;
            const polyPoints = seg.map((p) => `${p.x},${p.y}`).join(' ');
            const areaPath =
              seg.length > 1
                ? `M ${seg[0].x},${padTop + plotH} L ${seg
                    .map((p) => `${p.x},${p.y}`)
                    .join(' L ')} L ${seg[seg.length - 1].x},${padTop + plotH} Z`
                : '';

            return (
              <g key={sIdx}>
                {areaPath && <path d={areaPath} fill={fillColor} />}
                {seg.length > 1 && (
                  <polyline
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth="2.4"
                    strokeLinejoin="round"
                    strokeLinecap="round"
                    points={polyPoints}
                  />
                )}
              </g>
            );
          })}

          {/* Plotted points */}
          {points.map((pt, idx) => {
            const x = getX(idx);
            const hasValue = pt.value !== null && pt.value !== undefined;
            const y = hasValue ? getY(pt.value as number) : padTop + plotH;
            const isSel = idx === safeSelectedIdx;

            return (
              <g
                key={`pt-${pt.etiqueta}-${idx}`}
                className="cursor-pointer"
                onClick={() => setSelectedIdx(idx)}
                onMouseEnter={() => setSelectedIdx(idx)}
              >
                {/* Invisible hit area */}
                <circle cx={x} cy={y} r={14} fill="transparent" />

                {hasValue ? (
                  <>
                    {isSel && (
                      <circle cx={x} cy={y} r={7.5} fill={fillColor} stroke={strokeColor} strokeWidth="1" />
                    )}
                    <circle
                      cx={x}
                      cy={y}
                      r={isSel ? 4.8 : 3.8}
                      fill="#ffffff"
                      stroke={strokeColor}
                      strokeWidth="2.4"
                    />
                    <text
                      x={x}
                      y={y - padTop < 18 ? y + 15 : y - 9}
                      textAnchor="middle"
                      fontSize="9.5"
                      fontWeight="700"
                      fill="#0f172a"
                    >
                      {pt.value}
                    </text>
                  </>
                ) : (
                  <circle
                    cx={x}
                    cy={padTop + plotH - 4}
                    r={3.2}
                    fill="#f8fafc"
                    stroke="#94a3b8"
                    strokeWidth="1.5"
                    strokeDasharray="2 1"
                  />
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Selected point readout */}
      {activePoint && (
        <div className="mt-2 px-2.5 py-1.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px] flex flex-wrap items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-bold text-sky-900 shrink-0">{activePoint.etiqueta}:</span>
            <span className="font-semibold text-slate-700 truncate">
              {activePoint.estado || (activePoint.value !== null ? `${activePoint.value}/${maxY}` : 'Sin dato')}
            </span>
          </div>
          {activePoint.detail && (
            <p className="text-[11px] text-slate-600 w-full leading-snug">{activePoint.detail}</p>
          )}
        </div>
      )}
    </div>
  );
};
