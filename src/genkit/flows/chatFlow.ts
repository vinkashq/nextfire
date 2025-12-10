import { Session, z } from "genkit";
import googleChatbot from "@/genkit/google/chatbot";
import { DocumentData, FieldValue } from "firebase-admin/firestore";
import GenkitSessionStore from "@/genkit/session/store";
import { addDoc, collectionRef, getDoc } from "@/firebase/server/firestore";

const chatFlow = googleChatbot.defineFlow({
  name: "chatFlow",
  inputSchema: z.object({
    id: z.string().optional(),
    promptMessage: z.string(),
    promptType: z.number().min(1).max(5),
  }),
  streamSchema: z.string(),
  outputSchema: z.object({
    id: z.string(),
    message: z.string(),
    model: z.string().optional(),
  }),
}, async ({ id, promptMessage, promptType }, { context, sendChunk }) => {
  const chatsRef = collectionRef("aiChats")
  const messagesRef = collectionRef("aiChatMessages")

  const isNewChat = !id
  const userId = context.auth?.userId || null
  const timestamp = FieldValue.serverTimestamp()

  let session: Session<DocumentData>
  const sessionStore = new GenkitSessionStore()
  if (isNewChat) {
    session = googleChatbot.createSession({
      store: sessionStore,
      initialState: {
        userId,
        createdAt: timestamp,
        loadedAt: timestamp,
        updatedAt: timestamp,
      }
    })
    id = await addDoc(chatsRef, {
      userId,
      sessionId: session.id,
    })
  } else {
    const chatDoc = await getDoc("aiChats", id)
    if (!chatDoc.exists) {
      throw new Error("Chat not found")
    }

    const chatData = chatDoc.data()
    session = await googleChatbot.loadSession(chatData.sessionId, {
      store: sessionStore,
    })
    session.updateState({
      loadedAt: timestamp,
      updatedAt: timestamp,
    })
  }

  await addDoc(messagesRef, {
    chatId: id,
    text: promptMessage,
    role: "user",
    userId,
  })

  const chat = session.chat()

  const { stream, response } = chat.sendStream(promptMessage)
  for await (const chunk of stream) {
    sendChunk(chunk.text)
  }

  const { text, model } = await response
  const chatbots = await collectionRef("chatbots").offset(0).limit(1).get()
  const chatbotId = chatbots.docs[0].id

  const models = await collectionRef("aiModels").offset(0).limit(1).get()
  const modelId = models.docs[0].id

  await addDoc(messagesRef, {
    chatId: id,
    text,
    role: "model",
    chatbotId,
    modelId,
  })

  return {
    id,
    message: text,
    promptType,
  }
})

export default chatFlow