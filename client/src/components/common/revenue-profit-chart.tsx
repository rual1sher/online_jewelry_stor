import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/common/empty-state'
import { formatChartDate, formatChartDateFull, formatMoney, formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'

interface ChartPoint {
  date: string
  revenue: number
  profit: number
}

export function RevenueProfitChart({ data }: { data: ChartPoint[] }) {
  const t = useT()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('chart.revenueProfit')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState message={t('chart.noData')} />
        ) : (
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
                <CartesianGrid stroke="var(--line)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value: string) => formatChartDate(value)}
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={{ stroke: 'var(--line)' }}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(value: number) => formatNumber(value)}
                  tick={{ fill: 'var(--muted)', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                  width={70}
                />
                <Tooltip
                  labelFormatter={(value) => formatChartDateFull(String(value))}
                  formatter={(value, name) => [
                    formatMoney(Number(value)),
                    name === 'revenue' ? t('chart.revenue') : t('chart.profit'),
                  ]}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="var(--accent)"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="#3C7A5C"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
