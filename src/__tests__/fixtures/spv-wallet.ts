import { ExclusiveStartKeyPage, MerkleRoot, MerkleRootsRepository } from '../../types';

// spv-wallet address
export const server = 'http://localhost:3003/api/v1';

// mocked merkle roots data on spv-wallet side
export const mockedSPVWalletData: MerkleRoot[] = [
  {
    blockHeight: 0,
    merkleRoot: '4a5e1e4baab89f3a32518a88c31bc87f618f76673e2cc77ab2127b7afdeda33b',
  },
  {
    blockHeight: 1,
    merkleRoot: '0e3e2357e806b6cdb1f70b54c3a3a17b6714ee1f0e68bebb44a74b1efd512098',
  },
  {
    blockHeight: 2,
    merkleRoot: '9b0fc92260312ce44e74ef369f5c66bbb85848f2eddd5a7a1cde251e54ccfdd5',
  },
  {
    blockHeight: 3,
    merkleRoot: '999e1c837c76a1b7fbb7e57baf87b309960f5ffefbf2a9b95dd890602272f644',
  },
  {
    blockHeight: 4,
    merkleRoot: 'df2b060fa2e5e9c8ed5eaf6a45c13753ec8c63282b2688322eba40cd98ea067a',
  },
  {
    blockHeight: 5,
    merkleRoot: '63522845d294ee9b0188ae5cac91bf389a0c3723f084ca1025e7d9cdfe481ce1',
  },
  {
    blockHeight: 6,
    merkleRoot: '20251a76e64e920e58291a30d4b212939aae976baca40e70818ceaa596fb9d37',
  },
  {
    blockHeight: 7,
    merkleRoot: '8aa673bc752f2851fd645d6a0a92917e967083007d9c1684f9423b100540673f',
  },
  {
    blockHeight: 8,
    merkleRoot: 'a6f7f1c0dad0f2eb6b13c4f33de664b1b0e9f22efad5994a6d5b6086d85e85e3',
  },
  {
    blockHeight: 9,
    merkleRoot: '0437cd7f8525ceed2324359c2d0ba26006d92d856a9c20fa0241106ee5a597c9',
  },
  {
    blockHeight: 10,
    merkleRoot: 'd3ad39fa52a89997ac7381c95eeffeaf40b66af7a57e9eba144be0a175a12b11',
  },
  {
    blockHeight: 11,
    merkleRoot: 'f8325d8f7fa5d658ea143629288d0530d2710dc9193ddc067439de803c37066e',
  },
  {
    blockHeight: 12,
    merkleRoot: '3b96bb7e197ef276b85131afd4a09c059cc368133a26ca04ebffb0ab4f75c8b8',
  },
  {
    blockHeight: 13,
    merkleRoot: '9962d5c704ec27243364cbe9d384808feeac1c15c35ac790dffd1e929829b271',
  },
  {
    blockHeight: 14,
    merkleRoot: 'e1afd89295b68bc5247fe0ca2885dd4b8818d7ce430faa615067d7bab8640156',
  },
];

// mockedMerkleRootsAPIResponseFn is a mock of SPV-Wallet it will return a paged response of merkle roots since last evaluated merkle root
export const mockedMerkleRootsAPIResponseFn = (lastMerkleRoot: string): ExclusiveStartKeyPage<MerkleRoot[]> => {
  if (lastMerkleRoot === '') {
    return {
      content: [...mockedSPVWalletData],
      page: {
        lastEvaluatedKey: '',
        totalElements: mockedSPVWalletData.length,
        size: mockedSPVWalletData.length,
      },
    };
  }

  const lastMerkleRootIdx = mockedSPVWalletData.findIndex((v) => v.merkleRoot === lastMerkleRoot);

  // handle case when lastMerkleRoot is already highest in the servers database
  if (lastMerkleRootIdx === mockedSPVWalletData.length - 1) {
    return {
      content: [],
      page: {
        lastEvaluatedKey: '',
        totalElements: mockedSPVWalletData.length,
        size: 0,
      },
    };
  }

  let content = mockedSPVWalletData.slice(lastMerkleRootIdx + 1);
  let lastEvaluatedKey = content[content.length - 1].merkleRoot;

  if (lastEvaluatedKey === mockedSPVWalletData[mockedSPVWalletData.length - 1].merkleRoot) {
    lastEvaluatedKey = '';
  }

  return {
    content,
    page: {
      lastEvaluatedKey: lastEvaluatedKey,
      totalElements: mockedSPVWalletData.length,
      size: content.length,
    },
  };
};
