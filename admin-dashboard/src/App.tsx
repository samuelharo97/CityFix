import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ptBR } from '@mui/material/locale';
import { AuthProvider } from './contexts/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReportDetailsPage from './pages/ReportDetailsPage';
import { useEffect } from 'react';

const theme = createTheme(
  {
    palette: {
      primary: {
        light: '#4dabf5',
        main: '#2196f3',
        dark: '#1565c0',
        contrastText: '#fff'
      },
      secondary: {
        light: '#ff5983',
        main: '#f50057',
        dark: '#c51162',
        contrastText: '#fff'
      },
      background: {
        default: '#f5f5f5',
        paper: '#ffffff'
      }
    },
    typography: {
      fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: {
        fontWeight: 500
      },
      h2: {
        fontWeight: 500
      },
      h3: {
        fontWeight: 500
      },
      h4: {
        fontWeight: 500
      },
      h5: {
        fontWeight: 500
      },
      h6: {
        fontWeight: 500
      }
    },
    shape: {
      borderRadius: 8
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 8,
            padding: '8px 16px'
          }
        }
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  },
  ptBR
);

function App() {
  useEffect(() => {
    // Set the favicon
    const link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
    if (!link) {
      const newLink = document.createElement('link');
      newLink.rel = 'icon';
      newLink.href = '/logo.png';
      document.head.appendChild(newLink);
    } else {
      link.href = '/logo.png';
    }

    // Set the document title
    document.title = 'CityFix Admin';
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/dashboard"
              element={
                <PrivateRoute>
                  <DashboardPage />
                </PrivateRoute>
              }
            />
            <Route
              path="/reports/:id"
              element={
                <PrivateRoute>
                  <ReportDetailsPage />
                </PrivateRoute>
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
