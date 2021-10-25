import { useState } from 'react';
import { readOnce } from '../../firebase/db';
import { UserAuthInfo } from './SignIn';

export const ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION =
  'electronIdsToUserIds';
