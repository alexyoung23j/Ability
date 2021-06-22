import React, { useEffect, useState } from 'react';
import { google } from 'googleapis';
import { OAuth2Client } from 'googleapis-common';
import { GoogleLogin, GoogleLoginResponse } from 'react-google-login';

import { assert } from './assert';
import { fetchEvents } from './DAO/CalendarDAO';
import { writeJSONToFile } from './util';

// TODO kedar: move these to react_env files and don't store in commit!!!!
const CLIENT_ID =
  '942672633691-1tb2ma14qnkg2so4j4v21opephmmt34o.apps.googleusercontent.com';
const CLIENT_SECRET = 'K_JxXW7e7EFLV0kcJ4ievQCY';

const CALENDAR_ID = 'abilityapptester01@gmail.com';

// Helpers for testing in CDT
window.fetchEvents = fetchEvents;
window.write = writeJSONToFile;

export function Auth() {
  const [authResponse, setAuthResponse] = useState<null | AuthResponse>(null);
  const [calendar, setCalendar] = useState(null);

  const signIn = async (oauth2Client: OAuth2Client, token: string) => {
    // TODO Kedar: figure out another way to get credentials
    const { tokens } = await oauth2Client.refreshToken(token);
    oauth2Client.setCredentials(tokens);
    assert(
      oauth2Client.credentials != null,
      'Client Credentials should be set.'
    );
    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });
    setCalendar(calendar);

    // Helpers for testing in CDT
    window.calendar = calendar;
    window.oauth2Client = oauth2Client;
  };

  useEffect(() => {
    let oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET);
    oauth2Client.apiKey = 'AIzaSyCWaZAxZJ3fPv2mT_dQW5WSBiI1B7bK61k';
    if (authResponse) {
      signIn(oauth2Client, authResponse.access_token);
    }
  }, [authResponse]);

  return (
    <div>
      <GoogleLogin
        clientId={CLIENT_ID}
        scope={'https://www.googleapis.com/auth/calendar.readonly'}
        onSuccess={(loginResponse: GoogleLoginResponse) => {
          console.log('Sign-in succeeded!');
          setAuthResponse(loginResponse.getAuthResponse());
        }}
        onFailure={(error) => {
          console.log('Sign-in failed:');
          console.log(error);
        }}
      />
    </div>
  );
}
