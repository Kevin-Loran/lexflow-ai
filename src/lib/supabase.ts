import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dmafrzaahrsrzgftyoqq.supabase.co'
const supabaseAnonKey = 'sb_publishable_1kiP6iE4HGSKEb6eOgKNdw_96Fb1z5K'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
