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

    const { data: createdUser, error: createUserError } =
      await supabaseClient.auth.admin.createUser({
        email: payload.email,
        email_confirm: true,
      })

    if (createUserError) {
      throw createUserError
    }

    const { data: updatedUser, error: updatedUserError } = await supabaseClient
      .from('profiles')
      .update({
        full_name: payload.name,
      })
      .eq('id', createdUser.user.id)
      .select()

    if (updatedUserError) {
      throw updatedUserError
    }

    const { error: userTeamError } = await supabaseClient.from('users_teams').insert({
      user_id: createdUser.user.id,
      team_id: payload.team.code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (userTeamError) {
      throw userTeamError
    }

    const { error: authError } = await supabaseClient.auth.admin.inviteUserByEmail(payload.email, {
      redirectTo: `http://localhost:5173/account-setup?userId=${createdUser.user.id}`,
    })

    if (authError) {
      throw authError
    }

    return new Response(
      JSON.stringify({
        user: updatedUser,
      }),
      {
        headers: {
          ...corsHeaders,
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
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
        status: 400,
      },
    )
  }
})
