import { NextResponse } from 'next/server'
import { getNews } from '@/lib/news'
import { biasSpread, BIAS_METHOD } from '@/lib/bias-engine'
import { SENTIMENT_METHOD } from '@/lib/sentiment-engine'

// The News Engine API: GET /api/news → normalized India headlines, each enriched
// by the Bias Engine and the Sentiment Engine, plus an aggregate spread.
// Revalidates so we don't hammer the provider.
export const revalidate = 600

export async function GET() {
  const result = await getNews()
  const spread = biasSpread(result.items.map((i) => i.source))
  const sentiments = result.items.map((i) => i.sentiment.label)
  const sentimentMix = {
    negative: sentiments.filter((s) => s === 'negative').length,
    neutral: sentiments.filter((s) => s === 'neutral').length,
    positive: sentiments.filter((s) => s === 'positive').length,
  }
  return NextResponse.json({
    ...result,
    aggregate: { biasSpread: spread, sentimentMix },
    method: { bias: BIAS_METHOD, sentiment: SENTIMENT_METHOD },
  })
}
