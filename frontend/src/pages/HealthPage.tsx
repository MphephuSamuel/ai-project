import { useEffect, useState } from 'react'
import { getHealth } from '../api'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import HealthAndSafetyIcon from '@mui/icons-material/HealthAndSafety'

export default function HealthPage(){
  const [health, setHealth] = useState<any>(null)
  useEffect(()=>{ getHealth().then(setHealth).catch(()=>setHealth(null)) }, [])
  if(!health) return <Paper sx={{p:3, boxShadow:3}}><Typography>Unable to reach service</Typography></Paper>
  return (
    <Paper sx={{p:3, boxShadow:3, borderRadius:2}}>
      <Typography variant="h5" gutterBottom sx={{ display:'flex', gap:1, alignItems:'center' }}><HealthAndSafetyIcon /> Service Health</Typography>
      <Typography>OK: {String(health.ok)}</Typography>
      <Typography>Model loaded: {String(health.model_loaded)}</Typography>
      <Typography>Pipeline: {health.pipeline_path}</Typography>
    </Paper>
  )
}
