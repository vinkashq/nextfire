import { Provider } from "@/config/ai"

export type User = {
  uid: string
  name?: string
  avatarUrl?: string
}
export type Chatbot = {
  id: string
  promptType: PromptType
  name: string
  provider: Provider
}
export type Model = {
  id: string
  promptType: PromptType
  name: string
  provider: Provider
  title: string
}
export type AuthorType = User | Chatbot

export type MessageType = {
  id?: string
  text: string
  promptType: PromptType
  role: Role
  author: AuthorType
}

export enum PromptType {
  Chat = 1,
  Answer = 2,
  Brainstorm = 3,
  Think = 4,
  Research = 5,
}

export enum Role {
  User = 1,
  Model = 2,
}