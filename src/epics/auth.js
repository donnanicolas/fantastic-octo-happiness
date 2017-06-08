// @flow
import { merge } from 'rxjs/observable/merge';
import { combineEpics } from 'redux-observable';
import { push } from 'react-router-redux';
import { LOCATION_CHANGE } from 'react-router-redux/reducer';

import { parseHash } from '../utils/auth';
import * as routes from '../utils/routes';
import { authenticate } from '../actions/auth';
import { getAuthToken } from '../reducers/auth';

type RouterPayload = {
  hash?: string,
  pathname?: string,
  search?: string,
};
type RouterAction = Action<RouterPayload>;

const auth = (action$: rxjs$Observable<GenericAction>, store: Store): rxjs$Observable<GenericAction> => {
  const locationChange$ = action$
    .filter(({ type }) => type === LOCATION_CHANGE) // only location changes

  const locationChangeToLogin$ = locationChange$
    .filter(({ payload: { pathname } }: RouterAction) => pathname === routes.LOGIN); // if its /login

  const redirectToLogin$ = locationChange$
    .filter(({ payload: { pathname } }: RouterAction) => pathname !== routes.LOGIN) // if its not /login
    .map(() => getAuthToken(store.getState())) // map to the auth token
    .filter(authToken => !authToken) // if there is no token
    .mapTo(push(routes.LOGIN)); // go to login

  const handleAuth$ = locationChangeToLogin$
    .map(({ payload: { hash } }) => hash) // map to the hash
    .filter(hash => !!hash) // filter if there is a hash
    .map(parseHash)
    .map(authenticate);

  const redirectToHome$ = locationChangeToLogin$
    .map(() => getAuthToken(store.getState())) // map to the auth token
    .filter(authToken => !!authToken) // if there is a token
    .mapTo(push(routes.HOME)); // go to home

  return merge(
    redirectToLogin$,
    handleAuth$,
    redirectToHome$,
  );
};

export default combineEpics(
  auth,
);
