import Markdown from "@/components/markdown"
import { MessageType } from "@/types/ai/chat"

export default function Message({ text, promptType, role, author }: MessageType) {
  return (
    <div className="message">
      {author.name}
      <p>{promptType} {role}</p>
      <Markdown text={text} />
    </div>
  )
}
