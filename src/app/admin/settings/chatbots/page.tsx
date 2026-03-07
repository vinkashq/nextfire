import { listChatbots } from '@/app/actions/chatbots'
import ChatbotsCrud from './crud'

export default async function ChatbotsPage() {
  const chatbots = await listChatbots()

  return (
    <div className="grow container mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chatbots</h1>
      <ChatbotsCrud chatbots={chatbots} />
    </div>
  );
}