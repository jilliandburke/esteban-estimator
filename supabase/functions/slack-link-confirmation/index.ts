import { corsHeaders } from '../_shared/cors.ts'

// Handle OPTIONS requests for CORS preflight
async function handleOptions(req: Request) {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
}

// Main handler function
Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  const preflightResponse = await handleOptions(req)
  if (preflightResponse) return preflightResponse

  try {
    // Log the request for debugging purposes
    console.log('Received link confirmation request')
    console.log('Method:', req.method)
    console.log('Headers:', Object.fromEntries(req.headers.entries()))

    // Try to log the body if it exists
    try {
      const contentType = req.headers.get('content-type') || ''
      if (contentType.includes('application/x-www-form-urlencoded')) {
        const formData = await req.formData()
        console.log('Form data:', Object.fromEntries(formData.entries()))
      } else if (contentType.includes('application/json')) {
        const jsonData = await req.json()
        console.log('JSON data:', jsonData)
      } else {
        const textData = await req.text()
        console.log('Text data:', textData)
      }
    } catch (e) {
      console.log('Could not parse request body:', e.message)
    }

    // Simply return a 200 OK response
    // This is all Slack needs to remove the warning icon
    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Link click confirmed',
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  } catch (error) {
    console.error('Error processing link confirmation:', error)

    // Even on error, return a 200 OK to satisfy Slack
    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Link click processed with errors',
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    )
  }
})
