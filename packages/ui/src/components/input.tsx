import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-st-button border border-st-border bg-st-surface px-3 py-1 text-[13px] text-st-text outline-none transition-[color,box-shadow] file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-st-muted focus-visible:border-st-blue focus-visible:ring-2 focus-visible:ring-st-blue-light disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-st-alert-text aria-invalid:ring-2 aria-invalid:ring-st-alert-bg",
        className
      )}
      {...props}
    />
  )
}

export { Input }
