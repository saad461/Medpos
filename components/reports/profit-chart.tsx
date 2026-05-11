'use client'

import * as React from 'react'
import {
  Area,
  Line,
  ComposedChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatPKR } from '@/lib/utils'

interface ProfitChartProps {
  data: { date: string; revenue: number; profit: number }[]
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-semibold mb-1">{label}</p>
        <p className="text-sm text-[#0EA5E9]">
          Revenue: {formatPKR(payload[0].value)}
        </p>
        <p className="text-sm text-[#059669]">
          Profit: {formatPKR(payload[1].value)}
        </p>
        <p className="text-xs text-red-500 mt-1">
          COGS: {formatPKR(payload[0].value - payload[1].value)}
        </p>
      </div>
    )
  }
  return null
}

export function ProfitChart({ data }: ProfitChartProps) {
  return (
    <div style={{ width: '100%', height: 350 }}>
      <ResponsiveContainer>
        <ComposedChart data={data}>
          <defs>
            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0EA5E9" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0EA5E9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            tickFormatter={(value) => `Rs.${value >= 1000 ? value / 1000 + 'k' : value}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
             verticalAlign="top"
             align="right"
             height={36}
             iconType="circle"
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="none"
            fillOpacity={1}
            fill="url(#colorRevenue)"
            name="Revenue"
          />
          <Line
            type="monotone"
            dataKey="profit"
            stroke="#059669"
            strokeWidth={3}
            dot={{ r: 4, fill: '#059669', strokeWidth: 2, stroke: '#fff' }}
            name="Profit"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
