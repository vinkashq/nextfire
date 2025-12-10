"use client"

import { useEffect, useState } from "react"
import { streamFlow } from "@genkit-ai/next/client"
import chatFlow from "@/genkit/flows/chatFlow"
import ChatPrompt from "@/components/ai/chat/prompt"
import Message from "@/components/ai/chat/message"
import { MessageType, PromptType } from "@/types/ai/chat"
import { Provider } from "@/config/ai"
import ThinkingAnimation from "@/components/ai/chat/thinking-animation"
import { listAiChatMessages } from "@/app/actions/ai-chats"
import { postRequest } from "@/lib/utils"
import { useAppCheck } from "@/context/firebase/AppCheckContext"

interface AIChatProps {
  id?: string
}

export default function AIChat({ id }: AIChatProps) {
  const [loading, setLoading] = useState(!!id)
  const [messages, setMessages] = useState<MessageType[]>([])
  const [streamedMessage, setStreamedMessage] = useState<MessageType>()
  const [streaming, setStreaming] = useState(false)
  const hasMessages = messages.length > 0
  const thinking = streaming && streamedMessage?.text === ""
  const { getAppCheckToken } = useAppCheck()

  useEffect(() => {
    if (id && loading) {
      getAppCheckToken()
        .then(async (appCheckToken) => {
          postRequest("/api/admin/ai/chat/messages", appCheckToken, { id })
            .then(async (response) => {
              const data = await response.json()
              setMessages(data)
            })
            .catch((error) => {
              console.error("Error fetching chat messages:", error)
            })
            .finally(() => {
              setLoading(false)
            })
        })
    }
  }, [id])

  if (loading) {
    return <div>Loading...</div>
  }

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
      input: { promptMessage, promptType, id },
    })

    for await (const chunk of response.stream) {
      setStreamedMessage((prev) => ({ ...prev, text: prev.text + chunk }))
    }

    setStreaming(false)
    const result = await response.output
    if (!id) {
      id = result.id
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
