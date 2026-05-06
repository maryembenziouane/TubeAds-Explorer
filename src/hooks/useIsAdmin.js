import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../context/AuthContext';

function uidAllowlist() {
  const raw = typeof process.env.REACT_APP_ADMIN_UIDS === 'string' ? process.env.REACT_APP_ADMIN_UIDS : '';
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  );
}

/**
 * Admin access for moderation UI:
 * - Preferred: Firebase Auth custom claim `{ admin: true }`
 * - Dev / bootstrap: comma-separated Firebase Auth UIDs in `REACT_APP_ADMIN_UIDS`
 */
export default function useIsAdmin() {
  const { user } = useAuth();
  const allowed = useMemo(() => uidAllowlist(), []);
  const [claimsAdmin, setClaimsAdmin] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setReady(false);
      if (!user) {
        if (!cancelled) {
          setClaimsAdmin(false);
          setReady(true);
        }
        return;
      }
      if (allowed.has(user.uid)) {
        if (!cancelled) {
          setClaimsAdmin(true);
          setReady(true);
        }
        return;
      }
      try {
        const r = await user.getIdTokenResult(true);
        if (!cancelled) setClaimsAdmin(!!r?.claims?.admin);
      } catch {
        if (!cancelled) setClaimsAdmin(false);
      } finally {
        if (!cancelled) setReady(true);
      }
    }
    run();
    return () => {
      cancelled = true;
    };
  }, [user, allowed]);

  const isAdmin = !!user && (allowed.has(user.uid) || claimsAdmin);
  return { isAdmin, ready };
}
