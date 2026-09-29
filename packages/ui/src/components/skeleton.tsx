import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-st-row bg-st-border/70", className)}
      {...props}
    />
  )
}

export { Skeleton }
