import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { corsHeaders } from '../_shared/cors.ts'

// Define the request body type for better type safety
interface SlackNotificationRequest {
  // The recipient(s) can be an email, username (with or without @), or Slack ID
  // Now accepts either a single string or an array of strings
  recipients: string | string[]
  // The message text to send
  message: string
  // Optional blocks for rich formatting (Slack Block Kit)
  blocks?: any[]
  // Optional attachments
  attachments?: any[]
  // Recipient type: 'email', 'username', or 'id' (default: auto-detect)
  recipientType?: 'email' | 'username' | 'id'
  // Optional button configuration
  button?: {
    text: string
    url: string
    style?: 'primary' | 'danger' // Optional button style
  }
  // Optional additional buttons
  additionalButtons?: Array<{
    text: string
    url: string
    style?: 'primary' | 'danger'
  }>
}

interface SlackNotificationResult {
  success: boolean
  recipientId: string
  slackTs?: string
  error?: string
}

async function handleOptions(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
}
// Helper function to create Block Kit blocks with buttons
function createMessageBlocks(
  message: string,
  button?: SlackNotificationRequest['button'],
  additionalButtons?: SlackNotificationRequest['additionalButtons'],
) {
  const blocks = [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: message,
      },
    },
  ]

  // If we have any buttons, add an actions block
  if (button || (additionalButtons && additionalButtons.length > 0)) {
    const actionsBlock: any = {
      type: 'actions',
      elements: [],
    }

    // Add the main button if provided
    if (button) {
      actionsBlock.elements.push({
        type: 'button',
        text: {
          type: 'plain_text',
          text: button.text,
          emoji: true,
        },
        url: button.url,
        ...(button.style ? { style: button.style } : {}),
      })
    }

    // Add any additional buttons
    if (additionalButtons && additionalButtons.length > 0) {
      for (const btn of additionalButtons) {
        actionsBlock.elements.push({
          type: 'button',
          text: {
            type: 'plain_text',
            text: btn.text,
            emoji: true,
          },
          url: btn.url,
          ...(btn.style ? { style: btn.style } : {}),
        })
      }
    }

    // Add the actions block to our blocks array
    blocks.push(actionsBlock)
  }

  return blocks
}

