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

    let updateData

    if (payload.password) {
      updateData = {
        password: payload.password,
      }
    }

    if (payload.email) {
      updateData = {
        ...updateData,
        email: payload.email,
      }
    }

    console.log(updateData)

    const { data: updatedUser, error: updatedUserError } =
      await supabaseClient.auth.admin.updateUserById(payload.id, { ...updateData })

    if (updatedUserError) {
      throw updatedUserError
    }

    const { error } = await supabaseClient
      .from('profiles')
      .update({
        email: payload.email,
      })
      .eq('id', updatedUser.user.id)
      .select()

    if (error) {
      throw error
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
