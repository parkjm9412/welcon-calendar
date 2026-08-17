import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://ayviqkbjmmydnvszwwcs.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5dmlxa2JqbW15ZG52c3p3d2NzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY2ODg1ODMsImV4cCI6MjEwMjI2NDU4M30.g-DPHHI6Y56DRMb5883WqZ3Arg8-bGwMdo9FWIRUUog'

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
