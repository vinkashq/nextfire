'use server';

import { firestore } from '@/firebase/server';
import { addDoc } from '@/firebase/server/firestore';
import { Chatbot, Model } from '@/types/ai/chat';
import { revalidatePath } from 'next/cache';

const COLLECTION_NAME = 'chatbots';

export async function listChatbots(): Promise<Chatbot[]> {
  try {
    const snapshot = await firestore.collection(COLLECTION_NAME).get();
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.()?.getTime() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.()?.getTime() || data.updatedAt,
      } as Chatbot;
    });
  } catch (error) {
    console.error('Error listing chatbots:', error);
    return [];
  }
}

export async function addChatbot(chatbot: Omit<Chatbot, 'id'>): Promise<Chatbot | null> {
  try {
    const id = await addDoc(firestore.collection(COLLECTION_NAME), chatbot)
    revalidatePath('/admin/settings/chatbots');
    return {
      id,
      ...chatbot,
    };
  } catch (error) {
    console.error('Error adding chatbot:', error);
    return null;
  }
}

export async function updateChatbot(id: string, chatbot: Partial<Chatbot>): Promise<void> {
  try {
    await firestore.collection(COLLECTION_NAME).doc(id).update(chatbot);
    revalidatePath('/admin/settings/chatbots');
  } catch (error) {
    console.error('Error updating chatbot:', error);
    throw error;
  }
}

export async function deleteChatbot(id: string): Promise<void> {
  try {
    await firestore.collection(COLLECTION_NAME).doc(id).delete();
    revalidatePath('/admin/settings/chatbots');
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    throw error;
  }
}
