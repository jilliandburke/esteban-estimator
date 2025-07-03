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

    // Get settings (sc api key) from Supabase
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from('settings')
      .select()
      .single()

    if (settingsError) {
      throw settingsError
    }

    for (const story of payload) {
      // Update estimation on each shortcut story
      const storiesResponse = await fetch(
        `https://api.app.shortcut.com/api/v3/stories/${story.shortcut_id}`,
        {
          method: 'PUT',
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            'Shortcut-Token': settingsData.sc_api_key,
          },
          body: JSON.stringify({
            estimate: story.story_points,
          }),
        },
      )

      if (!storiesResponse.ok) {
        throw new Error(`Failed to update story ${story.id}`)
      }
    }

    return new Response(JSON.stringify({}), {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status: 200,
    })
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
