import { collectionRef } from "@/firebase/server/firestore"
import { DocumentData } from "firebase-admin/firestore"

const listAiChats = async () => {
  const chats = await collectionRef("aiChats")
    .orderBy("createdAt", "desc")
    .offset(0)
    .limit(10)
    .get()
  return chats.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as DocumentData))
}

const listAiChatMessages = async (id: string) => {
  const messages = await collectionRef("aiChatMessages")
    .where("chatId", "==", id)
    .orderBy("createdAt", "desc")
    .get()
  return messages.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  } as DocumentData))
}

export { listAiChats, listAiChatMessages }