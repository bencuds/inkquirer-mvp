import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://asxslhpisdqkggjargfm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzeHNsaHBpc2Rxa2dnamFyZ2ZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkzNzU4MTksImV4cCI6MjA2NDk1MTgxOX0.XIAaBmaAnyBWMn5uAwxk61w__5_wN02IujI6F-0UzXc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
