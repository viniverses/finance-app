import { cn } from "@workspace/ui/lib/utils"
import * as React from "react"

type CardProps = React.HTMLAttributes<HTMLElement> & {
  as?: "article" | "div" | "section"
}

function Card({ as: Component = "div", className, ...props }: CardProps) {
  return (
    <Component
      data-slot="card"
      className={cn(
        "rounded-st-card border border-st-border bg-st-surface text-st-text shadow-none",
        className
      )}
      {...props}
    />
  )
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={className}
      {...props}
    />
  )
}

type CardTitleProps = React.HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3"
}

function CardTitle({
  as: Component = "h3",
  className,
  ...props
}: CardTitleProps) {
  return (
    <Component
      data-slot="card-title"
      className={cn("font-semibold text-st-text", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn("text-st-secondary", className)}
      {...props}
    />
  )
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={className} {...props} />
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-footer" className={className} {...props} />
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle }
