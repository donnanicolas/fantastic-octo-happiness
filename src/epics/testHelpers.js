// @flow
/**
 * This file contains helper for epic testing
 * If you don't need any of this functions you have to import the file anyway to add the rxjs operators
 * to the test
 */
import { LOCATION_CHANGE } from 'react-router-redux/reducer';

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/delay';

type LocationChangeOptions = {
  search?: string,
  hash?: string
};
const locationChange = (pathname: string, options: LocationChangeOptions = {}) => {
  return {
      type: LOCATION_CHANGE,
      payload: {
        ...options,
        pathname,
      },
    };
}

export {
  locationChange,
};
