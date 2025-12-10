"use client"

import { useState } from "react"
import { streamFlow } from "@genkit-ai/next/client"
import chatFlow from "@/genkit/flows/chatFlow"
import ChatPrompt from "@/components/ai/chat/prompt"
import Message from "@/components/ai/chat/message"
import { MessageType, PromptType } from "@/types/ai/chat"
import { Provider } from "@/config/ai"
import ThinkingAnimation from "@/components/ai/chat/thinking-animation"

export default function ChatPage() {
  const [chatId, setChatId] = useState<string>()
  const [messages, setMessages] = useState<MessageType[]>([])
  const [streamedMessage, setStreamedMessage] = useState<MessageType>()
  const [streaming, setStreaming] = useState(false)
  const hasMessages = messages.length > 0
  const thinking = streaming && streamedMessage?.text === ""

  const send = async (promptMessage: string, promptType: PromptType) => {
    setMessages((prev) => [...prev, {
      text: promptMessage,
      promptType,
      role: 1,
      author: {
        uid: "1",
        name: "User",
      },
    }])

    setStreamedMessage({
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

    setStreaming(true)
    const response = streamFlow<typeof chatFlow>({
      url: "/api/admin/ai/chat",
      input: { promptMessage, promptType, chatId },
    })

    for await (const chunk of response.stream) {
      setStreamedMessage((prev) => ({ ...prev, text: prev.text + chunk }))
    }

    setStreaming(false)
    const result = await response.output
    if (!chatId) {
      setChatId(result.chatId)
    }
    setMessages((prev) => [...prev, { ...streamedMessage, text: result.message }])
    setStreamedMessage(undefined)
  }

  return (
    <div className="w-full h-full flex flex-col gap-2 justify-center mx-auto py-2">
      {messages.map((message, index) => (
        <Message key={index} {...message} />
      ))}
      {thinking && <ThinkingAnimation />}
      {streamedMessage && <Message {...streamedMessage} />}
      {hasMessages && <div className="grow"></div>}
      <ChatPrompt onSend={send} />
    </div>
  )
}
