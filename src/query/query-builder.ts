import { AccessKeyFilter, ContactFilter, ModelFilter, TransactionFilter, UtxoFilter, XpubFilter } from "../filters";
import { Metadata, QueryParams as Page } from "../types";

export interface BuildPathOptions {
  filter: ModelFilter | TransactionFilter | UtxoFilter | XpubFilter | AccessKeyFilter | ContactFilter;
  metadata: Metadata;
  page: Page;
}

function flattenParams(params: Record<string, any>, parentKey?: string): Record<string, string> {
  const flattened: Record<string, string> = {};

  Object.entries(params).forEach(([key, value]) => {
    const newKey = parentKey ? `${parentKey}[${key}]` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Recursively flatten nested objects
      Object.assign(flattened, flattenParams(value, newKey));
    } else {
      flattened[newKey] = String(value); // Ensure value is a string
    }
  });

  return flattened;
}

export function buildQueryPath({ filter, metadata, page: queryParams }: BuildPathOptions): string {
  const allParams: Record<string, string> = {};

  if (queryParams) {
    Object.assign(allParams, flattenParams(queryParams));
  }

  if (filter) {
    Object.assign(allParams, flattenParams(filter));
  }

  if (metadata) {
    Object.assign(allParams, flattenParams(metadata, 'metadata'));
  }

  const params = new URLSearchParams(allParams);
  const queryString = params.toString();

  return queryString ? `?${queryString}` : '';
}
