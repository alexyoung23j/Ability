import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { AuthenticateAccount } from './AuthenticateAccount';
import { InvokeCloudFunction } from './InvokeFunction';

export const enum RouteParams {
  NEW_USER_SIGN_IN = 'NEW_USER_SIGN_IN',
  RETURN_USER_SIGN_IN = 'NEW_USER_SIGN_IN',
  ADD_CALENDAR = 'ADD_CALENDAR',
}

function App(): JSX.Element {
  return (
    <Router>
      <Switch>
        <Route path="/sign-in/:code">
          {/* <InvokeCloudFunction /> */}
          <AuthenticateAccount routeParams={RouteParams.NEW_USER_SIGN_IN} />
        </Route>
        <Route path="/add-calendar/:code">
          <AuthenticateAccount routeParams={RouteParams.ADD_CALENDAR} />
        </Route>
        <Route path="/resign-in/:code">
          <AuthenticateAccount routeParams={RouteParams.RETURN_USER_SIGN_IN} />
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
