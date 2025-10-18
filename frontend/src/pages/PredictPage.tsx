import React, { useState } from 'react'
import { predict, predictBatch } from '../api'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import FileUploadIcon from '@mui/icons-material/FileUpload'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Paper from '@mui/material/Paper'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import CircularProgress from '@mui/material/CircularProgress'

const FEATURE_ORDER = ["2012","2013","2014","2015","2016","2017"]

export default function PredictPage(){
  const [values, setValues] = useState<string[]>(Array(FEATURE_ORDER.length).fill(''))
  const [result, setResult] = useState<number | null>(null)
  const [model, setModel] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState<{open:boolean;msg:string;severity?:'error'|'success'}>({open:false,msg:'',severity:'success'})
  const [batchText, setBatchText] = useState('')
  const [batchResults, setBatchResults] = useState<number[] | null>(null)

  const handleChange = (i:number, v:string) => {
    const next = [...values]; next[i] = v; setValues(next)
  }

  const onSubmit = async ()=>{
    const nums = values.map(v=>parseFloat(v))
    if(nums.some(n=>Number.isNaN(n))){ setSnack({open:true,msg:'Please enter valid numbers for all features',severity:'error'}); return }
    setLoading(true); setResult(null)
    try{
      const res = await predict(nums)
      setResult(res.prediction); setModel(res.model)
    }catch(e:any){ alert('Prediction error: '+(e?.message||e)) }
    setLoading(false)
  }

  const onBatch = async ()=>{
    // parse CSV-like lines
    const rows = batchText.split(/\r?\n/).map(r=>r.trim()).filter(Boolean).map(r=>r.split(/[,\s]+/).map(x=>parseFloat(x)))
    if(rows.some(r=>r.length !== FEATURE_ORDER.length)){ setSnack({open:true,msg:'Each row must have 6 values',severity:'error'}); return }
    setLoading(true)
    try{
      const res = await predictBatch(rows)
      setBatchResults(res.predictions)
      setModel(res.model)
    }catch(e:any){ alert('Batch error: '+(e?.message||e)) }
    setLoading(false)
  }

  return (
    <Paper sx={{ p:3, boxShadow:3, borderRadius:2 }}>
      <Typography variant="h5" gutterBottom>Single Prediction</Typography>
      <Grid container spacing={2} sx={{ mb:2 }}>
        {FEATURE_ORDER.map((f,i)=> (
          <Grid key={f} item xs={12} sm={6} md={4}>
            <TextField label={f} value={values[i]} onChange={(e)=>handleChange(i,e.target.value)} size="small" fullWidth variant="outlined" />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <Button variant="contained" onClick={onSubmit} disabled={loading} startIcon={<PlayArrowIcon />}>Predict</Button>
        {loading && <CircularProgress size={24} />}
      </Box>

      {result !== null && (
        <Box sx={{ mt:3 }}>
          <Divider sx={{ mb:2 }} />
          <Typography variant="h6">Prediction: {result}</Typography>
          <Typography variant="caption">Model: {model}</Typography>
        </Box>
      )}

      <Box sx={{ mt:4 }}>
        <Divider />
        <Typography variant="h6" sx={{ mt:2 }}>Batch prediction (paste CSV or whitespace-separated rows)</Typography>
        <TextField multiline minRows={6} fullWidth value={batchText} onChange={(e)=>setBatchText(e.target.value)} placeholder="one row per line, 6 values per row" sx={{ mt:2 }} />
          <Box sx={{ mt:2, display:'flex', gap:2, alignItems:'center' }}>
          <Button variant="outlined" onClick={onBatch} disabled={loading} startIcon={<FileUploadIcon />}>Predict Batch</Button>
          {batchResults && (
            <Typography>Results: {batchResults.length} rows</Typography>
          )}
        </Box>
      </Box>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={()=>setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.msg}</Alert>
      </Snackbar>
    </Paper>
  )
}
