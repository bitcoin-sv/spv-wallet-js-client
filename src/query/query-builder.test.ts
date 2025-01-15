import { BuildPathOptions, buildQueryPath } from './query-builder';

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
        size: 1,
        sort: 'desc',
      },
    };

    const result = buildQueryPath(options);
    expect(result).toBe(
      '?page=1&size=1&sort=desc&blockHeight=859864&metadata%5Bdomain%5D=domain.example.com&metadata%5Bp2p_tx_metadata%5D%5Bnote%5D=test&metadata%5Bp2p_tx_metadata%5D%5Bsender%5D=14816%40domain.example.com',
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
        size: 10,
        sort: 'asc',
      },
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?page=1&size=10&sort=asc&blockHeight=123456');
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
        size: 5,
      },
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?page=2&size=5&metadata%5Bdomain%5D=example.com&metadata%5Btype%5D=payment');
  });

  test('should build query string with only page', () => {
    const options: BuildPathOptions = {
      filter: {},
      metadata: {},
      page: {
        page: 3,
        size: 15,
        sort: 'asc',
      },
    };

    const result = buildQueryPath(options);
    expect(result).toBe('?page=3&size=15&sort=asc');
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
      '?metadata%5Bdomain%5D=example.com&metadata%5Bnested%5D%5Bkey%5D=value&metadata%5Bnested%5D%5BanotherKey%5D=anotherValue',
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
    expect(result).toBe(
      '?revokedRange%5Bfrom%5D=2022-01-01T00%3A00%3A00Z&revokedRange%5Bto%5D=2022-12-31T23%3A59%3A59Z',
    );
  });

  test('should build query string with special chars in metadata keys', () => {
    const options: BuildPathOptions = {
      filter: {
        blockHeight: 859864,
      },
      metadata: {
        'hey=123&522': 'example',
        test: 'value=123',
      },
      page: {
        page: 1,
        size: 1,
        sort: 'desc',
      },
    };

    const result = buildQueryPath(options);

    const p = new URLSearchParams(result);
    expect(p.get('metadata[hey=123&522]')).toBe('example');
    expect(p.get('metadata[test]')).toBe('value=123');
  });

  test('should build query string with array in metadata', () => {
    const options: BuildPathOptions = {
      filter: {
        blockHeight: 859864,
      },
      metadata: {
        key1: ['a', 'b', 'c'],
      },
      page: {
        page: 1,
        size: 1,
        sort: 'desc',
      },
    };

    const result = buildQueryPath(options);

    const p = new URLSearchParams(result);
    expect(p.getAll('metadata[key1][]')).toEqual(['a', 'b', 'c']);
    expect(result).toBe(
      '?page=1&size=1&sort=desc&blockHeight=859864&metadata%5Bkey1%5D%5B%5D=a&metadata%5Bkey1%5D%5B%5D=b&metadata%5Bkey1%5D%5B%5D=c',
    );
  });

  test('should build query string with special chars in metadata keys', () => {
    const options: BuildPathOptions = {
      filter: {
        blockHeight: 859864,
      },
      metadata: {
        'hey=123&522': 'example',
        test: 'value=123',
      },
      page: {
        page: 1,
        size: 1,
        sort: 'desc',
      },
    };

    const result = buildQueryPath(options);

    const p = new URLSearchParams(result);
    expect(p.get('metadata[hey=123&522]')).toBe('example');
    expect(p.get('metadata[test]')).toBe('value=123');
  });

  test('should build query string with array in metadata', () => {
    const options: BuildPathOptions = {
      filter: {
        blockHeight: 859864,
      },
      metadata: {
        key1: ['a', 'b', 'c'],
        key2: {
          key3: ['x', 'y', 'z'],
        },
      },
      page: {
        page: 1,
        size: 1,
        sort: 'desc',
      },
    };

    const result = buildQueryPath(options);

    const p = new URLSearchParams(result);
    expect(p.getAll('metadata[key1][]')).toEqual(['a', 'b', 'c']);
    expect(p.getAll('metadata[key2][key3][]')).toEqual(['x', 'y', 'z']);
    expect(result).toBe(
      '?page=1&size=1&sort=desc&blockHeight=859864&metadata%5Bkey1%5D%5B%5D=a&metadata%5Bkey1%5D%5B%5D=b&metadata%5Bkey1%5D%5B%5D=c&metadata%5Bkey2%5D%5Bkey3%5D%5B%5D=x&metadata%5Bkey2%5D%5Bkey3%5D%5B%5D=y&metadata%5Bkey2%5D%5Bkey3%5D%5B%5D=z',
    );
  });
});
