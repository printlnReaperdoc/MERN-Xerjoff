import React, { useEffect, useState, useRef } from 'react'
import { Box, Typography, Container, Button, TextField } from '@mui/material'
import Chart from 'chart.js/auto'
import dayjs from 'dayjs'

const API_URL = import.meta.env.VITE_API_URL || ""

function ChartCanvas({ type, chartData, chartOptions }) {
  const canvasRef = useRef(null)
  const chartRef = useRef(null)

  useEffect(() => {
    if (!canvasRef.current) return

    if (chartRef.current) {
      chartRef.current.destroy()
      chartRef.current = null
    }

    const ctx = canvasRef.current.getContext('2d')
    chartRef.current = new Chart(ctx, {
      type,
      data: chartData,
      options: chartOptions,
    })

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy()
        chartRef.current = null
      }
    }
  }, [type, JSON.stringify(chartData), JSON.stringify(chartOptions)])

  return <canvas ref={canvasRef} />
}

function generateSampleDailySales(year = dayjs().year(), count = 30) {
  const start = dayjs(`${year}-01-01`)
  const end = dayjs(`${year}-12-31`)
  const daysRange = end.diff(start, 'day') + 1
  const dates = new Set()
  while (dates.size < count) {
    const offset = Math.floor(Math.random() * daysRange)
    dates.add(start.add(offset, 'day').format('YYYY-MM-DD'))
  }
  return Array.from(dates)
    .sort()
    .map(d => ({ date: d, total: Math.floor(Math.random() * 450) + 50 })) // totals 50-499
}

function aggregateMonthlyFromDaily(dailyArray) {
  const months = new Array(12).fill(0)
  dailyArray.forEach(d => {
    const m = dayjs(d.date).month() // 0-11
    months[m] += d.total
  })
  return months
}

function mapApiMonthlyToArray(apiMonthly) {
  const monthLabels = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]
  const months = new Array(12).fill(0)
  if (!Array.isArray(apiMonthly) || apiMonthly.length === 0) return months

  for (const item of apiMonthly) {
    const mRaw = item.month ?? item.label ?? item.name ?? ''
    let idx = -1
    if (typeof mRaw === 'string') {
      // YYYY-MM or YYYY-M
      const match = mRaw.match(/\d{4}-(\d{1,2})/)
      if (match) idx = parseInt(match[1], 10) - 1
      else {
        const short = mRaw.slice(0,3).toLowerCase()
        idx = monthLabels.findIndex(mm => mm.slice(0,3).toLowerCase() === short)
      }
    } else if (typeof mRaw === 'number') {
      idx = mRaw - 1
    }
    if (idx >= 0 && idx < 12) months[idx] = item.total ?? months[idx]
  }
  return months
}

function Sales() {
  const [monthlySales, setMonthlySales] = useState([])
  const [rangeSales, setRangeSales] = useState([])
  const [startDate, setStartDate] = useState(dayjs().startOf('month').format('YYYY-MM-DD'))
  const [endDate, setEndDate] = useState(dayjs().endOf('month').format('YYYY-MM-DD'))
  const [loading, setLoading] = useState(false)

  // Local sample daily data to use when API is not available
  const [sampleDaily, setSampleDaily] = useState(() => generateSampleDailySales())

  // Fetch monthly sales
  useEffect(() => {
    const fetchMonthlySales = async () => {
      try {
        const res = await fetch(`${API_URL}/api/sales/monthly`)
        if (res.ok) {
          const data = await res.json()
          // if API returns empty, keep sample fallback
          if (!data || (Array.isArray(data) && data.length === 0)) {
            setMonthlySales([]) // will fallback to sample below
          } else {
            setMonthlySales(data)
          }
        } else {
          setMonthlySales([])
        }
      } catch {
        setMonthlySales([])
      }
    }
    fetchMonthlySales()
  }, [API_URL])

  // Fetch sales for date range
  const fetchRangeSales = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/sales/range?start=${startDate}&end=${endDate}`)
      if (res.ok) {
        const data = await res.json()
        if (!data || (Array.isArray(data) && data.length === 0)) {
          // fallback: filter sampleDaily
          const filtered = sampleDaily.filter(d => d.date >= startDate && d.date <= endDate)
          setRangeSales(filtered)
        } else {
          setRangeSales(data)
        }
      } else {
        const filtered = sampleDaily.filter(d => d.date >= startDate && d.date <= endDate)
        setRangeSales(filtered)
      }
    } catch {
      const filtered = sampleDaily.filter(d => d.date >= startDate && d.date <= endDate)
      setRangeSales(filtered)
    }
    setLoading(false)
  }

  useEffect(() => {
    // initial range load (uses API or sample)
    fetchRangeSales()
    // eslint-disable-next-line
  }, [])

  // Chart data for monthly sales: ensure labels are full months Jan-Dec
  const monthLabels = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ]

  // monthlyTotals either from API (mapped) or aggregated from sampleDaily
  const monthlyTotals = (monthlySales && monthlySales.length > 0)
    ? mapApiMonthlyToArray(monthlySales)
    : aggregateMonthlyFromDaily(sampleDaily)

  const monthlyChartData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Sales',
        data: monthlyTotals,
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25,118,210,0.1)',
        tension: 0.3,
        fill: true,
      },
    ],
  }

  const monthlyChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { title: { display: true, text: 'Month' } },
      y: { title: { display: true, text: 'Sales ($)' }, beginAtZero: true },
    },
  }

  // Range chart data (uses API data if present; otherwise uses sampleDaily filtered by selected range)
  const rangeDataSource = (rangeSales && rangeSales.length > 0) ? rangeSales : sampleDaily.filter(d => d.date >= startDate && d.date <= endDate)

  // range labels and totals (ensure sorted by date)
  const sortedRange = [...rangeDataSource].sort((a, b) => a.date.localeCompare(b.date))
  const rangeLabels = sortedRange.map(s => s.date)
  const rangeData = sortedRange.map(s => s.total)

  const rangeChartData = {
    labels: rangeLabels,
    datasets: [
      {
        label: 'Sales',
        data: rangeData,
        backgroundColor: '#43a047',
      },
    ],
  }

  const rangeChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false },
    },
    scales: {
      x: { title: { display: true, text: 'Date' } },
      y: { title: { display: true, text: 'Sales ($)' }, beginAtZero: true },
    },
  }

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" sx={{ fontWeight: 700, mb: 4, textTransform: 'uppercase' }}>
        Sales Dashboard
      </Typography>

      {/* Monthly Sales Chart */}
      <Box sx={{ mb: 6 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>
          Monthly Sales Overview
        </Typography>
        <ChartCanvas type="line" chartData={monthlyChartData} chartOptions={monthlyChartOptions} />
      </Box>

      {/* Date Range Filter */}
      <Box sx={{ mb: 4, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h5">Sales by Date Range</Typography>
        <TextField
          label="Start Date"
          type="date"
          size="small"
          value={startDate}
          onChange={e => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="End Date"
          type="date"
          size="small"
          value={endDate}
          onChange={e => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <Button variant="contained" onClick={fetchRangeSales} disabled={loading}>
          Filter
        </Button>
      </Box>

      {/* Range Sales Chart */}
      <Box>
        <ChartCanvas type="bar" chartData={rangeChartData} chartOptions={rangeChartOptions} />
      </Box>
    </Container>
  )
}

export default Sales
