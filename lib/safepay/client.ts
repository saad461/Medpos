const SAFEPAY_BASE_URL = process.env.NEXT_PUBLIC_SAFEPAY_ENVIRONMENT === 'production'
  ? 'https://api.getsafepay.com'
  : 'https://sandbox.api.getsafepay.com'

export async function safepayRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
  body?: Record<string, unknown>
) {
  const response = await fetch(`${SAFEPAY_BASE_URL}${endpoint}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.SAFEPAY_SECRET_KEY}`,
      'X-SFPY-MERCHANT-SECRET': process.env.SAFEPAY_API_KEY!,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(`Safepay API error: ${JSON.stringify(error)}`)
  }

  return response.json()
}
