import { useState, useEffect } from 'react'
import { useTheme } from '@mui/material/styles'
import useMediaQuery from '@mui/material/useMediaQuery'
import { predict } from '../api'
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
import { LineChart } from '@mui/x-charts'

const FEATURE_ORDER = ["2012","2013","2014","2015","2016","2017"]

export default function PredictPage(){
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const [values, setValues] = useState<string[]>(Array(FEATURE_ORDER.length).fill(''))
  const [result, setResult] = useState<number | null>(null)
  // GDP values for each year (not used in logic)
  const [gdpValues, setGdpValues] = useState<string[]>(Array(FEATURE_ORDER.length).fill(''))
  // Handler for GDP field changes
  const handleGdpChange = (i:number, v:string) => {
    const next = [...gdpValues]; next[i] = v; setGdpValues(next)
  }
  const [model, setModel] = useState<string | undefined>(undefined)
  const [loading, setLoading] = useState(false)
  const [snack, setSnack] = useState<{open:boolean;msg:string;severity?:'error'|'success'}>({open:false,msg:'',severity:'success'})
  const [batchText, setBatchText] = useState('')
  // const [batchResults, setBatchResults] = useState<number[] | null>(null)
  const [autoForecastResults, setAutoForecastResults] = useState<Array<{inputs: number[], prediction: number}> | null>(null)
  const [seriesData, setSeriesData] = useState<number[] | null>(null)
  const [xAxisData, setXAxisData] = useState<(string | number)[] | null>(null)
  // Target year logic: allow user to pick the forecast year (Year 7 means predict next year)
  const currentYear = new Date().getFullYear()
  const lastFeatureYear = parseInt(FEATURE_ORDER[FEATURE_ORDER.length - 1], 10)
  const [targetYear, setTargetYear] = useState<number>(Math.max(currentYear, lastFeatureYear + 1))

  // dedicated validation snackbar state for target-year validation (persistent)
  const [validationOpen, setValidationOpen] = useState<boolean>(false)

  const numFeatures = FEATURE_ORDER.length
  // compute the display years for the input fields: previous numFeatures years ending at targetYear-1
  const startYear = targetYear - numFeatures
  const displayYears = Array.from({ length: numFeatures }, (_, i) => String(startYear + i))

  const handleChange = (i:number, v:string) => {
    const next = [...values]; next[i] = v; setValues(next)
  }

  // Show immediate persistent validation Snackbar when user selects a target year before current year
  useEffect(() => {
    setValidationOpen(targetYear < currentYear)
  }, [targetYear])

  const onSubmit = async ()=>{
    const nums = values.map(v=>parseFloat(v))
    if(nums.some(n=>Number.isNaN(n))){ setSnack({open:true,msg:'Please enter valid numbers for all features',severity:'error'}); return }
    if(targetYear < currentYear){ setSnack({open:true,msg:'Target year must be the current year or later',severity:'error'}); return }
    setLoading(true); setResult(null)
    try{
      const res = await predict(nums)
      setResult(res.prediction); setModel(res.model)
      // build series: historical years -> predicted year
  const histYears = displayYears
  const predLabel = String(targetYear)
  // series: array of numeric values; xAxis: categorical labels
  setSeriesData([...nums, res.prediction])
  setXAxisData([...histYears, predLabel])
    }catch(e:any){ alert('Prediction error: '+(e?.message||e)) }
    setLoading(false)
  }

  // Auto-forecast: for the first input row, call predict 3 times, each time using the previous prediction as the next input
  const onBatch = async () => {
    // parse first row only
    const rows = batchText.split(/\r?\n/).map(r=>r.trim()).filter(Boolean).map(r=>r.split(/[\s,]+/).map(x=>parseFloat(x)))
    if(rows.length === 0 || rows[0].length !== FEATURE_ORDER.length){ setSnack({open:true,msg:'Please enter at least one row with 6 values',severity:'error'}); return }
    setLoading(true)
  // setBatchResults(null)
    setAutoForecastResults(null)
    try {
      let input = rows[0]
      const results: Array<{inputs: number[], prediction: number}> = []
      let lastPrediction = null
      for(let i=0; i<3; ++i) {
        const res = await predict(input)
        results.push({inputs: input, prediction: res.prediction})
        lastPrediction = res.prediction
        // next input: drop first, append prediction
        input = [...input.slice(1), lastPrediction]
      }
      setAutoForecastResults(results)
      setModel('auto-forecast')
    } catch(e:any) {
      alert('Auto-forecast error: '+(e?.message||e))
    }
    setLoading(false)
  }

  return (
    <Paper sx={{ p:3, boxShadow:3, borderRadius:2 }}>
      <Typography variant="h5" gutterBottom>Single Prediction</Typography>
  <Typography variant="caption" sx={{ display:'block', mb:1 }}>Enter values for the previous {numFeatures} years ({displayYears[0]}–{displayYears[numFeatures-1]}). Select the year you want to predict.</Typography>
      <Box sx={{ display:'flex', gap:2, alignItems:'center', mb:2 }}>
        <TextField label="Predict for year (YYYY)" type="number" value={targetYear} onChange={(e)=>setTargetYear(parseInt(e.target.value||'0',10))} size="small" />
        <Typography variant="caption">Current year: {currentYear}</Typography>
      </Box>

      <Grid container spacing={2} sx={{ mb:2 }}>
        {FEATURE_ORDER.map((f,i)=> (
          <Grid key={f} item xs={12} sm={6} md={4}>
            <TextField label={`Unemployment rate for ${displayYears[i]}`} value={values[i]} onChange={(e)=>handleChange(i,e.target.value)} size="small" fullWidth variant="outlined" />
          </Grid>
        ))}
      </Grid>

      {/* GDP fields for each year */}
      <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>GDP for each year (optional)</Typography>
      <Grid container spacing={2} sx={{ mb:2 }}>
        {FEATURE_ORDER.map((f,i)=> (
          <Grid key={f+"-gdp"} item xs={12} sm={6} md={4}>
            <TextField label={`GDP for ${displayYears[i]}`} value={gdpValues[i]} onChange={(e)=>handleGdpChange(i,e.target.value)} size="small" fullWidth variant="outlined" />
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display:'flex', alignItems:'center', gap:2 }}>
        <Button variant="contained" onClick={onSubmit} disabled={loading || targetYear < currentYear} startIcon={<PlayArrowIcon />}>Predict</Button>
        {loading && <CircularProgress size={24} />}
      </Box>

      {result !== null && (
        <Box sx={{ mt:3 }}>
          <Divider sx={{ mb:2 }} />
          <Typography variant="h6">Prediction: {Number(result).toFixed(2)}%</Typography>
          <Typography variant="caption">Model: {model}</Typography>
          {seriesData && xAxisData && (
            <Box sx={{ mt:2, height: isMobile ? 260 : 320, p:0, width: '100%', bgcolor: 'transparent' }}>
                <LineChart
                  series={[
                    { id: 'trend', data: seriesData, label: 'Unemployment', showMark: true, shape: 'circle' },
                    // a helper series that only contains the final (predicted) point so it can be emphasized
                    { id: 'pred', data: seriesData.map((v, i) => (i === seriesData.length - 1 ? v : null)), showMark: true, shape: 'circle', label: 'Predicted' }
                  ]}
                  xAxis={[{ data: xAxisData, scaleType: 'point', tickLabelStyle: { fontSize: 11, fill: theme.palette.text.secondary }, label: 'Year' }]}
                  colors={[theme.palette.primary.main, theme.palette.secondary.main]}
                  grid={{ vertical: false, horizontal: true }}
                  height={isMobile ? 260 : 320}
                  // give extra right/bottom margin so the last tick and label are not clipped
                  margin={{ left: isMobile ? 8 : 36, right: isMobile ? 24 : 56, top: 8, bottom: 40 }}
                  sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 1, p: 1 }}
                  yAxis={[{ label: 'Unemployment rate (youth)', tickLabelStyle: { fontSize: 12, fill: theme.palette.text.secondary }, valueFormatter: (v: any) => typeof v === 'number' ? Number(v).toFixed(1) : String(v) }]}
                  slotProps={{
                    tooltip: { sx: { bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, boxShadow: theme.shadows[3] } }
                  }}
                />
              </Box>
          )}
        </Box>
      )}

      <Box sx={{ mt:4 }}>
        <Divider />
        <Typography variant="h6" sx={{ mt:2 }}>Batch prediction (paste CSV or whitespace-separated rows)</Typography>
        <TextField multiline minRows={6} fullWidth value={batchText} onChange={(e)=>setBatchText(e.target.value)} placeholder="one row per line, 6 values per row" sx={{ mt:2 }} />
        {/* GDP batch input (not used in prediction) */}
        <TextField
          multiline
          minRows={6}
          fullWidth
          placeholder="one row per line, 6 GDP values per row"
          sx={{ mt:2 }}
          label="Batch GDP values (6 values per row)"
        />
        <Box sx={{ mt:2, display:'flex', gap:2, alignItems:'center' }}>
          <Button variant="outlined" onClick={onBatch} disabled={loading || targetYear < currentYear} startIcon={<FileUploadIcon />}>Predict Batch</Button>
        </Box>
        {autoForecastResults && autoForecastResults.length > 0 && (
          <Box sx={{ mt:3 }}>
            <Typography variant="subtitle1" sx={{ mb:2 }}>Auto Forecast Results</Typography>
            <Grid container spacing={2}>
              {autoForecastResults.map((res, idx) => {
                const forecastYear = targetYear + 1 + idx
                return (
                  <Grid item xs={12} sm={6} md={4} key={idx}>
                    <Paper sx={{ p:2, borderRadius:2, boxShadow:2, display:'flex', flexDirection:'column', alignItems:'flex-start', gap:1, minHeight: 140 }}>
                      <Typography variant="h6" color="primary">Forecast for {forecastYear}</Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>Prediction: {Number(res.prediction).toFixed(2)}%</Typography>
                      <Typography variant="caption" color="text.secondary">Input values: {res.inputs.map(v => `${v}%`).join(', ')}</Typography>
                    </Paper>
                  </Grid>
                )
              })}
            </Grid>

            {/* Trend line below the cards */}
            <Box sx={{ mt:4, width: '100%' }}>
              <Typography variant="subtitle2" sx={{ mb:1 }}>Forecast Trend</Typography>
              {(() => {
                // Get input values and years from the first input row
                const inputRows = batchText.split(/\r?\n/).map(r=>r.trim()).filter(Boolean)
                const inputVals = inputRows.length > 0 ? inputRows[0].split(/[\s,]+/).map(Number) : []
                // Start trend at the correct year (e.g., 2020), with each input mapped to consecutive years
                const trendStartYear = targetYear - inputVals.length
                const numInput = inputVals.length
                const numForecast = autoForecastResults.length
                const allYears = Array.from({length: numInput + numForecast}, (_, i) => trendStartYear + 1 + i)
                const allVals = [...inputVals, ...autoForecastResults.map(r => r.prediction)]
                return (
                  <LineChart
                    series={[{ id: 'trend', data: allVals, label: 'Trend', showMark: true, shape: 'circle' }]}
                    xAxis={[{ data: allYears, scaleType: 'point', label: 'Year', tickLabelStyle: { fontSize: 11 } }]}
                    yAxis={[{ label: 'Unemployment rate (%)', tickLabelStyle: { fontSize: 12 } }]}
                    height={260}
                    margin={{ left: 36, right: 36, top: 8, bottom: 40 }}
                    sx={{ backgroundColor: theme.palette.background.paper, borderRadius: 1, p: 1 }}
                    slotProps={{ tooltip: { sx: { bgcolor: theme.palette.background.paper, color: theme.palette.text.primary, boxShadow: theme.shadows[3] } } }}
                  />
                )
              })()}
            </Box>
          </Box>
        )}
      </Box>

      <Snackbar open={snack.open} autoHideDuration={5000} onClose={()=>setSnack(s=>({...s,open:false}))}>
        <Alert severity={snack.severity} sx={{ width: '100%' }}>{snack.msg}</Alert>
      </Snackbar>
      <Snackbar open={validationOpen} onClose={()=>setValidationOpen(false)}>
        <Alert severity="error" sx={{ width: '100%' }}>Cannot predict for previous years — select the current year or a future year</Alert>
      </Snackbar>
    </Paper>
  )
}
