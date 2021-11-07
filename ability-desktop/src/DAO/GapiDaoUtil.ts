// All paginated queries must be able to accept `pageToken`.
interface BasePaginatedRequestParams {
  pageToken?: string;
}

// All of the gapi interfaces for paginated responses seem to contain these two fields, e.g. `gapi.client.calendar.Events`.
interface BasePaginatedResponseParams<R> {
  nextPageToken?: string;
  items?: Array<R>;
}

/**
 * Higher-order function to handle fetching data in a paginated manner. It should ONLY be used for hitting Google API endpoints that are paginated.
 *
 * This function is specific to `gapi`'s interface; the type parameter base types
 *  - BasePaginatedResponseParams
 *  - BasePaginatedRequestParams
 *  are composed of fields that are specific to gapi's API.
 * 
 * 
 * Example usage:
 * 
 *     type FetchCalendarEventsParams = {
            calendarId: string;
            maxResults: number;
        }
       const events = await fetchPaginated<
          gapi.client.calendar.Event,
          FetchCalendarEventsParams
        >(
          {calendarId, maxResults: 2500 },
          (args: FetchCalendarEventsParams): gapi.client.Request<gapi.client.calendar.Events> => window.gapi.client.calendar.events.list(args);
        );
 * 
 *
 * @param fetchParam - the object parameter to be passed when performing the query. This object may be injected with the fields in `BasePaginatedRequestParams`.
 * @param fetchFn - a function that takes in `fetchParam` and resolves to Promise<{result: BasePaginatedResponseParams<R>}>.
 * @returns a flattened list of all the items from all the paginated fetches
 */
export async function fetchPaginated<
  R,
  // Caller only needs to specify this type parameter if there any additional params.
  P = {}
>(
  fetchParam: P,
  fetchFn: (
    args: P & BasePaginatedRequestParams
  ) => gapi.client.Request<BasePaginatedResponseParams<R>>
): Promise<Array<R>> {
  let nextToken: string | undefined = undefined;
  let isFirstFetch = true;
  const results: Array<R> = [];
  while (nextToken != null || isFirstFetch) {
    isFirstFetch = false;
    const request = fetchFn({ ...fetchParam, pageToken: nextToken });
    const result = (await request).result;
    nextToken = result.nextPageToken;
    results.push(...(result.items ?? []));
  }

  return results;
}
