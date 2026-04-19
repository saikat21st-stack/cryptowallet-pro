// Map of crypto symbols to their display colors and emoji/icon identifiers
const CRYPTO_META: Record<string, { color: string; emoji: string }> = {
  BTC: { color: "#F7931A", emoji: "₿" },
  ETH: { color: "#627EEA", emoji: "Ξ" },
  BNB: { color: "#F3BA2F", emoji: "B" },
  SOL: { color: "#9945FF", emoji: "◎" },
  DOGE: { color: "#C2A633", emoji: "Ð" },
  USDT: { color: "#26A17B", emoji: "$" },
  USDC: { color: "#2775CA", emoji: "$" },
  XRP: { color: "#0085C0", emoji: "✕" },
  ADA: { color: "#0033AD", emoji: "₳" },
  AVAX: { color: "#E84142", emoji: "△" },
  MATIC: { color: "#8247E5", emoji: "⬡" },
  DOT: { color: "#E6007A", emoji: "●" },
  LINK: { color: "#375BD2", emoji: "⬡" },
  LTC: { color: "#BFC0C0", emoji: "Ł" },
  UNI: { color: "#FF007A", emoji: "🦄" },
  ATOM: { color: "#2E3148", emoji: "⚛" },
  XLM: { color: "#7D00FF", emoji: "✦" },
  NEAR: { color: "#00C08B", emoji: "N" },
  APT: { color: "#00B2FF", emoji: "A" },
  OP: { color: "#FF0420", emoji: "⊕" },
  ARB: { color: "#28A0F0", emoji: "◎" },
  FTM: { color: "#1969FF", emoji: "F" },
  ALGO: { color: "#00B4D0", emoji: "A" },
  VET: { color: "#15BDFF", emoji: "V" },
  FIL: { color: "#0090FF", emoji: "⬡" },
};

interface CryptoIconProps {
  symbol: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const SIZE_CLASSES = {
  sm: { outer: "w-7 h-7", text: "text-xs" },
  md: { outer: "w-9 h-9", text: "text-sm" },
  lg: { outer: "w-12 h-12", text: "text-base" },
};

export default function CryptoIcon({
  symbol,
  size = "md",
  className = "",
}: CryptoIconProps) {
  const meta = CRYPTO_META[symbol.toUpperCase()] ?? {
    color: "#6B7280",
    emoji: symbol.charAt(0).toUpperCase(),
  };
  const sizes = SIZE_CLASSES[size];

  return (
    <div
      className={`${sizes.outer} rounded-full flex items-center justify-center shrink-0 font-mono font-bold ${sizes.text} ${className}`}
      style={{
        backgroundColor: `${meta.color}22`,
        border: `1.5px solid ${meta.color}55`,
        color: meta.color,
      }}
      title={symbol}
      aria-label={symbol}
    >
      {meta.emoji.length <= 2 ? meta.emoji : symbol.charAt(0)}
    </div>
  );
}
