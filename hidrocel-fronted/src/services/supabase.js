import { createClient } from '@supabase/supabase-js';

// Como son las credenciales públicas del frontend, podemos declararlas directamente
const supabaseUrl = 'https://rihonrhmnjflnchhxeks.supabase.co';
const supabaseKey = 'sb_publishable_eyMwPv_qYM7YGMOboAP1Ww_ziqmfA_w';

export const supabase = createClient(supabaseUrl, supabaseKey);