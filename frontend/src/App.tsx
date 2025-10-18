import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import { useState } from 'react'
import { createTheme, ThemeProvider, useTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
// replaced CampaignIcon with a custom image icon in header
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import IconButton from '@mui/material/IconButton'
import Drawer from '@mui/material/Drawer'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import useMediaQuery from '@mui/material/useMediaQuery'
import MenuIcon from '@mui/icons-material/Menu'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Container from '@mui/material/Container'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'

import PredictPage from './pages/PredictPage'
import InfoPage from './pages/InfoPage'
import HealthPage from './pages/HealthPage'

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#00897B' }, // A deep, professional teal
    secondary: { main: '#FFA000' }, // A vibrant, warm amber
    background: {
      default: '#f7f9fa', // A very light, clean gray
      paper: '#ffffff'
    },
    text: {
      primary: '#1a202c', // Dark, but not pure black
      secondary: '#525f7f'
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
          // A subtle gradient using the primary color
          background: 'linear-gradient(90deg,#00897B 0%,#009688 100%)',
          boxShadow: '0 4px 14px rgba(0, 137, 123, 0.18)' // Soft shadow based on primary color
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        containedPrimary: {
          background: 'linear-gradient(90deg,#00897B,#009688)',
          color: '#fff',
          boxShadow: '0 6px 18px rgba(0, 137, 123, 0.18)' // Soft shadow
        }
      }
    }
  }
});

export default function App() {
  const themeHook = useTheme()
  const isMobile = useMediaQuery(themeHook.breakpoints.down('sm'))
  const [drawerOpen, setDrawerOpen] = useState(false)

  const toggleDrawer = (open: boolean) => () => {
    setDrawerOpen(open)
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppBar position="static">
          <Toolbar>
            {isMobile ? (
              <IconButton edge="start" color="inherit" aria-label="menu" onClick={toggleDrawer(true)} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            ) : null}

            <Typography variant="h6" sx={{ flexGrow: 1, display:'flex', alignItems:'center', gap:1 }} component={Link} to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
              <img src="/image.png" alt="icon" style={{ width:28, height:28, objectFit:'cover', borderRadius:6 }} />
              Unemployment Predictor
            </Typography>

            {!isMobile && (
              <>
                <Button color="inherit" component={Link} to="/">Predict</Button>
                <Button color="inherit" component={Link} to="/info">Model Info</Button>
                <Button color="inherit" component={Link} to="/health">Health</Button>
              </>
            )}
          </Toolbar>
        </AppBar>

        <Drawer anchor="left" open={drawerOpen} onClose={toggleDrawer(false)}>
          <Box sx={{ width: 240 }} role="presentation" onClick={toggleDrawer(false)} onKeyDown={toggleDrawer(false)}>
            {/* Drawer header with logo */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2 }}>
              <img src="/image.png" alt="logo" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
              <Typography variant="h6" sx={{ fontSize: 16 }}>Unemployment Predictor</Typography>
            </Box>
            <Divider />
            <List>
              <ListItemButton component={Link} to="/">
                <ListItemText primary="Predict" />
              </ListItemButton>
              <ListItemButton component={Link} to="/info">
                <ListItemText primary="Model Info" />
              </ListItemButton>
              <ListItemButton component={Link} to="/health">
                <ListItemText primary="Health" />
              </ListItemButton>
            </List>
          </Box>
        </Drawer>

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
