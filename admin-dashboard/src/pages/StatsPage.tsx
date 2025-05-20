import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  GridLegacy as Grid
} from '@mui/material';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { reportsApi } from '../services/api';
import DashboardLayout from '../components/DashboardLayout';
import { getStatusDetails, getCategoryLabel } from '../utils/formatters';
import { ReportStatus, ReportCategory } from '../types';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

// Interfaces para dados de estatísticas
interface SummaryStats {
  totalReports: number;
  byStatus: {
    pending: number;
    inProgress: number;
    resolved: number;
    rejected: number;
  };
  resolutionRate: number;
  avgResolutionTimeHours: number;
  medianResolutionTimeHours: number;
  avgFirstResponseTimeHours: number;
  medianFirstResponseTimeHours: number;
}

interface CategoryStats {
  category: string;
  count: number;
}

interface StatusStats {
  status: string;
  count: number;
}

interface DateStats {
  period: string;
  data: Array<{
    date: string;
    total: number;
    byStatus: {
      pending: number;
      in_progress: number;
      resolved: number;
      rejected: number;
    };
  }>;
}

// Cores para gráficos
const chartColors = {
  pending: 'rgba(255, 159, 64, 0.8)',
  inProgress: 'rgba(54, 162, 235, 0.8)',
  resolved: 'rgba(75, 192, 192, 0.8)',
  rejected: 'rgba(255, 99, 132, 0.8)',
  background: [
    'rgba(255, 99, 132, 0.8)',
    'rgba(54, 162, 235, 0.8)',
    'rgba(255, 206, 86, 0.8)',
    'rgba(75, 192, 192, 0.8)',
    'rgba(153, 102, 255, 0.8)',
    'rgba(255, 159, 64, 0.8)',
    'rgba(199, 199, 199, 0.8)',
    'rgba(83, 102, 255, 0.8)',
    'rgba(40, 159, 90, 0.8)',
    'rgba(210, 105, 30, 0.8)'
  ]
};

