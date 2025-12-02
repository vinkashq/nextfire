import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BookOpenText, Brain, CircleCheckBig, Lightbulb, MessageCircle } from "lucide-react"
import { PromptType } from "@/types/ai/chat"

type PromptTypeInputProps = {
  promptType: PromptType
  setPromptType: (promptType: PromptType) => void
}

export default function PromptTypeInput({ promptType, setPromptType }: PromptTypeInputProps) {
  return (
    <ToggleGroup
      type="single"
      variant="outline"
      defaultValue="1"
      className="text-xs"
      value={promptType.toString()}
      onValueChange={(value) => setPromptType(Number(value) as PromptType)}>
      <ToggleGroupItem value="1" size="sm" className="group">
        <MessageCircle />
        <span className="hidden group-aria-checked:block">Chat</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="2" size="sm" className="group">
        <CircleCheckBig />
        <span className="hidden group-aria-checked:block">Answer</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="3" size="sm" className="group">
        <Lightbulb />
        <span className="hidden group-aria-checked:block">Brainstorm</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="4" size="sm" className="group">
        <Brain />
        <span className="hidden group-aria-checked:block">Think</span>
      </ToggleGroupItem>
      <ToggleGroupItem value="5" size="sm" className="group">
        <BookOpenText />
        <span className="hidden group-aria-checked:block">Research</span>
      </ToggleGroupItem>
    </ToggleGroup>
  )
}