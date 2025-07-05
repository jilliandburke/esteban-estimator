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
          ...corsHeaders,
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

    // Check if this epic already exists in the database
    const { data: existingEpic, error: queryError } = await supabaseClient
      .from('epics')
      .select('id')
      .eq('shortcut_id', epicData.id)
      .maybeSingle()

    if (queryError) {
      throw new Error(`Database query error: ${queryError.message}`)
    }

    // Prepare the epic data for upsert
    const dataForUpsert = {
      shortcut_id: epicData.id,
      title: epicData.name,
      description: epicData.description,
      link: epicData.app_url,
      team_id: settingsData.team_id,
      story_count: storiesData.length,
      updated_at: new Date().toISOString(),
    }

    // If this is a new epic (doesn't exist yet), set created_at
    if (!existingEpic) {
      epicData.created_at = new Date().toISOString()
    }

    // Store Epic in Supabase
    const { data: epicUpsertData, error: epicUpsertError } = await supabaseClient
      .from('epics')
      .upsert(dataForUpsert, { onConflict: 'shortcut_id', ignoreDuplicates: false })
      .select()

    if (epicUpsertError) {
      throw new Error(`Database upsert error: ${epicUpsertError.message}`)
    }

    // Store Stories in Supabase
    const storiesUpsertData = storiesData.map((story) => ({
      shortcut_id: story.id,
      title: story.name,
      description: story.description,
      link: story.app_url,
      epic_id: epicUpsertData[0].uuid,
    }))

    const { data: storiesUpsertResult, error: storiesUpsertError } = await supabaseClient
      .from('stories')
      .upsert(storiesUpsertData, { onConflict: 'shortcut_id', ignoreDuplicates: false })
      .select()

    if (storiesUpsertError) {
      throw storiesUpsertError
    }

    // After successfully inserting an epic
    if (!existingEpic) {
      // Collect emails of team for Slack notification
      let teamEmails = []
      const { data: teamData, error } = await supabaseClient
        .from('users_teams')
        .select('*, profiles ( email )')
        .eq('team_id', settingsData.team_id)

      if (error) {
        throw error
      } else {
        teamEmails = teamData.map((item) => item.profiles.email)
      }

      try {
        // Call the Slack notifier function
        const notifierResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/slack-notifier`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${Deno.env.get('SUPABASE_ANON_KEY')}`,
            },

            body: JSON.stringify({
              recipients: [...teamEmails],
              // Replace with actual recipients
              message: `New Epic Ready for Estimation\n\n>*${epicUpsertData[0].title}*\n>${epicUpsertData[0].story_count} stories`,
              button: {
                text: 'Estimate Now',
                url: `${Deno.env.get('SITE_URL')}/estimation/${epicUpsertData[0].uuid}`,

                style: 'primary',
              },
            }),
          },
        )

        const notifierResult = await notifierResponse.json()

        console.log('Slack notification result:', notifierResult)
      } catch (notifyError) {
        // Log the error but don't fail the whole function
        console.error('Failed to send notification:', notifyError)
      }
    }

    return new Response(
      JSON.stringify({
        epic: epicUpsertData,
        stories: storiesUpsertResult,
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
