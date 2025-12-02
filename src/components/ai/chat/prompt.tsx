import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupTextarea } from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { PromptType } from "@/types/ai/chat";
import { ArrowUp } from "lucide-react";
import { ComponentProps, KeyboardEvent, useState } from "react";
import ModelTypeInput from "@/components/ai/chat/prompt-type-input";

type ChatPromptProps = {
  className?: string
  onSend: (promptMessage: string, promptType: PromptType) => void
} & ComponentProps<typeof InputGroup>

export default function ChatPrompt({ className, onSend, ...props }: ChatPromptProps) {
  const [promptMessage, setPromptMessage] = useState("")
  const [promptType, setModelType] = useState<PromptType>(PromptType.Chat)
  const length = promptMessage.trim().length
  const disabled = length <= 2

  const onKeyDown = (e: KeyboardEvent) => {
    if (!disabled && e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend(promptMessage, promptType)
      setPromptMessage("")
    }
  }

  const onClick = () => {
    onSend(promptMessage, promptType)
    setPromptMessage("")
  }

  return (
    <InputGroup className={cn("max-w-5xl mx-auto", className)} {...props}>
      <InputGroupTextarea
        autoFocus
        placeholder="Ask anything"
        onKeyDown={onKeyDown}
        onChange={(e) => setPromptMessage(e.target.value)}
        value={promptMessage}
        className="min-h-12"
      />
      <InputGroupAddon align="block-end">
        <ModelTypeInput promptType={promptType} setModelType={setModelType} />
        <InputGroupButton
          variant="default"
          className="rounded-full ml-auto"
          size="icon-xs"
          disabled={disabled}
          onClick={onClick}
        >
          <ArrowUp />
          <span className="sr-only">Send</span>
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  )
}