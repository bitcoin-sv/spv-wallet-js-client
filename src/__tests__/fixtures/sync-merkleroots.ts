import { MockResponseInitFunction } from 'jest-fetch-mock';
import { ExclusiveStartKeyPage, MerkleRoot, MerkleRootsRepository } from '../../types';
import { mockedMerkleRootsAPIResponseFn, mockedSPVWalletData } from './spv-wallet';

// creates a simulated repository a client passes to SyncMerkleRoots()
export const createRepository = (merkleRoots: MerkleRoot[]): MerkleRootsRepository => {
  return {
    saveMerkleRoots: (syncedMerkleRoots: MerkleRoot[]) => {
      merkleRoots.push(...syncedMerkleRoots);
      return Promise.resolve();
    },
    getLastMerkleRoot: async () => {
      if (merkleRoots.length < 1) {
        return undefined;
      }
      return merkleRoots[merkleRoots.length - 1].merkleRoot;
    },
  };
};

export function mockMerkleRootsAPIResponseNormal() {
  return mockMerkleRootsAPIResponse(async (req) => {
    const url = new URL(req.url);
    const queryParams = url.searchParams;

    const lastEvaluatedKey = queryParams.get('lastEvaluatedKey') || '';

    return Promise.resolve({
      body: JSON.stringify(mockedMerkleRootsAPIResponseFn(lastEvaluatedKey)),
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

export function mockMerkleRootsAPIResponseDelayed() {
  return mockMerkleRootsAPIResponse(async (req) => {
    const url = new URL(req.url);
    const queryParams = url.searchParams;

    const lastEvaluatedKey = queryParams.get('lastEvaluatedKey') || '';

    // it is to limit the result up to 3 merkle roots per request to ensure
    // that the sync merkleroots will loop more than once and hit the timeout
    const all = mockedMerkleRootsAPIResponseFn(lastEvaluatedKey);
    all.content = all.content.slice(0, 3);
    all.page.size = 3;
    all.page.lastEvaluatedKey = all.content[all.content.length - 1]?.merkleRoot || '';

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          body: JSON.stringify(all),
          headers: { 'Content-Type': 'application/json' },
        });
      }, 50);
    });
  });
}

export function mockMerkleRootsAPIResponseStale() {
  return mockMerkleRootsAPIResponse(async () => {
    const staleLastEvaluatedKeyResponse: ExclusiveStartKeyPage<MerkleRoot[]> = {
      content: [
        {
          merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
          blockHeight: 0,
        },
        {
          merkleRoot: '0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098',
          blockHeight: 1,
        },
        {
          merkleRoot: '9b0fc92260312ce44e74ef369f5c66bbb85848f2eddd5a7a1cde251e54ccfdd5',
          blockHeight: 2,
        },
      ],
      page: {
        lastEvaluatedKey: '9b0fc92260312ce44e74ef369f5c66bbb85848f2eddd5a7a1cde251e54ccfdd5',
        size: 3,
        totalElements: mockedSPVWalletData.length,
      },
    };

    return Promise.resolve({
      body: JSON.stringify(staleLastEvaluatedKeyResponse),
      headers: { 'Content-Type': 'application/json' },
    });
  });
}

function mockMerkleRootsAPIResponse(mockFn: MockResponseInitFunction) {
  fetchMock.mockIf(
    (req) => {
      const url = new URL(req.url);
      return req.method === 'GET' && url.origin === 'http://localhost:3003' && url.pathname === '/api/v1/merkleroots';
    },
    async (req) => {
      return mockFn(req);
    },
  );
}
