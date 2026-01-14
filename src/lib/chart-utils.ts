/**
 * Shared chart formatting utilities for Recharts components
 */

export type TooltipValue = number | string | Array<number | string> | undefined;

export const formatTooltip = (value: TooltipValue): string => {
  if (typeof value === "number") {
    return `${value.toLocaleString()} THB`;
  }
  if (Array.isArray(value)) {
    return value
      .map((v) => (typeof v === "number" ? v.toLocaleString() : v))
      .map((v) => `${v} THB`)
      .join(" / ");
  }
  if (value === undefined) {
    return "0 THB";
  }
  return `${value} THB`;
};

export const formatYAxis = (value: number): string =>
  value >= 1000 ? `${(value / 1000).toFixed(0)}k` : String(value);
