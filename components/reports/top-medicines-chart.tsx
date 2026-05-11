'use client'

import * as React from 'react'
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { formatPKR } from '@/lib/utils'

interface TopMedicinesChartProps {
  data: { name: string; qty: number; revenue: number }[]
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-semibold mb-1">{data.name}</p>
        <p className="text-sm text-primary">Quantity Sold: {data.qty}</p>
        <p className="text-sm text-muted-foreground">
          Revenue: {formatPKR(data.revenue)}
        </p>
      </div>
    )
  }
  return null
}

export function TopMedicinesChart({ data }: TopMedicinesChartProps) {
  const chartData = [...data].sort((a, b) => b.qty - a.qty).slice(0, 10)

  return (
    <div style={{ width: '100%', height: 400 }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ left: 40, right: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
          <XAxis type="number" hide />
          <YAxis
            dataKey="name"
            type="category"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#6B7280', fontSize: 12 }}
            width={120}
            tickFormatter={(value) => (value.length > 15 ? `${value.substring(0, 15)}...` : value)}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="qty"
            fill="#0EA5E9"
            radius={[0, 4, 4, 0]}
            maxBarSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
