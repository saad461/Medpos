'use client'

import * as React from 'react'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts'
import { formatPKR } from '@/lib/utils'

interface PaymentMethodChartProps {
  cash: number
  card: number
  credit: number
}

const COLORS = {
  cash: '#1E3A5F',   // primary
  card: '#0EA5E9',   // accent
  credit: '#D97706', // warning
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]
    return (
      <div className="bg-white p-3 border rounded-lg shadow-lg">
        <p className="text-sm font-semibold mb-1 uppercase">{data.name}</p>
        <p className="text-sm font-bold text-primary">
          {formatPKR(data.value)}
        </p>
        <p className="text-xs text-muted-foreground">
          {data.payload.percent.toFixed(1)}% of total
        </p>
      </div>
    )
  }
  return null
}

export function PaymentMethodChart({ cash, card, credit }: PaymentMethodChartProps) {
  const total = cash + card + credit
  const data = [
    { name: 'cash', value: cash, percent: total > 0 ? (cash / total) * 100 : 0 },
    { name: 'card', value: card, percent: total > 0 ? (card / total) * 100 : 0 },
    { name: 'credit', value: credit, percent: total > 0 ? (credit / total) * 100 : 0 },
  ].filter(item => item.value > 0)

  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-sm font-medium text-muted-foreground uppercase">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="flex justify-center gap-4 mt-2">
        {data.map((item) => (
          <div key={item.name} className="text-center">
            <p className="text-xs text-muted-foreground uppercase">{item.name}</p>
            <p className="text-sm font-bold">{formatPKR(item.value)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
