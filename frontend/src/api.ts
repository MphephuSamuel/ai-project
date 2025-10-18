import axios from 'axios'

const BASE = import.meta.env.VITE_API_BASE_URL || 'https://unemployment-backend-latest.onrender.com'

export interface PredictResponse { prediction: number; model?: string }
export interface BatchResponse { predictions: number[]; model?: string }
export interface InfoResponse { pipeline_path: string; feature_order: string[]; coefficients: number[] | null; intercept: number | null; model_class: string | null }
export interface HealthResponse { ok: boolean; model_loaded: boolean; pipeline_path?: string }

const client = axios.create({ baseURL: BASE })

export async function predict(features: number[]): Promise<PredictResponse> {
  const res = await client.post('/predict', { features })
  return res.data
}

export async function predictBatch(batch: number[][]): Promise<BatchResponse> {
  const res = await client.post('/predict_batch', { batch })
  return res.data
}

export async function getInfo(): Promise<InfoResponse> {
  const res = await client.get('/info')
  return res.data
}

export async function getHealth(): Promise<HealthResponse> {
  const res = await client.get('/health')
  return res.data
}

export default client