export default function StatsPage() {
  const [loading, setLoading] = useState<boolean>(true);
  const [summaryStats, setSummaryStats] = useState<SummaryStats | null>(null);
  const [categoryStats, setCategoryStats] = useState<CategoryStats[]>([]);
  const [statusStats, setStatusStats] = useState<StatusStats[]>([]);
  const [dateStats, setDateStats] = useState<DateStats | null>(null);
  const [datePeriod, setDatePeriod] = useState<'day' | 'week' | 'month'>(
    'week'
  );

  useEffect(() => {
    fetchAllStats();
  }, []);

  useEffect(() => {
    fetchDateStats();
  }, [datePeriod]);

  const fetchAllStats = async () => {
    setLoading(true);
    try {
      const [summary, categories, statuses, dates] = await Promise.all([
        reportsApi.getStatsSummary(),
        reportsApi.getStatsByCategory(),
        reportsApi.getStatsByStatus(),
        reportsApi.getStatsByDate(datePeriod)
      ]);

      setSummaryStats(summary);
      setCategoryStats(categories);
      setStatusStats(statuses);
      setDateStats(dates);
    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDateStats = async () => {
    try {
      const dates = await reportsApi.getStatsByDate(datePeriod);
      setDateStats(dates);
    } catch (error) {
      console.error('Erro ao buscar estatísticas por data:', error);
    }
  };

  const handlePeriodChange = (
    event: React.MouseEvent<HTMLElement>,
    newPeriod: 'day' | 'week' | 'month'
  ) => {
    if (newPeriod !== null) {
      setDatePeriod(newPeriod);
    }
  };

  // Formatar data com base no período
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);

    if (datePeriod === 'day') {
      return date.toLocaleDateString('pt-BR', {
        month: 'short',
        day: 'numeric'
      });
    } else if (datePeriod === 'week') {
      return `Semana de ${date.toLocaleDateString('pt-BR', {
        month: 'short',
        day: 'numeric'
      })}`;
    } else {
      return date.toLocaleDateString('pt-BR', {
        year: 'numeric',
        month: 'short'
      });
    }
  };

  // Dados para gráfico de denúncias por status
  const statusChartData = {
    labels: statusStats.map(item => {
      const { label } = getStatusDetails(item.status as ReportStatus);
      return label;
    }),
    datasets: [
      {
        label: 'Denúncias por Status',
        data: statusStats.map(item => item.count),
        backgroundColor: [
          chartColors.pending,
          chartColors.inProgress,
          chartColors.resolved,
          chartColors.rejected
        ],
        borderWidth: 1
      }
    ]
  };

  // Dados para gráfico de denúncias por categoria
  const categoryChartData = {
    labels: categoryStats.map(item =>
      getCategoryLabel(item.category as ReportCategory)
    ),
    datasets: [
      {
        label: 'Denúncias por Categoria',
        data: categoryStats.map(item => item.count),
        backgroundColor: chartColors.background.slice(0, categoryStats.length),
        borderWidth: 1
      }
    ]
  };

  // Dados para gráfico de denúncias ao longo do tempo
  const timeChartData = dateStats
    ? {
        labels: dateStats.data.map(item => formatDate(item.date)),
        datasets: [
          {
            label: 'Total de Denúncias',
            data: dateStats.data.map(item => item.total),
            borderColor: 'rgba(75, 192, 192, 1)',
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            tension: 0.1,
            fill: true
          }
        ]
      }
    : { labels: [], datasets: [] };

  // Dados para gráfico de denúncias por status ao longo do tempo
  const statusTimeChartData = dateStats
    ? {
        labels: dateStats.data.map(item => formatDate(item.date)),
        datasets: [
          {
            label: 'Pendente',
            data: dateStats.data.map(item => item.byStatus.pending || 0),
            backgroundColor: chartColors.pending,
            stack: 'Stack 0'
          },
          {
            label: 'Em Andamento',
            data: dateStats.data.map(item => item.byStatus.in_progress || 0),
            backgroundColor: chartColors.inProgress,
            stack: 'Stack 0'
          },
          {
            label: 'Resolvido',
            data: dateStats.data.map(item => item.byStatus.resolved || 0),
            backgroundColor: chartColors.resolved,
            stack: 'Stack 0'
          },
          {
            label: 'Rejeitado',
            data: dateStats.data.map(item => item.byStatus.rejected || 0),
            backgroundColor: chartColors.rejected,
            stack: 'Stack 0'
          }
        ]
      }
    : { labels: [], datasets: [] };

  const chartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const
      }
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="60vh"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <DashboardLayout title="Painel de Estatísticas">
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" gutterBottom component="h2">
          Painel de Estatísticas
        </Typography>

        <Grid container spacing={3}>
          {/* Cards de Resumo */}
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2">
                  {summaryStats?.totalReports || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total de Denúncias
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2">
                  {summaryStats?.resolutionRate.toFixed(1) || 0}%
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Taxa de Resolução
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2">
                  {summaryStats?.avgResolutionTimeHours.toFixed(1) || 0}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tempo Médio de Resolução
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2">
                  {summaryStats?.byStatus.resolved || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Denúncias Resolvidas
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Cards adicionais de métricas de tempo */}
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2">
                  {summaryStats?.medianResolutionTimeHours.toFixed(1) || 0}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tempo Mediano de Resolução
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2">
                  {summaryStats?.avgFirstResponseTimeHours.toFixed(1) || 0}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tempo Médio de Primeira Resposta
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2">
                  {summaryStats?.medianFirstResponseTimeHours.toFixed(1) || 0}h
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tempo Mediano de Primeira Resposta
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={6} lg={3}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2">
                  {summaryStats?.byStatus.inProgress || 0}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Denúncias em Andamento
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Gráfico de Denúncias por Status */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 300
              }}
            >
              <Typography variant="h6" gutterBottom component="div">
                Denúncias por Status
              </Typography>
              <Box sx={{ height: 250 }}>
                <Doughnut
                  data={statusChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Gráfico de Denúncias por Categoria */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 300
              }}
            >
              <Typography variant="h6" gutterBottom component="div">
                Principais Categorias
              </Typography>
              <Box sx={{ height: 250 }}>
                <Bar
                  data={categoryChartData}
                  options={{
                    ...chartOptions,
                    indexAxis: 'y' as const
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Gráfico de Denúncias ao Longo do Tempo */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 400
              }}
            >
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}
              >
                <Typography variant="h6" component="div">
                  Denúncias ao Longo do Tempo
                </Typography>
                <ToggleButtonGroup
                  value={datePeriod}
                  exclusive
                  onChange={handlePeriodChange}
                  size="small"
                >
                  <ToggleButton value="day">Diário</ToggleButton>
                  <ToggleButton value="week">Semanal</ToggleButton>
                  <ToggleButton value="month">Mensal</ToggleButton>
                </ToggleButtonGroup>
              </Box>
              <Divider />
              <Box sx={{ height: 300, mt: 2 }}>
                <Line
                  data={timeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>

          {/* Gráfico de Denúncias por Status ao Longo do Tempo */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 2,
                display: 'flex',
                flexDirection: 'column',
                height: 400
              }}
            >
              <Typography variant="h6" gutterBottom component="div">
                Denúncias por Status ao Longo do Tempo
              </Typography>
              <Box sx={{ height: 320 }}>
                <Bar
                  data={statusTimeChartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                      x: {
                        stacked: true
                      },
                      y: {
                        stacked: true,
                        beginAtZero: true
                      }
                    }
                  }}
                />
              </Box>
            </Paper>
          </Grid>
        </Grid>
      </Container>
    </DashboardLayout>
  );
}
