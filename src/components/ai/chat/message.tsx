import Markdown from "@/components/markdown"
import { MessageType } from "@/types/ai/chat"

export default function Message({ text, promptType, role, author }: MessageType) {
  const classNames = [
    "chat-message",
    `role-${role}`,
    `prompt-type-${promptType}`,
  ]
  return (
    <div className={classNames.join(" ")}>
      <Markdown text={text} />
    </div>
  )
}
