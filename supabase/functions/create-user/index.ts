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
        password: payload.password,
        email_confirm: true,
        user_metadata: { name: 'Yoda' },
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

    const { error: userRoleError } = await supabaseClient.from('users_roles').insert({
      user_id: createdUser.user.id,
      role_id: payload.role.code,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })

    if (userRoleError) {
      throw userRoleError
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
