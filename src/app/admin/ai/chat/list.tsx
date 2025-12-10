import { cn } from "@/lib/utils"
import { listAiChats } from "@/app/actions/ai-chats"
import { Item, ItemContent, ItemGroup, ItemSeparator, ItemTitle } from "@/components/ui/item"
import { Fragment } from "react/jsx-runtime"
import Link from "next/link"

type ChatListProps = {
  className?: string
} & React.HTMLAttributes<HTMLDivElement>

export default async function ChatList({ className, ...props }: ChatListProps) {
  const chats = await listAiChats()
  return (
    <ItemGroup {...props} className={cn("flex flex-col gap-2", className)}>
      {chats.map((chat) => (
        <Item key={chat.id} asChild>
          <Link href={`/admin/ai/chat/${chat.id}`} className="p-1">
            <ItemContent>
              <ItemTitle>{chat.title || chat.id}</ItemTitle>
            </ItemContent>
          </Link>
        </Item>
      ))}
    </ItemGroup>
  )
}