// Deno.serve is the recommended way to handle HTTP requests in Deno
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  const preflightResponse = await handleOptions(req)
  if (preflightResponse) return preflightResponse

  // Only allow POST requests
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { headers: corsHeaders, status: 405 })
  }

  try {
    // Get the Slack bot token from environment variables
    // const slackBotToken = Deno.env.get('SLACK_BOT_TOKEN')
    const slackBotToken = 'xoxb-9138175114871-9173178117920-mODFdOtvqbeMNBMw1aRYJWCI'
    if (!slackBotToken) {
      return new Response('SLACK_BOT_TOKEN environment variable not set', {
        headers: corsHeaders,
        status: 500,
      })
    }

    // Parse the request body
    const requestData: SlackNotificationRequest = await req.json()

    // Validate required fields
    if (!requestData.recipients || !requestData.message) {
      return new Response('Missing required fields: recipients and message are required', {
        headers: corsHeaders,
        status: 400,
      })
    }

    // Convert single recipient to array for consistent processing
    const recipientsList = Array.isArray(requestData.recipients)
      ? requestData.recipients
      : [requestData.recipients]

    if (recipientsList.length === 0) {
      return new Response('Recipients list cannot be empty', { headers: corsHeaders, status: 400 })
    }

    // Process each recipient
    const results: SlackNotificationResult[] = []
    const errors: string[] = []

    // Cache for users list to avoid multiple API calls when looking up usernames
    let cachedUsersList: any[] | null = null

    for (const recipient of recipientsList) {
      try {
        // Determine the recipient type if not explicitly provided
        let recipientType = requestData.recipientType
        if (!recipientType) {
          if (recipient.includes('@') && recipient.includes('.')) {
            recipientType = 'email'
          } else if (recipient.startsWith('U') && recipient.length > 8) {
            recipientType = 'id'
          } else {
            recipientType = 'username'
          }
        }

        // Get the Slack user ID if we don't have it already
        let slackUserId = recipient

        if (recipientType !== 'id') {
          // Clean up username if needed (remove @ prefix)
          if (recipientType === 'username' && slackUserId.startsWith('@')) {
            slackUserId = slackUserId.substring(1)
          }

          // Look up the user by email or username
          if (recipientType === 'email') {
            // Direct lookup by email
            const lookupResponse = await fetch(
              `https://slack.com/api/users.lookupByEmail?email=${encodeURIComponent(recipient)}`,
              {
                method: 'GET',
                headers: {
                  ...corsHeaders,
                  Authorization: `Bearer ${slackBotToken}`,
                },
              },
            )

            const lookupData = await lookupResponse.json()

            if (!lookupData.ok) {
              throw new Error(`Slack API error during email lookup: ${lookupData.error}`)
            }

            slackUserId = lookupData.user.id
          } else {
            // Username lookup - fetch users list only once if needed
            if (!cachedUsersList) {
              const lookupResponse = await fetch('https://slack.com/api/users.list', {
                method: 'GET',
                headers: {
                  ...corsHeaders,
                  Authorization: `Bearer ${slackBotToken}`,
                },
              })

              const lookupData = await lookupResponse.json()

              if (!lookupData.ok) {
                throw new Error(`Slack API error during users list fetch: ${lookupData.error}`)
              }

              cachedUsersList = lookupData.members
            }

            // Find user in cached list
            const targetUsername = slackUserId.toLowerCase()
            const matchingUser = cachedUsersList.find(
              (user: any) =>
                user.name.toLowerCase() === targetUsername ||
                user.real_name?.toLowerCase() === targetUsername,
            )

            if (!matchingUser) {
              throw new Error(`User not found with username: ${recipient}`)
            }

            slackUserId = matchingUser.id
          }
        }

        // Prepare the message payload
        const messagePayload: any = {
          channel: slackUserId,
          text: requestData.message,
        }

        // If custom blocks are provided, use them
        if (requestData.blocks) {
          messagePayload.blocks = requestData.blocks
        }
        // Otherwise, if we have a button or need to create blocks
        else if (requestData.button || requestData.additionalButtons) {
          messagePayload.blocks = createMessageBlocks(
            requestData.message,
            requestData.button,
            requestData.additionalButtons,
          )
        }
        // Add optional attachments if provided
        if (requestData.attachments) {
          messagePayload.attachments = requestData.attachments
        }

        // Send the message to Slack
        const response = await fetch('https://slack.com/api/chat.postMessage', {
          method: 'POST',
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
            Authorization: `Bearer ${slackBotToken}`,
          },
          body: JSON.stringify(messagePayload),
        })

        const slackResponse = await response.json()

        // Check if the message was sent successfully
        if (!slackResponse.ok) {
          throw new Error(`Slack API error: ${slackResponse.error}`)
        }

        // Add successful result
        results.push({
          success: true,
          recipientId: slackUserId,
          slackTs: slackResponse.ts,
        })
      } catch (error) {
        console.error(`Error processing recipient ${recipient}:`, error)

        // Add failed result
        results.push({
          success: false,
          recipientId: recipient,
          error: error.message,
        })

        errors.push(`${recipient}: ${error.message}`)
      }
    }

    // Return response with results for all recipients
    return new Response(
      JSON.stringify({
        overallSuccess: errors.length === 0,
        totalRecipients: recipientsList.length,
        successCount: results.filter((r) => r.success).length,
        failureCount: errors.length,
        results: results,
        errors: errors.length > 0 ? errors : undefined,
      }),
      {
        status: errors.length === 0 ? 200 : 207, // Use 207 Multi-Status if there are partial failures
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error processing request:', error)
    return new Response(`Error processing request: ${error.message}`, {
      headers: corsHeaders,
      status: 500,
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/slack-notifier' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
