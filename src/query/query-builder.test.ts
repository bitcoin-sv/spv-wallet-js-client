import { BuildPathOptions, buildQueryPath } from "./query-builder";

describe('buildQueryPath', () => {
  test('should build query string with page, filter, and metadata', () => {
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
      page: {
        page: 1,
        pageSize: 1,
        sortDirection: 'desc',
      },
    };

    const result = buildQueryPath(options);
    expect(result).toBe(
      '?page=1&pageSize=1&sortDirection=desc&blockHeight=859864&metadata%5Bdomain%5D=domain.example.com&metadata%5Bp2p_tx_metadata%5D%5Bnote%5D=test&metadata%5Bp2p_tx_metadata%5D%5Bsender%5D=14816%40domain.example.com'
    );
  });

  test('should build query string with page and filter, no metadata', () => {
    const options: BuildPathOptions = {
      filter: {
        blockHeight: 123456,
      },
      metadata: {},
      page: {
        page: 1,
        pageSize: 10,
        sortDirection: 'asc',
      },
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?page=1&pageSize=10&sortDirection=asc&blockHeight=123456');
  });

  test('should build query string with page and metadata, no filter', () => {
    const options: BuildPathOptions = {
      filter: {},
      metadata: {
        domain: 'example.com',
        type: 'payment',
      },
      page: {
        page: 2,
        pageSize: 5,
      },
    };

    const result = buildQueryPath(options);
    expect(result).toBe(
      '?page=2&pageSize=5&metadata%5Bdomain%5D=example.com&metadata%5Btype%5D=payment'
    );
  });

  test('should build query string with only page', () => {
    const options: BuildPathOptions = {
      filter: {},
      metadata: {},
      page: {
        page: 3,
        pageSize: 15,
        sortDirection: 'asc',
      },
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?page=3&pageSize=15&sortDirection=asc');
  });

  test('should build query string with filter and metadata, no page', () => {
    const options: BuildPathOptions = {
      filter: {
        blockHeight: 859864,
      },
      metadata: {
        note: 'test',
      },
      page: {},
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?blockHeight=859864&metadata%5Bnote%5D=test');
  });

  test('should build query string with only filter', () => {
    const options: BuildPathOptions = {
      filter: {
        blockHeight: 859864,
      },
      metadata: {},
      page: {},
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?blockHeight=859864');
  });

  test('should build query string with only metadata', () => {
    const options: BuildPathOptions = {
      filter: {},
      metadata: {
        domain: 'example.com',
        type: 'payment',
      },
      page: {},
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?metadata%5Bdomain%5D=example.com&metadata%5Btype%5D=payment');
  });

  test('should return empty string if no page, filter, or metadata provided', () => {
    const options: BuildPathOptions = {
      filter: {},
      metadata: {},
      page: {},
    };

    const result = buildQueryPath(options);
    expect(result).toBe('');
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
      page: {},
    };

    const result = buildQueryPath(options);
    expect(result).toBe(
      '?metadata%5Bdomain%5D=example.com&metadata%5Bnested%5D%5Bkey%5D=value&metadata%5Bnested%5D%5BanotherKey%5D=anotherValue'
    );
  });
});

describe('buildQueryPath with all supported filters', () => {
  
  test('should build query string with TransactionFilter', () => {
    const options: BuildPathOptions = {
      filter: {
        id: 'transaction123',
        blockHeight: 500000,
      },
      metadata: {},
      page: {},
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?id=transaction123&blockHeight=500000');
  });

  test('should build query string with ContactFilter', () => {
    const options: BuildPathOptions = {
      filter: {
        id: 'contact456',
        fullName: 'John Doe',
        status: 'confirmed',
      },
      metadata: {},
      page: {},
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?id=contact456&fullName=John+Doe&status=confirmed');
  });

  test('should build query string with XpubFilter', () => {
    const options: BuildPathOptions = {
      filter: {
        id: 'xpub789',
        currentBalance: 100000,
      },
      metadata: {},
      page: {},
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?id=xpub789&currentBalance=100000');
  });

  test('should build query string with UtxoFilter', () => {
    const options: BuildPathOptions = {
      filter: {
        transactionId: 'utxo123',
        outputIndex: 1,
        satoshis: 50000,
      },
      metadata: {},
      page: {},
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?transactionId=utxo123&outputIndex=1&satoshis=50000');
  });

  test('should build query string with AccessKeyFilter', () => {
    const options: BuildPathOptions = {
      filter: {
        revokedRange: {
          from: '2022-01-01T00:00:00Z',
          to: '2022-12-31T23:59:59Z',
        },
      },
      metadata: {},
      page: {},
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?revokedRange%5Bfrom%5D=2022-01-01T00%3A00%3A00Z&revokedRange%5Bto%5D=2022-12-31T23%3A59%3A59Z');
  });
});
