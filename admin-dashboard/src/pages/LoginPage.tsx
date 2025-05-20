import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  useTheme,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const theme = useTheme();

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    navigate('/dashboard', { replace: true });
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, preencha todos os campos.');
      return;
    }

    try {
      setIsLoading(true);
      await login(email, password);

      // Get the redirect location from state, or default to dashboard
      const from = (location.state as any)?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error: any) {
      if (error.response?.status === 401) {
        setError('Email ou senha inválidos.');
      } else if (error.message.includes('Unauthorized')) {
        setError('Você não tem permissão para acessar o painel admin.');
      } else {
        setError('Ocorreu um erro ao fazer login. Tente novamente.');
      }
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        background: `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={6}
          sx={{
            p: 5,
            width: '100%',
            borderRadius: 2,
            boxShadow: '0 8px 40px rgba(0, 0, 0, 0.12)'
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4
            }}
          >
            <img
              src="/logo.png"
              alt="CityFix Logo"
              style={{ width: 100, height: 100, marginBottom: 16 }}
            />
            <Typography
              component="h1"
              variant="h5"
              sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}
            >
              CityFix Admin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Painel administrativo para gerenciamento de ocorrências
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailIcon color="action" />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Senha"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              disabled={isLoading}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              sx={{
                mt: 4,
                mb: 2,
                py: 1.5,
                fontWeight: 'bold'
              }}
              disabled={isLoading}
            >
              {isLoading ? <CircularProgress size={24} /> : 'Entrar'}
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
};

export default LoginPage;
