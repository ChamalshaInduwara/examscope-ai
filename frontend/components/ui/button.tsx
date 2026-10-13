import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-all duration-200 outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-b from-[#0466c8] to-[#0353a4] text-white shadow-sm shadow-[#0466c8]/25 hover:shadow-[0_4px_20px_rgba(4,102,200,0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]",
        outline:
          "border-border bg-background/80 hover:border-[#0466c8]/50 hover:text-[#0466c8] hover:bg-[#0466c8]/5 hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 dark:border-slate-800 dark:hover:border-[#0466c8]/60 dark:hover:bg-[#0466c8]/10",
        secondary:
          "bg-slate-900 text-white hover:bg-black hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 dark:bg-slate-800 dark:hover:bg-slate-700",
        ghost:
          "hover:bg-[#0466c8]/10 hover:text-[#0466c8] active:bg-[#0466c8]/15 dark:hover:bg-[#0466c8]/15 dark:hover:text-[#60a5fa]",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:shadow-sm hover:-translate-y-0.5 active:translate-y-0 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive dark:focus-visible:ring-destructive/40",
        link: "text-[#0466c8] underline-offset-4 hover:underline hover:text-[#0353a4] dark:text-[#60a5fa]",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
