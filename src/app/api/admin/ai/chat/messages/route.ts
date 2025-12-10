import { listAiChatMessages } from "@/app/actions/ai-chats"
import { getDoc } from "@/firebase/server/firestore"
import { NextResponse } from "next/server"

export const POST = async (req: Request) => {
  const { id } = await req.json()
  if (!id) {
    return NextResponse.json({ error: "Chat ID is required" }, { status: 400 })
  }

  const chatDoc = await getDoc("aiChats", id)
  if (!chatDoc.exists) {
    return NextResponse.json({ error: "Chat not found" }, { status: 404 })
  }

  const chatData = chatDoc.data()
  const userId = req.headers.get("x-user-id")
  if (chatData.userId !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const messages = await listAiChatMessages(id)
  return NextResponse.json(messages)
}