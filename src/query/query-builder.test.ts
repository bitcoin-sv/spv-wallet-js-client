import { buildPath, BuildPathOptions } from "./query-builder";

describe('buildPath', () => {
  test('should build full path with basic query params, filter, and metadata', () => {
    const options: BuildPathOptions = {
      filter: {
        blockHeight: 859864,
      },
      metadata: {
        domain: 'domain.example.com',
        p2p_tx_metadata: {
          note: 'test',
          sender: '14816@domain.example.com',
        },
      },
      queryParams: {
        page: 1,
        pageSize: 1,
        sortDirection: 'desc',
      },
      basePath: 'transactions',
    };

    const result = buildPath(options);
    expect(result).toBe(
      'transactions?page=1&pageSize=1&sortDirection=desc&blockHeight=859864&metadata%5Bdomain%5D=domain.example.com&metadata%5Bp2p_tx_metadata%5D%5Bnote%5D=test&metadata%5Bp2p_tx_metadata%5D%5Bsender%5D=14816%40domain.example.com'
    );
  });

  test('should build full path with only filter and no metadata', () => {
    const options: BuildPathOptions = {
      filter: {
        blockHeight: 123456,
      },
      metadata: {},
      queryParams: {
        page: 1,
        pageSize: 10,
        sortDirection: 'asc',
      },
      basePath: 'transactions',
    };

    const result = buildPath(options);
    expect(result).toBe(
      'transactions?page=1&pageSize=10&sortDirection=asc&blockHeight=123456'
    );
  });

  test('should build full path with only metadata and no filter', () => {
    const options: BuildPathOptions = {
      filter: {},
      metadata: {
        domain: 'example.com',
        type: 'payment',
      },
      queryParams: {
        page: 2,
        pageSize: 5,
      },
      basePath: 'transactions',
    };

    const result = buildPath(options);
    expect(result).toBe(
      'transactions?page=2&pageSize=5&metadata%5Bdomain%5D=example.com&metadata%5Btype%5D=payment'
    );
  });

  test('should build full path without query params, using only filter and metadata', () => {
    const options: BuildPathOptions = {
      filter: {
        blockHeight: 859864,
      },
      metadata: {
        note: 'test',
      },
      queryParams: {},
      basePath: 'transactions',
    };

    const result = buildPath(options);
    expect(result).toBe(
      'transactions?blockHeight=859864&metadata%5Bnote%5D=test'
    );
  });

  test('should return only base path if no query params, filter, or metadata provided', () => {
    const options: BuildPathOptions = {
      filter: {},
      metadata: {},
      queryParams: {},
      basePath: 'transactions',
    };

    const result = buildPath(options);
    expect(result).toBe('transactions');
  });

  test('should handle nested metadata correctly', () => {
    const options: BuildPathOptions = {
      filter: {},
      metadata: {
        domain: 'example.com',
        nested: {
          key: 'value',
          anotherKey: 'anotherValue',
        },
      },
      queryParams: {},
      basePath: 'transactions',
    };

    const result = buildPath(options);
    expect(result).toBe(
      'transactions?metadata%5Bdomain%5D=example.com&metadata%5Bnested%5D%5Bkey%5D=value&metadata%5Bnested%5D%5BanotherKey%5D=anotherValue'
    );
  });
});
