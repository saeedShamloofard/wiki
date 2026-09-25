import { cn } from "@/lib/utils";
import { ComponentProps } from "react";

const labelClassNames =
  "text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70";

export function Label({ className, ...props }: ComponentProps<"label">) {
  return <label className={cn(labelClassNames, className)} {...props} />;
}
