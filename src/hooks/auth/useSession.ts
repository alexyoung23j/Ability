import { useEffect, useState } from 'react';
import { ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION } from '../../components/auth/AuthDAO';
import { v4 as uuidv4 } from 'uuid';
import { UserAuthInfo } from '../../components/auth/SignIn';
import * as db from '../../firebase/db';

export default function useSession(): {
  electronSessionId: string;
  onSignOut: () => void;
} {
  debugger;
  const [electronSessionId, setElectronSessionId] =
    useState<string | null>(null);
  if (electronSessionId == null) {
    setElectronSessionId(uuidv4());
  }

  return { electronSessionId, onSignOut: () => setElectronSessionId(null) };
}
