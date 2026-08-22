import { serve } from 'https://deno.land/std@0.208.0/http/server.ts'
import { JWT } from 'https://esm.sh/google-auth-library@9.14.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface GoogleEventInput {
  summary: string
  description?: string
  location?: string
  start: { date?: string; dateTime?: string; timeZone?: string }
  end: { date?: string; dateTime?: string; timeZone?: string }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = (await req.json()) as GoogleEventInput

    if (!body.summary || !body.start || !body.end) {
      return new Response(
        JSON.stringify({ success: false, error: 'summary, start, end 필드가 필요합니다.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 },
      )
    }

    const privateKey = Deno.env.get('GOOGLE_PRIVATE_KEY')
    const clientEmail = Deno.env.get('GOOGLE_CLIENT_EMAIL')
    const calendarId =
      Deno.env.get('GOOGLE_SHARED_CALENDAR_ID') ?? 'primary'
    const adminEmail =
      Deno.env.get('GOOGLE_ADMIN_EMAIL') ?? 'admin@welconsystems.com'

    if (!privateKey || !clientEmail) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Google credentials not configured',
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 503 },
      )
    }

    const auth = new JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
      subject: adminEmail,
    })

    const token = await auth.getAccessToken()

    const res = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token.token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      },
    )

    if (!res.ok) {
      const errText = await res.text()
      console.error('Google Calendar insert failed:', res.status, errText)
      return new Response(
        JSON.stringify({ success: false, error: `Google API ${res.status}: ${errText}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 502 },
      )
    }

    const created = await res.json()

    return new Response(
      JSON.stringify({ success: true, eventId: created.id, htmlLink: created.htmlLink }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 },
    )
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error)
    console.error('create-calendar-event error:', msg)
    return new Response(
      JSON.stringify({ success: false, error: msg }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 },
    )
  }
})
