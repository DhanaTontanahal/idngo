const KEY = 'idgo.session';

export function getSession() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isSignedIn() {
  return Boolean(getSession()?.name);
}

export function signIn(colleague) {
  const session = {
    name: colleague.name,
    id: colleague.id,
    team: colleague.team,
    signedInAt: new Date().toISOString(),
  };
  sessionStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

export function signOut() {
  sessionStorage.removeItem(KEY);
}
