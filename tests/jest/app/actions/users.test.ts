import { getUserRoles } from '@/app/actions/users';
import { firestore } from '@/firebase/server';

jest.mock('@/firebase/server', () => ({
  firestore: {
    collection: jest.fn(),
    getAll: jest.fn(),
  },
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('getUserRoles', () => {
  let mockGet: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    mockGet = jest.fn();
    (firestore.collection as jest.Mock).mockReturnValue({
      doc: jest.fn((id) => ({
        id,
        get: mockGet,
      })),
    });
  });

  it('should fetch user roles using firestore.getAll() and avoid N+1 queries', async () => {
    const uid = 'user1';
    const roleIds = ['role1', 'role2', 'role3'];

    // First call for userRoles
    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ roleIds }),
    });

    // Mock getAll for roles
    (firestore.getAll as jest.Mock).mockResolvedValueOnce(
      roleIds.map((roleId) => ({
        id: roleId,
        exists: true,
        data: () => ({
          name: `Role ${roleId}`,
          description: `Description ${roleId}`,
          createdAt: { toDate: () => new Date() },
          updatedAt: { toDate: () => new Date() },
        }),
      }))
    );

    const roles = await getUserRoles(uid);

    expect(roles).toHaveLength(3);
    expect(roles[0].id).toBe('role1');
    expect(roles[1].id).toBe('role2');
    expect(roles[2].id).toBe('role3');

    // 1 call for userRoles
    expect(mockGet).toHaveBeenCalledTimes(1);
    // 1 call for getAll
    expect(firestore.getAll).toHaveBeenCalledTimes(1);
    // Ensure getAll was called with correct number of refs
    expect((firestore.getAll as jest.Mock).mock.calls[0].length).toBe(3);
  });

  it('should return empty array if user has no roles', async () => {
    const uid = 'user2';

    mockGet.mockResolvedValueOnce({
      exists: true,
      data: () => ({ roleIds: [] }),
    });

    const roles = await getUserRoles(uid);

    expect(roles).toEqual([]);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(firestore.getAll).not.toHaveBeenCalled();
  });

  it('should return empty array if userRoles document does not exist', async () => {
    const uid = 'user3';

    mockGet.mockResolvedValueOnce({
      exists: false,
    });

    const roles = await getUserRoles(uid);

    expect(roles).toEqual([]);
    expect(mockGet).toHaveBeenCalledTimes(1);
    expect(firestore.getAll).not.toHaveBeenCalled();
  });
});
