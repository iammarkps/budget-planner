/**
 * Shared chart formatting utilities for Recharts components
 */

type TooltipValue = number | string | Array<number | string> | undefined;

export const formatTooltip = (value: TooltipValue): string => {
  if (typeof value === "number") {
    return `${value.toLocaleString()} THB`;
  }
  if (value === undefined) {
    return "0 THB";
  }
  return `${value} THB`;
};
