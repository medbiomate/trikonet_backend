export function recordSignInPlatform(user, req, body = {}) {
 const origin=String(req.headers.origin || '');
 const platform=body.clientPlatform==='app' || /^(capacitor|ionic):\/\//.test(origin) || origin==='http://localhost' || origin==='https://localhost' ? 'app' : 'website';
 user.signInPlatforms=[...new Set([...(user.signInPlatforms || []),platform])];
 user.lastSignInPlatform=platform;user.lastSignInAt=new Date().toISOString();
 return platform;
}
