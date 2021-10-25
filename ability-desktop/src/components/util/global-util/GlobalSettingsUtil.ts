import { GlobalUserSettings } from '../../../constants/types';
import { DateTime } from 'luxon';

export function loadGlobalSettings(): GlobalUserSettings {
  // Preload with Defaults
  let globalSettings: GlobalUserSettings = getDefaultGlobalSettings();

  // Query DB to get correct settings

  return globalSettings;
}

function getDefaultGlobalSettings(): GlobalUserSettings {
  return {
    profileSettings: {
      registeredAccounts: null,
      defaults: {
        dayHardStart: {
          hours: 8,
        },
        dayHardStop: {
          hours: 21,
        },
        blockDuration: 60,
      },
    },
    notificationSettings: {
      notificationsEnabled: true,
      minutesBeforeDisplay: 10,
    },
    timeZoneOffset: DateTime.now().offset / 60,
    abilityKeyShortcut: 'CommandOrControl+E',
    textSnippetPackages: null,
  };
}

export function dayLimitsToDateTimes() {}
