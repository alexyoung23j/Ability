import { useState } from 'react';
import { assert } from '../util/assert';
import $ from 'jquery';

import { config } from 'dotenv';
config();

function loadCalendarApi() {
  gapi.client.load('calendar', 'v3');
}

async function loadGapiAuth() {
  await new Promise((resolve) => gapi.load('client:auth2', resolve));
  await new Promise((resolve) => gapi.auth2.init(CLIENT_CONFIG).then(resolve));
}

function loadGoogleAuthAPI(
  onInit: (googleAuth: gapi.auth2.GoogleAuth) => void
) {
  const { gapi } = window;
  assert(
    gapi != null,
    'window.gapi should have been loaded before this function'
  );
  if (gapi.auth2 == null) {
    gapi.load('auth2', async function () {
      try {
        await loadGapiAuth();
        loadCalendarApi();
        onInit(gapi.auth2.getAuthInstance());
      } catch (e) {
        console.log('Failed to import Gapi auth');
      }
    });
  }
}

/**
 * Hook to initialize Google Auth instance.
 *
 * Loads `gapi` and `gapi.auth` into global `window`.
 * @returns
 */
export function useInitializedGoogleAuthClient() {
  debugger;
  const [authInstance, setAuthInstance] =
    useState<gapi.auth2.GoogleAuth | null>(null);

  // This loads Google API
  $.ajax({
    url: 'https://apis.google.com/js/api.js',
    dataType: 'script',
    success: () => {
      loadGoogleAuthAPI((googleAuth: gapi.auth2.GoogleAuth) => {
        setAuthInstance(googleAuth);
      });
    },
  });

  return { authInstance };
}

export function signInWithToken(token: string): void {
  window.gapi.client.setToken({ access_token: token });
}

const CLIENT_CONFIG: gapi.auth2.ClientConfig = {
  client_id: `${process.env.REACT_APP_GCAL_CLIENT_ID}`,
  scope: 'https://www.googleapis.com/auth/calendar',
};
