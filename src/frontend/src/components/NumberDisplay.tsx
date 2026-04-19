import { cn } from "@/lib/utils";

interface USDDisplayProps {
  value: number;
  className?: string;
  showSign?: boolean;
  decimals?: number;
}

export function USDDisplay({
  value,
  className,
  showSign = false,
  decimals = 2,
}: USDDisplayProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(Math.abs(value));

  const isNegative = value < 0;
  const prefix = showSign ? (isNegative ? "-" : "+") : isNegative ? "-" : "";

  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {prefix}
      {formatted}
    </span>
  );
}

interface CryptoAmountProps {
  value: number;
  symbol: string;
  className?: string;
  maxDecimals?: number;
}

export function CryptoAmount({
  value,
  symbol,
  className,
  maxDecimals = 8,
}: CryptoAmountProps) {
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: maxDecimals,
  }).format(value);

  return (
    <span className={cn("font-mono tabular-nums", className)}>
      {formatted}{" "}
      <span className="text-muted-foreground text-xs">{symbol}</span>
    </span>
  );
}

interface PriceChangeProps {
  percent: number;
  className?: string;
}

export function PriceChange({ percent, className }: PriceChangeProps) {
  const isPositive = percent >= 0;
  return (
    <span
      className={cn(
        "font-mono tabular-nums text-sm font-medium",
        isPositive ? "text-gain" : "text-loss",
        className,
      )}
    >
      {isPositive ? "+" : ""}
      {percent.toFixed(2)}%
    </span>
  );
}

// Default export combining the components as a namespace
const NumberDisplay = { USDDisplay, CryptoAmount, PriceChange };
export default NumberDisplay;
