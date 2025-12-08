'use server';

import { firestore } from '@/firebase/server';
import { addDoc, updateDoc } from '@/firebase/server/firestore';
import { Model } from '@/types/ai/chat';

const COLLECTION_NAME = 'aiModels';
const collectionRef = firestore.collection(COLLECTION_NAME);

export const listAiModels = async () => {
  const querySnapshot = await collectionRef.get();
  const models = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as Model[];
  return models;
}

export const createAiModel = async (model: Model) => {
  const id = await addDoc(collectionRef, model);
  return { ...model, id } as Model
}

export const updateAiModel = async (model: Model) => {
  await updateDoc(collectionRef.doc(model.id), model);
  return model;
}

export const deleteAiModel = async (model: Model) => {
  await collectionRef.doc(model.id).delete();
  return model;
}
