import { createRole } from '@/app/actions/roles';
import { firestore } from '@/firebase/server';

jest.mock('@/firebase/server', () => ({
  firestore: {
    collection: jest.fn().mockReturnThis(),
    doc: jest.fn().mockReturnThis(),
    get: jest.fn(),
    set: jest.fn(),
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

jest.mock('firebase-admin/firestore', () => ({
  FieldValue: {
    serverTimestamp: jest.fn(),
  },
}));

describe('createRole', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fail with empty name', async () => {
    // Current behavior might fail at .doc("") or similar
    const result = await createRole({ name: '', description: 'Test' });
    expect(result).toBeNull();
  });

  it('should fail with name containing slash', async () => {
    const result = await createRole({ name: 'admin/settings', description: 'Test' });
    // This currently might or might not fail depending on how firestore mock handles it,
    // but in reality it's a security/logic issue.
    // After my fix, it should definitely return null (or throw if I change it)
    expect(result).toBeNull();
  });
});
