export default function ThinkingAnimation() {
  return (
    <span className="relative flex size-3">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary"></span>
      <span className="relative inline-flex size-3 rounded-full bg-primary"></span>
    </span>
  )
}