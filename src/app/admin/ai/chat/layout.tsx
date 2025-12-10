import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import ChatList from "./list";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ResizablePanelGroup direction="horizontal">
      <ResizablePanel defaultSize={25}>
        <ChatList />
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel defaultSize={75} className="px-4">{children}</ResizablePanel>
    </ResizablePanelGroup>
  )
}