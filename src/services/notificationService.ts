import { auth } from '../config/firebase';

/**
 * Dynamically resolve backend endpoint URLs for serverless functions
 */
export function getBackendEndpoint(endpointName: string): string {
  const envUrl =
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    import.meta.env.VITE_API_URL;

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    const trimmed = envUrl.trim().replace(/\/+$/, '');
    const origin = trimmed.replace(
      /\/(diagnoseCrop|adviseCrop|extractSoilReport|getMarketPrices|marketPrices|sendTestEmail)$/,
      ''
    );
    return `${origin}/${endpointName}`;
  }

  if (import.meta.env.PROD) {
    return `/${endpointName}`;
  }

  return `http://localhost:5001/${endpointName}`;
}

/**
 * Legacy wrapper for sendTestEmail endpoint resolution
 */
export function getNotificationBackendEndpoint(): string {
  return getBackendEndpoint('sendTestEmail');
}

export interface TestEmailResponse {
  success: boolean;
  message: string;
  recipient?: string;
  provider?: string;
  simulated?: boolean;
}

/**
 * Dispatch a test notification email to the authenticated user's registered email
 */
export async function sendTestEmail(): Promise<TestEmailResponse> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in to request a test email.');
  }

  const idToken = await currentUser.getIdToken();
  const endpoint = getBackendEndpoint('sendTestEmail');

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${idToken}`,
      },
      body: JSON.stringify({}),
    });

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const responseText = await response.text();
      const snippet = responseText.substring(0, 120).replace(/\s+/g, ' ');
      throw new Error(
        `Backend endpoint returned non-JSON response (HTTP ${response.status} ${response.statusText}, Content-Type: ${contentType || 'none'}). Snippet: "${snippet}". Please check backend connection.`
      );
    }

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || data.error || `Server error (${response.status})`);
    }

    return {
      success: true,
      message: data.message || `Test email sent to ${currentUser.email}.`,
      recipient: data.recipient || currentUser.email || undefined,
      provider: data.provider,
      simulated: data.simulated,
    };
  } catch (err: any) {
    console.error('[Notification Service Error]', err);
    throw new Error(err.message || 'Failed to dispatch test email. Please check backend connection.');
  }
}


