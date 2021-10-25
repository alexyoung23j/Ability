import firebase from './firebase/config';

export function InvokeCloudFunction(): JSX.Element {
  return (
    <button
      onClick={async () => {
        const createAuthToken = firebase
          .functions()
          .httpsCallable('createAuthToken');
        console.log(await createAuthToken());
      }}
    >
      Invoke cloud function
    </button>
  );
}
