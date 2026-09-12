import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { EmptyState } from '@/components/common/empty-state'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatChartDate, formatChartDateFull, formatMoney, formatNumber } from '@/lib/format'
import { useT } from '@/lib/i18n'

export function ExpenseDynamicsChart({ data }: { data: { date: string; amount: number }[] }) {
  const t = useT()

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('reports.expenseDynamics')}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <EmptyState message={t('reports.expensesEmpty')} />
        ) : (
          <div className="h-[240px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 0 }}>
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
                  formatter={(value) => [formatMoney(Number(value)), t('reports.expenses')]}
                  contentStyle={{
                    background: 'var(--surface)',
                    border: '1px solid var(--line)',
                    borderRadius: 8,
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="amount" fill="#B8863C" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
