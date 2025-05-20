import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Card,
  CardContent,
  Alert,
  useTheme,
  Paper,
  IconButton,
  Tooltip,
  Badge
} from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridRenderCellParams,
  GridToolbar
} from '@mui/x-data-grid';
import {
  Refresh as RefreshIcon,
  FilterAlt as FilterIcon,
  FilterAltOff as FilterOffIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import { ReportStatus, ReportCategory } from '../types';
import type { Report } from '../types';
import DashboardLayout from '../components/DashboardLayout';
import { reportsApi } from '../services/api';
import {
  getStatusDetails,
  getCategoryLabel,
  formatDate
} from '../utils/formatters';

const DashboardPage = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [filteredReports, setFilteredReports] = useState<Report[]>([]);
  const [activeFilter, setActiveFilter] = useState<ReportStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const theme = useTheme();

  useEffect(() => {
    loadReports();
  }, []);

  useEffect(() => {
    if (activeFilter) {
      setFilteredReports(
        reports.filter(report => report.status === activeFilter)
      );
    } else {
      setFilteredReports(reports);
    }
  }, [reports, activeFilter]);

  const loadReports = async () => {
    try {
      setLoading(true);
      const data = await reportsApi.getReports();
      setReports(data);
      setFilteredReports(data);
      setError('');
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('Falha ao carregar os relatos. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/reports/${id}`);
  };

  const handleFilterByStatus = (status: ReportStatus) => {
    if (activeFilter === status) {
      // If clicking the already active filter, clear it
      setActiveFilter(null);
    } else {
      // Otherwise, set the new filter
      setActiveFilter(status);
    }
  };

  const clearFilter = () => {
    setActiveFilter(null);
  };

  const columns: GridColDef[] = [
    { field: 'title', headerName: 'Título', flex: 1, minWidth: 200 },
    {
      field: 'category',
      headerName: 'Categoria',
      width: 150,
      renderCell: (params: GridRenderCellParams) =>
        getCategoryLabel(params.value as ReportCategory)
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params: GridRenderCellParams) => {
        const status = params.value as ReportStatus;
        const { label, color } = getStatusDetails(status);
        return <Chip label={label} color={color} size="small" />;
      }
    },
    {
      field: 'createdAt',
      headerName: 'Data de Criação',
      width: 180,
      renderCell: (params: GridRenderCellParams) =>
        formatDate(params.value as string)
    },
    {
      field: 'actions',
      headerName: 'Ações',
      width: 120,
      sortable: false,
      renderCell: (params: GridRenderCellParams) => (
        <Tooltip title="Ver detalhes">
          <IconButton
            size="small"
            color="primary"
            onClick={() => handleViewDetails(params.row.id)}
          >
            <ViewIcon />
          </IconButton>
        </Tooltip>
      )
    }
  ];

  // Get summary statistics by status
  const statusSummary = Object.values(ReportStatus).map(status => {
    const count = reports.filter(report => report.status === status).length;
    const { label, color, icon } = getStatusDetails(status);
    return { status, label, count, color, icon };
  });

  // Calculate total reports
  const totalReports = reports.length;

  const getColorFromPalette = (colorName: string) => {
    switch (colorName) {
      case 'warning':
        return theme.palette.warning.main;
      case 'info':
        return theme.palette.info.main;
      case 'success':
        return theme.palette.success.main;
      case 'error':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  return (
    <DashboardLayout title="Dashboard">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" fontWeight="500" sx={{ mb: 3 }}>
          Visão Geral de Ocorrências
        </Typography>

        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3
          }}
        >
          <Paper
            elevation={0}
            sx={{ p: 0, borderRadius: 2, overflow: 'hidden', flex: 2 }}
          >
            <Box
              sx={{
                p: 2,
                bgcolor: theme.palette.primary.main,
                color: 'white',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <Typography variant="h6">Resumo por Status</Typography>
              {activeFilter && (
                <Tooltip title="Limpar filtro">
                  <IconButton
                    color="inherit"
                    size="small"
                    onClick={clearFilter}
                  >
                    <FilterOffIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
            </Box>
            <Box sx={{ p: 2 }}>
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                  gap: 2
                }}
              >
                {statusSummary.map(({ status, label, count, color, icon }) => (
                  <Card
                    key={status}
                    elevation={0}
                    onClick={() => handleFilterByStatus(status)}
                    sx={{
                      borderLeft: `4px solid ${getColorFromPalette(color)}`,
                      height: '100%',
                      bgcolor:
                        status === activeFilter
                          ? `${getColorFromPalette(color)}15` // Add transparency
                          : theme.palette.background.default,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        transform: 'translateY(-3px)',
                        boxShadow: 2,
                        bgcolor: `${getColorFromPalette(color)}10`
                      },
                      position: 'relative'
                    }}
                  >
                    {status === activeFilter && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          color: getColorFromPalette(color)
                        }}
                      >
                        <FilterIcon fontSize="small" />
                      </Box>
                    )}
                    <CardContent>
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', mb: 1 }}
                      >
                        <Box sx={{ mr: 1, color: getColorFromPalette(color) }}>
                          {icon}
                        </Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {label}
                        </Typography>
                      </Box>
                      <Typography variant="h4" fontWeight="medium">
                        {count}
                      </Typography>
                      {totalReports > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {Math.round((count / totalReports) * 100)}% do total
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Box>
            </Box>
          </Paper>

          <Paper
            elevation={0}
            sx={{
              p: 0,
              borderRadius: 2,
              overflow: 'hidden',
              flex: 1,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Box
              sx={{ p: 2, bgcolor: theme.palette.primary.main, color: 'white' }}
            >
              <Typography variant="h6">Total de Ocorrências</Typography>
            </Box>
            <Box
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexGrow: 1
              }}
            >
              {activeFilter ? (
                <>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      mb: 1
                    }}
                  >
                    <Badge
                      badgeContent={filteredReports.length}
                      color={getStatusDetails(activeFilter).color}
                      sx={{
                        '.MuiBadge-badge': {
                          fontSize: '1rem',
                          height: '1.5rem',
                          minWidth: '1.5rem'
                        }
                      }}
                    >
                      <Typography
                        variant="h4"
                        color={getColorFromPalette(
                          getStatusDetails(activeFilter).color
                        )}
                      >
                        {getStatusDetails(activeFilter).label}
                      </Typography>
                    </Badge>
                  </Box>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    Mostrando {filteredReports.length} de {totalReports}{' '}
                    ocorrências
                  </Typography>
                </>
              ) : (
                <>
                  <Typography variant="h2" color="primary" fontWeight="medium">
                    {totalReports}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    align="center"
                  >
                    Total de ocorrências registradas no sistema
                  </Typography>
                </>
              )}
            </Box>
          </Paper>
        </Box>
      </Box>

      <Paper
        elevation={0}
        sx={{ p: 0, borderRadius: 2, overflow: 'hidden', mb: 4 }}
      >
        <Box
          sx={{
            p: 2,
            bgcolor: theme.palette.primary.main,
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="h6">Listagem de Ocorrências</Typography>
            {activeFilter && (
              <Chip
                label={getStatusDetails(activeFilter).label}
                color={getStatusDetails(activeFilter).color}
                size="small"
                onDelete={clearFilter}
                sx={{ ml: 1 }}
              />
            )}
          </Box>
          <Tooltip title="Atualizar dados">
            <IconButton color="inherit" onClick={loadReports} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {error && (
          <Alert severity="error" sx={{ m: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ height: 500, width: '100%' }}>
          <DataGrid
            rows={filteredReports}
            columns={columns}
            initialState={{
              pagination: {
                paginationModel: {
                  pageSize: 10
                }
              }
            }}
            pageSizeOptions={[10, 25, 50]}
            loading={loading}
            slots={{
              toolbar: GridToolbar
            }}
            sx={{
              border: 'none',
              '& .MuiDataGrid-columnHeader': {
                backgroundColor: theme.palette.grey[100]
              },
              '& .MuiDataGrid-cell:focus': {
                outline: 'none'
              }
            }}
          />
        </Box>
      </Paper>
    </DashboardLayout>
  );
};

export default DashboardPage;
