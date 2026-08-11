import * as React from "react";

import { cn } from "./utils";

function Badge({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="badge"
      className={cn(
        "inline-flex w-fit shrink-0 items-center justify-center gap-1 overflow-hidden whitespace-nowrap rounded-md border border-transparent bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 [&>svg]:pointer-events-none [&>svg]:size-3",
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
