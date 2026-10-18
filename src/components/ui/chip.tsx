import * as React from "react"

import { cn } from "@/lib/utils"

type ChipProps = React.ComponentProps<"button"> & {
  selected?: boolean
}

function Chip({ className, selected = false, ...props }: ChipProps) {
  return (
    <button
      type="button"
      data-slot="chip"
      data-selected={selected || undefined}
      className={cn(
        "inline-flex h-7 shrink-0 cursor-pointer items-center gap-1 rounded-full border border-input bg-transparent px-2.5 text-xs font-medium whitespace-nowrap transition-colors outline-none select-none hover:bg-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:translate-y-px disabled:pointer-events-none disabled:opacity-50",
        selected &&
          "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        className
      )}
      {...props}
    />
  )
}

export { Chip }
