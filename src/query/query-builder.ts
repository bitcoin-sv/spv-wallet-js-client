import { AccessKeyFilter, ContactFilter, ModelFilter, TransactionFilter, UtxoFilter, XpubFilter } from '../filters';
import { Metadata, QueryPageParams as Page } from '../types';

export interface BuildPathOptions {
  filter: ModelFilter | TransactionFilter | UtxoFilter | XpubFilter | AccessKeyFilter | ContactFilter;
  metadata: Metadata;
  page: Page;
}

function addToURLSearchParams(urlSP: URLSearchParams, params: Record<string, any>, parentKey?: string): void {
  Object.entries(params).forEach(([key, value]) => {
    if (!value) {
      return;
    }

    const newKey = parentKey ? `${parentKey}[${key}]` : key;

    if (typeof value === 'object' && !Array.isArray(value)) {
      // Recursively flatten nested objects
      addToURLSearchParams(urlSP, value, newKey);
    } else if (Array.isArray(value)) {
      value.forEach((element) => {
        const arrayKey = `${newKey}[]`;
        urlSP.append(arrayKey, element);
      });
    } else {
      urlSP.append(newKey, String(value)); // ensure value is a string
    }
  });
}

export function buildQueryPath({ filter, metadata, page: queryParams }: BuildPathOptions): string {
  const allParams = new URLSearchParams();

  if (queryParams) {
    addToURLSearchParams(allParams, queryParams);
  }

  if (filter) {
    addToURLSearchParams(allParams, filter);
  }

  if (metadata) {
    addToURLSearchParams(allParams, metadata, 'metadata');
  }

  const params = new URLSearchParams(allParams);
  const queryString = params.toString();

  return queryString ? `?${queryString}` : '';
}
