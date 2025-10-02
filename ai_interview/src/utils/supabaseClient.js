// src/utils/supabaseClient.js

import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The 'export' keyword here is essential. It makes the 'supabase' client
// available for other files to import.
export const supabase = createClient(supabaseUrl, supabaseAnonKey)