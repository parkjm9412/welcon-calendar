import { google } from 'googleapis'

const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ''
const clientSecret = process.env.GOOGLE_CLIENT_SECRET || ''
const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/auth/callback'

export function getGoogleAuthUrl() {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

  const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/userinfo.email',
    'https://www.googleapis.com/auth/userinfo.profile',
  ]

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  })

  return authUrl
}

export async function getGoogleAuthTokens(code: string) {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

  try {
    const { tokens } = await oauth2Client.getToken(code)
    return tokens
  } catch (error) {
    console.error('Failed to get Google auth tokens:', error)
    throw error
  }
}

export function getCalendarClient(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)
  oauth2Client.setCredentials({ access_token: accessToken })
  return google.calendar({ version: 'v3', auth: oauth2Client })
}

export async function createCalendarEvent(
  calendar: any,
  title: string,
  startDate: string,
  endDate: string,
  description?: string
) {
  try {
    const event = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: title,
        description: description,
        start: {
          dateTime: startDate,
          timeZone: 'Asia/Seoul',
        },
        end: {
          dateTime: endDate,
          timeZone: 'Asia/Seoul',
        },
      },
    })
    return event.data
  } catch (error) {
    console.error('Failed to create calendar event:', error)
    throw error
  }
}

export async function updateCalendarEvent(
  calendar: any,
  eventId: string,
  title: string,
  startDate: string,
  endDate: string,
  description?: string
) {
  try {
    const event = await calendar.events.update({
      calendarId: 'primary',
      eventId: eventId,
      requestBody: {
        summary: title,
        description: description,
        start: {
          dateTime: startDate,
          timeZone: 'Asia/Seoul',
        },
        end: {
          dateTime: endDate,
          timeZone: 'Asia/Seoul',
        },
      },
    })
    return event.data
  } catch (error) {
    console.error('Failed to update calendar event:', error)
    throw error
  }
}

export async function deleteCalendarEvent(calendar: any, eventId: string) {
  try {
    await calendar.events.delete({
      calendarId: 'primary',
      eventId: eventId,
    })
  } catch (error) {
    console.error('Failed to delete calendar event:', error)
    throw error
  }
}
