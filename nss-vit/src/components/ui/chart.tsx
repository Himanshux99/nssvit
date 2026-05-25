import * as React from "react"
import { cn } from "../../lib/utils"

export type ChartConfig = {
  [key: string]: {
    label?: React.ReactNode
    color?: string
  }
}

const ChartContext = React.createContext<{
  config: ChartConfig
} | null>(null)

export function useChart() {
  const context = React.useContext(ChartContext)
  if (!context) {
    throw new Error("useChart must be used within a ChartContainer")
  }
  return context
}

const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ReactNode
  }
>(({ id, className, config, children, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        ref={ref}
        id={chartId}
        className={cn(
          "flex aspect-square justify-center text-xs [&_.recharts-cartesian-grid-horizontal_line]:stroke-swiss-gray-200 [&_.recharts-cartesian-grid-vertical_line]:stroke-swiss-gray-200 [&_.recharts-legend-item_value]:text-text [&_.recharts-reference-line_line]:stroke-swiss-gray-200 [&_.recharts-sector]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <style dangerouslySetInnerHTML={{
          __html: Object.entries(config)
            .map(([key, item]) => {
              if (item.color) {
                return `#${chartId} { --color-${key}: ${item.color}; }`
              }
              return ""
            })
            .join("\n")
        }} />
        {children}
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "ChartContainer"

const ChartTooltipContent = React.forwardRef<
  HTMLDivElement,
  {
    active?: boolean
    payload?: any[]
    label?: string
    hideLabel?: boolean
    formatter?: (value: any, name: any) => React.ReactNode
    className?: string
  }
>(({ active, payload, label, hideLabel = false, formatter, className }, ref) => {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-md border border-swiss-gray-200 bg-white p-2.5 shadow-sm text-xs min-w-[120px] text-text",
        className
      )}
    >
      {!hideLabel && <div className="font-bold mb-1">{label}</div>}
      <div className="space-y-1.5">
        {payload.map((item: any, idx: number) => {
          const color = item.payload.fill || item.color || item.payload.color
          const name = item.name
          const value = formatter ? formatter(item.value, item.name) : item.value
          return (
            <div key={idx} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: color }}
                />
                <span className="text-swiss-gray-500 font-medium">{name}</span>
              </div>
              <span className="font-bold">{value}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
})
ChartTooltipContent.displayName = "ChartTooltipContent"

import { Tooltip as ChartTooltip } from "recharts"
export { ChartContainer, ChartTooltip, ChartTooltipContent }
