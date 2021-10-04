import React, { useContext, useEffect, useState } from 'react';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { GoogleLogin, GoogleLoginResponse } from 'react-google-login';

import { assert } from '../util/assert';
import * as CalendarDAO from '../../DAO/CalendarDAO';
import { writeJSONToFile } from './util';
import { CalendarContext } from '../../App';
import * as CalendarIndexUtil from '../util/command-view-util/CalendarIndexUtil';
import {
  signInWithToken,
  useInitializedGoogleAuthClient,
} from './GoogleAuthSetup';
import { RerenderButton } from '../../hooks/util/RerenderButton';

const CALENDAR_ID = 'abilityapptester01@gmail.com';

// Helpers for testing in CDT
window.CalendarDAO = CalendarDAO;
window.write = writeJSONToFile;
window.calendarIndexUtil = CalendarIndexUtil;

export function Auth() {
  const { authInstance } = useInitializedGoogleAuthClient();
  const token =
    'ya29.a0ARrdaM_VIgutZphkEcJL5TaBUF45qYO6--AyGuc1BrJRvKxNsd3G6gz8dOn68d2gJeTQohw74f-qZ-09b7wndP7qId6ogjuhzLe7Ou9hXKDBANHZkQtsmLWGT8WM1q9LyxumOWHMLhnA3P7Uhvk4B1p24v_oCg';
  if (authInstance != null) {
    signInWithToken(token);
  }

  return <RerenderButton />;
}

// export function AuthOld() {
//   const [authResponse, setAuthResponse] = useState<null | AuthResponse>(null);
//   const [calendar, setCalendar] = useState(null);
//   const [number, setNumber] = useState(0);

//   const calendarIndex = useContext(CalendarContext);

//   const signIn = async (oauth2Client: OAuth2Client, token: string) => {
//     // TODO Kedar: figure out another way to get credentials
//     const { tokens } = await oauth2Client.refreshToken(token);
//     oauth2Client.setCredentials(tokens);
//     assert(
//       oauth2Client.credentials != null,
//       'Client Credentials should be set.'
//     );
//     const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
//     setCalendar(calendar);

//     // Helpers for testing in CDT
//     window.calendar = calendar;
//     window.oauth2Client = oauth2Client;
//   };

//   useEffect(() => {
//     let client_id = process.env.GCAL_CLIENT_ID;

//     let oauth2Client = new google.auth.OAuth2(
//       process.env.GCAL_CLIENT_ID,
//       process.env.GCAL_CLIENT_SECRET
//     );
//     oauth2Client.apiKey = 'AIzaSyCWaZAxZJ3fPv2mT_dQW5WSBiI1B7bK61k';
//     if (authResponse) {
//       signIn(oauth2Client, authResponse.access_token);
//     }
//   }, [authResponse]);

//   console.log('calendar index:', calendarIndex[0]);

//   return (
//     <div>
//       <GoogleLogin
//         clientId={process.env.GCAL_CLIENT_ID}
//         scope={'https://www.googleapis.com/auth/calendar.readonly'}
//         onSuccess={(loginResponse: GoogleLoginResponse) => {
//           console.log('Sign-in succeeded!');
//           setAuthResponse(loginResponse.getAuthResponse());
//         }}
//         onFailure={(error) => {
//           console.log('Sign-in failed:');
//           console.log(error);
//         }}
//       />
//       <button onClick={() => setNumber(number + 1)}>refresh</button>
//     </div>
//   );
// }
