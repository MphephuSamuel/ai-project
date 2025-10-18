import { useEffect, useState } from 'react'
import { getInfo } from '../api'
import Paper from '@mui/material/Paper'
import Typography from '@mui/material/Typography'
import InfoIcon from '@mui/icons-material/Info'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableRow from '@mui/material/TableRow'
import CircularProgress from '@mui/material/CircularProgress'
import Box from '@mui/material/Box'

export default function InfoPage(){
  const [info, setInfo] = useState<any | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(()=>{
    let mounted = true
    setLoading(true)
    getInfo()
      .then(data => { if(mounted){ setInfo(data); setError(null) } })
      .catch((err)=>{ if(mounted){ setInfo(null); setError(err?.message || 'Unable to load model info') } })
      .finally(()=>{ if(mounted) setLoading(false) })
    return ()=>{ mounted = false }
  }, [])

  if(loading) return (
    <Paper sx={{p:3, boxShadow:3, borderRadius:2}}>
      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <CircularProgress size={20} />
        <Typography>Loading model info…</Typography>
      </Box>
    </Paper>
  )

  if(error || !info) return (
    <Paper sx={{p:3, boxShadow:3}}>
      <Typography>Unable to load model info{error ? `: ${error}` : ''}</Typography>
    </Paper>
  )

  return (
    <Paper sx={{p:3, boxShadow:3, borderRadius:2}}>
      <Typography variant="h5" gutterBottom sx={{ display:'flex', gap:1, alignItems:'center' }}><InfoIcon /> Model Info</Typography>
      <Typography>Pipeline: {info.pipeline_path}</Typography>
      <Table>
        <TableBody>
          <TableRow><TableCell>Feature order</TableCell><TableCell>{info.feature_order.join(', ')}</TableCell></TableRow>
          <TableRow><TableCell>Intercept</TableCell><TableCell>{info.intercept}</TableCell></TableRow>
          <TableRow><TableCell>Model class</TableCell><TableCell>{info.model_class}</TableCell></TableRow>
        </TableBody>
      </Table>
      <Typography sx={{mt:2}}>Coefficients</Typography>
      <Table>
        <TableBody>
          {info.coefficients && info.coefficients.map((c:number,i:number)=>(<TableRow key={i}><TableCell>{info.feature_order[i]}</TableCell><TableCell>{c}</TableCell></TableRow>))}
        </TableBody>
      </Table>
    </Paper>
  )
}
