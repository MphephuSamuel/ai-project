import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import CampaignIcon from '@mui/icons-material/Campaign'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

import PredictPage from './pages/PredictPage'
import InfoPage from './pages/InfoPage'
import HealthPage from './pages/HealthPage'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#0B72B9' }, // vibrant blue
    secondary: { main: '#FF8A65' }, // warm accent
    background: {
      default: '#f6f9fc',
      paper: '#ffffff'
    },
    text: {
      primary: '#0f1724',
      secondary: '#475569'
    }
  },
  typography: {
    fontFamily: `Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial`,
    h5: { fontWeight: 600 },
    body1: { fontSize: 16 }
  },
  shape: { borderRadius: 12 },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(90deg,#0B72B9 0%,#1976D2 100%)',
          boxShadow: '0 4px 14px rgba(11,114,185,0.18)'
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(90deg,#0B72B9,#1976D2)',
          color: '#fff',
          boxShadow: '0 6px 18px rgba(11,114,185,0.18)'
        }
      }
    }
  }
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1, display:'flex', alignItems:'center', gap:1 }} component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <CampaignIcon /> Unemployment Predictor
            </Typography>
            <Button color="inherit" component={Link} to="/">Predict</Button>
            <Button color="inherit" component={Link} to="/info">Model Info</Button>
            <Button color="inherit" component={Link} to="/health">Health</Button>
          </Toolbar>
        </AppBar>

        <Box sx={{ mt: 4, mb: 4 }}>
          <Container maxWidth="lg">
            <Routes>
              <Route path="/" element={<PredictPage />} />
              <Route path="/info" element={<InfoPage />} />
              <Route path="/health" element={<HealthPage />} />
            </Routes>
          </Container>
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  )
}
