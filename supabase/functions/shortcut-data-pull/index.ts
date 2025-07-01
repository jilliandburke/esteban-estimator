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
    const isUpdate = payload?.actions[0].action === 'update'
    const isEpic = payload?.actions[0].entity_type === 'epic'

    if (!isUpdate && !isEpic) {
      return
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL'),
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'),
    )

    // Get settings from Supabase
    const { data: settingsData, error: settingsError } = await supabaseClient
      .from('settings')
      .select()
      .single()

    if (settingsError) {
      throw settingsError
    }

    const epicId = payload.primary_id

    // Fetch Epic details from Shortcut API
    const response = await fetch(`https://api.app.shortcut.com/api/v3/epics/${epicId}`, {
      method: 'GET',
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
        'Shortcut-Token': settingsData.sc_api_key,
      },
    })

    if (!response.ok) {
      throw new Error('Failed to fetch Epic details')
    }

    const epicData = await response.json()

    if (!epicData.label_ids.includes(settingsData.sc_label_id)) {
      return new Response({
        headers: {
          'Content-Type': 'application/json',
        },
        status: 204,
      })
    }

    // Fetch Stories associated with the Epic
    const storiesResponse = await fetch(
      `https://api.app.shortcut.com/api/v3/epics/${epicId}/stories?includes_description=true`,
      {
        method: 'GET',
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Shortcut-Token': settingsData.sc_api_key,
        },
      },
    )

    if (!storiesResponse.ok) {
      throw new Error('Failed to fetch Stories')
    }

    const storiesData = await storiesResponse.json()

    // Store Epic in Supabase
    const { data: epicUpsertData, error: epicUpsertError } = await supabaseClient
      .from('epics')
      .upsert(
        {
          shortcut_id: epicData.id,
          title: epicData.name,
          description: epicData.description,
          link: epicData.app_url,
          team_id: settingsData.team_id,
          story_count: storiesData.length,
        },
        { onConflict: 'shortcut_id', ignoreDuplicates: false },
      )
      .select()

    if (epicUpsertError) {
      throw epicUpsertError
    }

    // Store Stories in Supabase
    const storiesUpsertData = storiesData.map((story) => ({
      shortcut_id: story.id,
      title: story.name,
      description: story.description,
      epic_id: epicUpsertData[0].uuid,
    }))

    const { data: storiesUpsertResult, error: storiesUpsertError } = await supabaseClient
      .from('stories')
      .upsert(storiesUpsertData, { onConflict: 'shortcut_id', ignoreDuplicates: false })
      .select()

    if (storiesUpsertError) {
      throw storiesUpsertError
    }

    return new Response(
      JSON.stringify({
        epic: epicUpsertData,
        stories: storiesUpsertResult,
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
