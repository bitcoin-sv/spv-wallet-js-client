import { SPVWalletUserAPI } from './user-api';
import fetchMock from 'jest-fetch-mock';
import { MerkleRoot } from './types';
import { ErrorStaleLastEvaluatedKey, ErrorSyncMerkleRootsTimeout } from './errors';
import { mockedSPVWalletData, server } from './__tests__/fixtures/spv-wallet';
import {
  createRepository,
  mockMerkleRootsAPIResponseNormal,
  mockMerkleRootsAPIResponseDelayed,
  mockMerkleRootsAPIResponseStale,
} from './__tests__/fixtures/sync-merkleroots';

beforeAll(() => {
  fetchMock.enableMocks();
});

beforeEach(() => {
  fetchMock.resetMocks();
});

afterAll(() => {
  fetchMock.disableMocks();
});

describe('Test SyncMerkleRoots', () => {
  describe('Test sync merkle roots success scenarios', () => {
    test('Should properly sync database when empty', async () => {
      // setup
      mockMerkleRootsAPIResponseNormal();

      // given
      const client = new SPVWalletUserAPI(server, {
        xPriv:
          'xprv9s21ZrQH143K3axKPtYBDKsrAvN3J85z6nZuW5ihYK8JpDWfqHdjswvUnbXzUpMBne1WD6FQmTzymB4Pt3u3UVSauxzq5PswBWr3vYtowmW',
      });
      const clientDb: MerkleRoot[] = [];
      const repository = createRepository(clientDb);

      // when
      await client.syncMerkleRoots(repository);

      //then
      expect(clientDb.length).toBe(mockedSPVWalletData.length);
      expect(clientDb[clientDb.length - 1].merkleRoot).toBe(
        mockedSPVWalletData[mockedSPVWalletData.length - 1].merkleRoot,
      );
      expect(clientDb[clientDb.length - 1].blockHeight).toBe(
        mockedSPVWalletData[mockedSPVWalletData.length - 1].blockHeight,
      );
    });

    test('Should properly sync database when partially filled', async () => {
      // setup
      mockMerkleRootsAPIResponseNormal();

      // given
      const client = new SPVWalletUserAPI(server, {
        xPriv:
          'xprv9s21ZrQH143K3axKPtYBDKsrAvN3J85z6nZuW5ihYK8JpDWfqHdjswvUnbXzUpMBne1WD6FQmTzymB4Pt3u3UVSauxzq5PswBWr3vYtowmW',
      });
      const clientDb: MerkleRoot[] = [
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
      ];
      const repository = createRepository(clientDb);

      // when
      await client.syncMerkleRoots(repository);

      //then
      expect(clientDb.length).toBe(mockedSPVWalletData.length);
      expect(clientDb[clientDb.length - 1].merkleRoot).toBe(
        mockedSPVWalletData[mockedSPVWalletData.length - 1].merkleRoot,
      );
      expect(clientDb[clientDb.length - 1].blockHeight).toBe(
        mockedSPVWalletData[mockedSPVWalletData.length - 1].blockHeight,
      );
    });
  });

  describe('Test sync merkle roots failure scenarios', () => {
    test('Should fail sync merkleroots due to the time out', async () => {
      // setup
      mockMerkleRootsAPIResponseDelayed();

      // given
      const client = new SPVWalletUserAPI(server, {
        xPriv:
          'xprv9s21ZrQH143K3axKPtYBDKsrAvN3J85z6nZuW5ihYK8JpDWfqHdjswvUnbXzUpMBne1WD6FQmTzymB4Pt3u3UVSauxzq5PswBWr3vYtowmW',
      });
      const clientDb: MerkleRoot[] = [];

      const repository = createRepository(clientDb);

      //then
      await expect(client.syncMerkleRoots(repository, 10)).rejects.toThrow(new ErrorSyncMerkleRootsTimeout());
    });

    test('Should fail sync database due to last evaluated key being the same in the response', async () => {
      // setup
      mockMerkleRootsAPIResponseStale();

      // given
      const client = new SPVWalletUserAPI(server, {
        xPriv:
          'xprv9s21ZrQH143K3axKPtYBDKsrAvN3J85z6nZuW5ihYK8JpDWfqHdjswvUnbXzUpMBne1WD6FQmTzymB4Pt3u3UVSauxzq5PswBWr3vYtowmW',
      });
      const clientDb: MerkleRoot[] = [];
      const repository = createRepository(clientDb);

      // when
      const syncMerkleRoots = async () => await client.syncMerkleRoots(repository);

      //then
      await expect(syncMerkleRoots()).rejects.toThrow(new ErrorStaleLastEvaluatedKey());
    });
  });
});
