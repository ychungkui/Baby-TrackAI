import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

    // Verify user
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    })

    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: corsHeaders })
    }

    const userId = user.id
    const userEmail = user.email

    // Admin client for deletion
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // 1. Compute email hash and store in deleted_accounts for anti-abuse
    if (userEmail) {
      const emailHash = await sha256Hex(userEmail.toLowerCase())
      await adminClient
        .from('deleted_accounts')
        .upsert({ email_hash: emailHash }, { onConflict: 'email_hash' })
    }

    // 2. Get all baby IDs for this user
    const { data: babies } = await adminClient
      .from('babies')
      .select('id')
      .eq('user_id', userId)

    const babyIds = babies?.map((b: any) => b.id) || []

    if (babyIds.length > 0) {
      // Get growth photos to delete from storage
      const { data: photos } = await adminClient
        .from('growth_photos')
        .select('image_url')
        .in('baby_id', babyIds)

      // Delete files from storage bucket
      if (photos && photos.length > 0) {
        const filePaths = photos
          .map((p: any) => {
            try {
              const url = new URL(p.image_url)
              const match = url.pathname.match(/\/storage\/v1\/object\/public\/growth-photos\/(.+)/)
              return match ? match[1] : null
            } catch {
              return null
            }
          })
          .filter(Boolean) as string[]

        if (filePaths.length > 0) {
          await adminClient.storage.from('growth-photos').remove(filePaths)
        }
      }

      // Delete growth_photos rows
      await adminClient.from('growth_photos').delete().in('baby_id', babyIds)

      // Delete records
      await adminClient.from('records').delete().in('baby_id', babyIds)

      // Delete bedtime_summaries
      await adminClient.from('bedtime_summaries').delete().in('baby_id', babyIds)

      // Delete babies
      await adminClient.from('babies').delete().eq('user_id', userId)
    }

    // Delete profile
    await adminClient.from('profiles').delete().eq('user_id', userId)

    // Delete auth user
    const { error: deleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (deleteError) {
      console.error('Failed to delete auth user:', deleteError)
      return new Response(JSON.stringify({ error: 'Failed to delete account' }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  } catch (err) {
    console.error('delete-account error:', err)
    return new Response(JSON.stringify({ error: 'Internal server error' }), { status: 500, headers: corsHeaders })
  }
})
