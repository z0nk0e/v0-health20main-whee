export type ClassValue = string | number | boolean | undefined | null | ClassValue[]

function clsx(...inputs: ClassValue[]): string {
  return inputs.flat().filter(Boolean).join(" ")
}

function twMerge(classes: string): string {
  // Simple implementation - just return the classes as-is
  // In a real app, this would handle Tailwind class conflicts
  return classes
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export type VariantProps<T extends (...args: any) => any> = Omit<Parameters<T>[0], "class" | "className">

export function cva(
  base: string,
  config?: {
    variants?: Record<string, Record<string, string>>
    defaultVariants?: Record<string, string>
  },
) {
  return (props?: Record<string, string> & { className?: string }) => {
    if (!config?.variants) return cn(base, props?.className)

    let result = base

    if (config.defaultVariants) {
      Object.entries(config.defaultVariants).forEach(([key, value]) => {
        const variant = config.variants?.[key]?.[value]
        if (variant) result += ` ${variant}`
      })
    }

    if (props) {
      Object.entries(props).forEach(([key, value]) => {
        if (key === "className") return
        const variant = config.variants?.[key]?.[value]
        if (variant) result += ` ${variant}`
      })
    }

    return cn(result, props?.className)
  }
}
