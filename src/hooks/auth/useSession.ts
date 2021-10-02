import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

export default function useSession(): {
  electronSessionId: string;
  onSignOut: () => void;
} {
  const [electronSessionId, setElectronSessionId] =
    useState<string | null>(null);
  if (electronSessionId == null) {
    const sessionId = uuidv4();
    setElectronSessionId(sessionId);
  }
  return { electronSessionId, onSignOut: () => setElectronSessionId(null) };
}
