import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials are not set. Some features may not work.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'pkce',
    autoRefreshToken: true,
    persistSession: true,
  },
})

export async function initializeDatabase() {
  try {
    const { error } = await supabase.from('employees').select('count')
    if (error) {
      console.error('Database initialization error:', error)
      return false
    }
    return true
  } catch (error) {
    console.error('Failed to connect to database:', error)
    return false
  }
}
