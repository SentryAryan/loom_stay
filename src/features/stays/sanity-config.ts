// Project id and dataset are public identifiers, not secrets. The dataset is public, so Home reads it
// without a token. If the dataset is ever made private, Home has to move behind an API route.
export const SANITY_PROJECT_ID = "vxnms1ub";
export const SANITY_DATASET = "production";
export const SANITY_API_VERSION = "v2025-02-19";
export const SANITY_QUERY_URL = `https://${SANITY_PROJECT_ID}.apicdn.sanity.io/${SANITY_API_VERSION}/data/query/${SANITY_DATASET}`;
