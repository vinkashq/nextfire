"use client"

import { useState } from "react"
import { streamFlow } from "@genkit-ai/next/client"
import chatFlow from "@/genkit/flows/chatFlow"
import ChatPrompt from "@/components/ai/chat/prompt"
import Message from "@/components/ai/chat/message"
import { MessageType, PromptType } from "@/types/ai/chat"
import { Provider } from "@/config/ai"

export default function ChatPage() {
  const [messages, setMessages] = useState<MessageType[]>([])
  const [streamedMessage, setStreamedMessage] = useState<MessageType>()

  const send = async (promptMessage: string, promptType: PromptType) => {
    setMessages((prev) => [...prev, {
      id: "1",
      text: promptMessage,
      promptType,
      role: 1,
      author: {
        uid: "1",
        name: "User",
      },
    }])

    setStreamedMessage({
      id: "2",
      text: "",
      promptType,
      role: 2,
      author: {
        id: "1",
        name: "Model",
        promptType,
        provider: Provider.Google,
      },
    })

    const response = streamFlow<typeof chatFlow>({
      url: "/api/admin/ai/chat",
      input: { promptMessage, promptType },
    })

    for await (const chunk of response.stream) {
      setStreamedMessage((prev) => ({ ...prev, text: prev.text + chunk }))
    }

    const result = await response.output
    setStreamedMessage((prev) => ({ ...prev, text: result.message }))
    setMessages((prev) => [...prev, { ...streamedMessage }])
    setStreamedMessage(undefined)
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 justify-center mx-auto py-2">
      {messages.map((message, index) => (
        <Message key={index} {...message} />
      ))}
      {streamedMessage && (
        <Message {...streamedMessage} />
      )}
      <ChatPrompt onSend={send} />
    </div>
  )
}
