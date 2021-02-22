import { createSelector } from 'reselect';
import { initialState } from './reducer';

/**
 * Direct selector to the search state domain
 */

const selectSearchDomain = (state: any) => state.search || initialState;

/**
 * Other specific selectors
 */

export const selectBundle = createSelector(selectSearchDomain, (substate) => substate.bundle);
export const selectLoading = createSelector(selectSearchDomain, (substate) => substate.loading);
export const selectPage = createSelector(selectSearchDomain, (substate) => substate.page);
export const selectDownload = createSelector(selectSearchDomain, (substate) => substate.download);
export const selectDownloadProgress = createSelector(
  selectSearchDomain,
  (substate) => substate.downloadProgress
);
export const selectSelectedResource = createSelector(
  selectSearchDomain,
  (substate) => substate.selectedResource
);

/**
 * Default selector used by Search
 */
const makeSelectSearch = () => createSelector(selectSearchDomain, (substate) => substate);

export default makeSelectSearch;