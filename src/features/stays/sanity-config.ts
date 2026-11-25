// Project id and dataset are public identifiers, not secrets. The dataset is public, so Home reads it
// without a token. If the dataset is ever made private, Home has to move behind an API route.
export const SANITY_PROJECT_ID = "vxnms1ub";
export const SANITY_DATASET = "production";
export const SANITY_API_VERSION = "v2025-02-19";
export const SANITY_QUERY_URL = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;
// Search posts what the guest typed, so it goes to the live API (not the cache) with the text in the body, never in the URL.
export const SANITY_SEARCH_URL = `https://${SANITY_PROJECT_ID}.api.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;
