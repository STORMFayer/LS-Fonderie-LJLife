import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return json({ success: false, error: 'Non authentifié.' }, 401)

    // Client scoped to the caller's own JWT, used only to verify who is asking.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: userData, error: userErr } = await callerClient.auth.getUser()
    if (userErr || !userData.user) return json({ success: false, error: 'Session invalide.' }, 401)

    const { data: profile, error: profileErr } = await callerClient
      .from('employees')
      .select('role')
      .eq('id', userData.user.id)
      .single()

    if (profileErr || profile?.role !== 'admin') {
      return json({ success: false, error: 'Accès réservé aux admins.' }, 403)
    }

    const { discord, password, prenom, nom, role } = await req.json()

    if (!discord?.trim() || !password || !prenom?.trim() || !nom?.trim()) {
      return json({ success: false, error: 'Tous les champs sont requis.' }, 400)
    }
    if (password.length < 8) {
      return json({ success: false, error: 'Mot de passe : 8 caractères minimum.' }, 400)
    }

    const admin = createClient(supabaseUrl, serviceKey)
    const slug = discord.trim().toLowerCase().replace(/[^a-z0-9]/g, '')
    const email = `${slug}@ls-fonderie.dev`

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: `${prenom.trim()} ${nom.trim()}`,
        discord: discord.trim(),
        role: role === 'admin' ? 'admin' : 'employe',
      },
    })

    if (createErr) {
      const message = /duplicate key|already.*registered|already exists/i.test(createErr.message)
        ? 'Ce Discord ID est déjà utilisé.'
        : createErr.message
      return json({ success: false, error: message }, 400)
    }

    return json({ success: true, id: created.user?.id })
  } catch (e) {
    return json({ success: false, error: e instanceof Error ? e.message : String(e) }, 500)
  }
})
