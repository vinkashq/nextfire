import markdownit from "markdown-it"
import DOMPurify from "isomorphic-dompurify"
import { cn } from "@/lib/utils"
import { ComponentProps } from "react"

const md = markdownit({
  html: false,
  linkify: true,
})

type MarkdownProps = {
  text: string
  className?: string
} & ComponentProps<"div">

export default function Markdown({ text, className, ...props }: MarkdownProps) {
  const html = md.render(text)
  const sanitizedHtml = DOMPurify.sanitize(html)
  return <div dangerouslySetInnerHTML={{ __html: sanitizedHtml }} className={cn("markdown", className)} {...props} />
}
