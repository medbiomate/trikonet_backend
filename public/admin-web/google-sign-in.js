// Google renders its own button and returns an ID token for server verification.
export async function initGoogleSignIn() {
  const containers = [...document.querySelectorAll('[data-google-signin]')];
  if (!containers.length) return;
  const message = (text, error = false) => {
    document.querySelectorAll('[data-google-message]').forEach(node => {
      node.textContent = text;
      node.className = `form-message${error ? ' error' : ''}`;
    });
  };
  try {
    const response = await fetch('/api/auth/google-config');
    if (!response.ok) throw new Error('Google sign-in is temporarily unavailable. Please try again later.');
    const { clientId } = await response.json();
    if (!clientId) throw new Error('Google sign-in is not available yet. Please use your email and password.');
    if (!window.google?.accounts?.id) await new Promise((resolve, reject) => {
      const script = document.createElement('script');
      const timeout = setTimeout(() => reject(new Error('Google sign-in could not load. Please refresh to retry.')), 15000);
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = () => { clearTimeout(timeout); resolve(); };
      script.onerror = () => { clearTimeout(timeout); reject(new Error('Google sign-in could not load. Please refresh to retry.')); };
      document.head.appendChild(script);
    });
    let submitting = false;
    window.google.accounts.id.initialize({
      client_id: clientId,
      callback: async ({ credential }) => {
        if (submitting) return;
        submitting = true;
        message('Signing in…');
        try {
          const response = await fetch('/api/auth/google', {
            method: 'POST', credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential })
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.error || 'Google sign-in failed. Please try again.');
          const requested = new URLSearchParams(location.search).get('redirect');
          const target = requested ? new URL(requested, location.origin) : null;
          location.href = '/profile';
        } catch (error) {
          message(error.message || 'Connection error. Please try again.', true);
          submitting = false;
        }
      }
    });
    containers.forEach(container => window.google.accounts.id.renderButton(container, {
      theme: 'outline', size: 'large', text: 'continue_with', shape: 'rectangular', width: 400
    }));
    message('');
  } catch (error) {
    message(error.message, true);
  }
}
