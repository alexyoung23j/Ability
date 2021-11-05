import * as DatabaseUtil from 'firebase/DatabaseUtil';
import { getCurrentUser } from 'firebase/util/FirebaseUtil';
import firebase from 'firebase/config';
import { CalendarInfo } from './SignIn';

export const ELECTRON_SESSION_IDS_TO_USER_IDS_COLLECTION =
  'electronIdsToUserIds';

export async function getCalendarInfos(): Promise<Array<CalendarInfo>> {
  const { uid: currentUserUid } = getCurrentUser();

  const calendarInfoSnapshots = (await DatabaseUtil.database
    .collection(`users/${currentUserUid}/CalendarInfo/`)
    .get()) as unknown as firebase.firestore.QuerySnapshot<CalendarInfo>;

  return calendarInfoSnapshots.docs.map((calendarInfoDoc) =>
    calendarInfoDoc.data()
  );
}
