import { AccessKeyFilter, ContactFilter, ModelFilter, TransactionFilter, UtxoFilter, XpubFilter } from "../filters";
import { Metadata, QueryParams as Page } from "../types";

export interface BuildPathOptions {
  filter: ModelFilter | TransactionFilter | UtxoFilter | XpubFilter | AccessKeyFilter | ContactFilter;
  metadata: Metadata;
  page: Page;
}

const OPEN_BRACKET_ENCODED = '%5B';
const CLOSE_BRACKET_ENCODED = '%5D';

function encodeKey(key: string, parentKey?: string): string {
  const encodedKey = encodeURIComponent(key);
  if (parentKey) {
    return `${parentKey}${OPEN_BRACKET_ENCODED}${encodedKey}${CLOSE_BRACKET_ENCODED}`;
  }
  return encodedKey;
}

function encodeValue(value: any): string {
  return encodeURIComponent(value);
}

function buildQueryParams(params: Record<string, any>, parentKey?: string): string {
  const queryString: string[] = [];

  Object.entries(params).forEach(([key, value]) => {
    const encodedKey = encodeKey(key, parentKey);

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      queryString.push(buildQueryParams(value, encodedKey));
    } else {
      queryString.push(`${encodedKey}=${encodeValue(value)}`);
    }
  });

  return queryString.join('&');
}

export function buildQueryPath({ filter, metadata, page: queryParams }: BuildPathOptions): string {
  const queryStringParts: string[] = [];

  if (queryParams) {
    queryStringParts.push(buildQueryParams(queryParams));
  }

  if (filter) {
    queryStringParts.push(buildQueryParams(filter));
  }

  if (metadata) {
    queryStringParts.push(buildQueryParams(metadata, 'metadata'));
  }

  const queryString = queryStringParts.filter(Boolean).join('&');

  return queryString ? `?${queryString}` : '';
}

