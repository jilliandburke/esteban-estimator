import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
// @ts-expect-error Deno doesn't import from npm well
import { createClient } from 'npm:@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: corsHeaders,
    })
  }
  try {
    const payload = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    )

    const { data, error: authError } = await supabaseClient.auth.admin.inviteUserByEmail(
      payload.email,
    )

    if (authError) {
      throw authError
    }

    const { data: updatedUser, error } = await supabaseClient
      .from('profiles')
      .update({
        full_name: payload.name,
      })
      .eq('id', data.user.id)
      .select()

    if (error) {
      throw error
    }

    const { error: userTeamError } = await supabaseClient.from('users_teams').insert({
      user_id: data.user.id,
      team_id: payload.team.code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (userTeamError) {
      throw userTeamError
    }

    return new Response(
      JSON.stringify({
        user: updatedUser,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})
