import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Parse the request body from the client
    const body = await request.json();
    const { drug, zip } = body;

    // 2. Validate the input to ensure we have something to search for
    if (!drug && !zip) {
      return NextResponse.json(
        { error: 'At least one search parameter (drug or zip) is required.' },
        { status: 400 }
      );
    }

    // 3. Construct the external API URL safely
    const externalApiUrl = new URL('https://api.rxprescribers.com/api.php');
    if (drug) {
      externalApiUrl.searchParams.append('drug', String(drug));
    }
    if (zip) {
      externalApiUrl.searchParams.append('zip', String(zip));
    }

    // 4. Make the GET request to the external API
    const apiResponse = await fetch(externalApiUrl.toString());

    // 5. Check if the external API call was successful
    if (!apiResponse.ok) {
      // If not, log the error and forward a descriptive error to the client
      const errorText = await apiResponse.text();
      console.error(`External API Error: ${apiResponse.status} ${apiResponse.statusText}`, errorText);
      return NextResponse.json(
        { error: 'Failed to fetch data from the external provider.' },
        { status: apiResponse.status }
      );
    }

    // 6. Parse the JSON response from the external API and send it back to our client
    const data = await apiResponse.json();
    return NextResponse.json(data);

  } catch (error) {
    // 7. Catch any other errors (e.g., malformed JSON from client, network issues)
    console.error('An unexpected error occurred in /api/search:', error);

    // Specifically check for JSON parsing errors from the initial request
    if (error instanceof SyntaxError) {
      return NextResponse.json({ error: 'Invalid JSON in request body.' }, { status: 400 });
    }

    return NextResponse.json(
      { error: 'An internal server error occurred.' },
      { status: 500 }
    );
  }
}
