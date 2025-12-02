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
}, async ({ sessionId, chatId, promptMessage, promptType }, { sendChunk }) => {
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

  const chat = session.chat()

  const { stream, response } = chat.sendStream(promptMessage)
  for await (const chunk of stream) {
    sendChunk(chunk.text)
  }

  const { text, model } = await response

  // const ref = collectionRef("admin/ai/chats")
  // const chatId = await addDoc(ref, {
  //   sessionId,
  //   promptMessage,
  //   promptType,
  //   model,
  // })

  return {
    // chatId,
    sessionId,
    message: text,
    model,
  }
})

export default chatFlow