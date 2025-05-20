import { BrowserRouter as Router } from 'react-router-dom';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { ptBR } from '@mui/material/locale';
import { AuthProvider } from './contexts/AuthContext';
import AppRoutes from './routes';

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
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
