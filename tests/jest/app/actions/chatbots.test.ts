import { addChatbot } from '@/app/actions/chatbots';
import { firestore } from '@/firebase/server';
import { addDoc } from '@/firebase/server/firestore';
import { revalidatePath } from 'next/cache';

jest.mock('@/firebase/server', () => ({
  firestore: {
    collection: jest.fn().mockReturnThis(),
  },
}));

jest.mock('@/firebase/server/firestore', () => ({
  addDoc: jest.fn(),
}));

jest.mock('next/cache', () => ({
  revalidatePath: jest.fn(),
}));

describe('addChatbot', () => {
  const mockChatbot = {
    name: 'Test Bot',
    promptType: 1, // Chat
    provider: 1, // Google
    instructions: 'Test instructions',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully add a chatbot', async () => {
    const mockId = 'mock-id';
    (addDoc as jest.Mock).mockResolvedValue(mockId);

    const result = await addChatbot(mockChatbot as any);

    expect(firestore.collection).toHaveBeenCalledWith('chatbots');
    expect(addDoc).toHaveBeenCalledWith(expect.anything(), mockChatbot);
    expect(revalidatePath).toHaveBeenCalledWith('/admin/settings/chatbots');
    expect(result).toEqual({
      id: mockId,
      ...mockChatbot,
    });
  });

  it('should return null when addDoc throws an error', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    (addDoc as jest.Mock).mockRejectedValue(new Error('Firestore error'));

    const result = await addChatbot(mockChatbot as any);

    expect(result).toBeNull();
    expect(consoleSpy).toHaveBeenCalledWith('Error adding chatbot:', expect.any(Error));
    expect(revalidatePath).not.toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
