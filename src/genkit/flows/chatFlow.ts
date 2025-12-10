import { Session, z } from "genkit";
import googleChatbot from "@/genkit/google/chatbot";
import { DocumentData, FieldValue } from "firebase-admin/firestore";
import GenkitSessionStore from "@/genkit/session/store";
import { addDoc, collectionRef } from "@/firebase/server/firestore";

const chatFlow = googleChatbot.defineFlow({
  name: "chatFlow",
  inputSchema: z.object({
    sessionId: z.string().optional(),
    chatId: z.string().optional(),
    promptMessage: z.string(),
    promptType: z.number().min(1).max(5),
  }),
  streamSchema: z.string(),
  outputSchema: z.object({
    sessionId: z.string(),
    message: z.string(),
    model: z.string().optional(),
  }),
}, async ({ sessionId, chatId, promptMessage, promptType }, { context, sendChunk }) => {
  let session: Session<DocumentData>
  const sessionStore = new GenkitSessionStore()
  const isNewSession = !sessionId

  if (isNewSession) {
    session = googleChatbot.createSession({
      store: sessionStore,
      initialState: {
        createdAt: FieldValue.serverTimestamp(),
        loadedAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      }
    })
    sessionId = session.id
  } else {
    session = await googleChatbot.loadSession(sessionId, {
      store: sessionStore,
    })
    session.updateState({
      loadedAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    })
  }

  const userId = context.auth?.userId || null
  const chatsRef = collectionRef("aiChats")
  const messagesRef = collectionRef("aiChatMessages")
  if (!chatId) {
    chatId = await addDoc(chatsRef, {
      sessionId,
    })
  }
  await addDoc(messagesRef, {
    chatId,
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
    chatId,
    text,
    role: "model",
    chatbotId,
    modelId,
  })

  return {
    chatId,
    sessionId,
    message: text,
    promptType,
  }
})

export default chatFlow