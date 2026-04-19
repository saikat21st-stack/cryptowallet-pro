# Design Brief

## Direction

**Crypto Fintech Premium** — A confident, data-focused dashboard inspired by Binance and Coinbase, optimized for portfolio clarity and paper trading with vibrant gain/loss color coding.

## Tone

Bold maximalism for fintech: deep dark backgrounds amplify chart readability, vibrant teal/green/red accents signal market sentiment, zero ambiguity in transaction states (buy = green, sell = red).

## Differentiation

Vibrant crypto-grade color hierarchy (not muted pastels) combines with premium card-based layout and distinctive Space Grotesk typography to create a dashboard that feels confident, not corporate.

## Color Palette

| Token | OKLCH | Role |
| --- | --- | --- |
| background | 0.135 0.012 260 | Deep charcoal base, high contrast for dark mode |
| foreground | 0.95 0.01 260 | Near-white text, premium readability |
| card | 0.17 0.014 260 | Elevated surface for portfolio cards, holding details |
| primary | 0.7 0.22 190 | Teal/cyan for growth, portfolio uptrend, primary CTAs |
| accent | 0.68 0.26 140 | Electric green for buy actions, "bullish" energy, gains |
| destructive | 0.55 0.24 25 | Vivid red for losses, sell actions, alert states |
| chart-1 | 0.72 0.28 145 | Gain/profit line color in charts |
| chart-2 | 0.75 0.25 195 | Primary portfolio trend color |
| chart-3 | 0.58 0.26 28 | Loss/downtrend line color |

## Typography

- **Display**: Space Grotesk — tech-forward confidence, geometric sans for dashboard headers and portfolio totals
- **Body**: DM Sans — clean, tight metrics for crypto data density (prices, percentages, transaction details)
- **Mono**: JetBrains Mono — trusted by traders, used for price displays, transaction IDs, balance figures
- **Scale**: Hero `text-5xl md:text-7xl font-bold`, section head `text-3xl font-bold`, label `text-xs uppercase tracking-widest`, body `text-base`

## Elevation & Depth

Cards float on dark background with subtle shadows (`shadow-card`), no gradients or gloss. Premium fintech means clarity first — surface hierarchy through background color contrast (card vs. background) and border subtlety, not visual effects.

## Structural Zones

| Zone | Background | Border | Notes |
| --- | --- | --- | --- |
| Header | `bg-card` with teal underline | `border-b border-primary/30` | Admin toggle, user settings, navigation |
| Sidebar | `bg-sidebar` (16% L) | `border-r border-sidebar-border` | Nav, dashboard/admin switch, crypto list |
| Content | `bg-background` (13.5% L) | — | Spacious grid for portfolio cards |
| Card | `bg-card` (17% L) | `border border-card` | Holding card, transaction card, alternating `bg-gain/10` or `bg-loss/10` for state |
| Footer | `bg-muted/30` | `border-t border-border/20` | Support links, legal, customer service |

## Spacing & Rhythm

16px base unit. Section gaps 32px (spacious for premium feel). Card padding 20px. Micro-spacing 8px. Column gaps 16px. Grid-based layout with 12-column responsive (6 col on tablet, 4 col on mobile) to fit 20+ cryptocurrencies.

## Component Patterns

- **Buttons**: Primary (bg-primary) for buy/trade, accent (bg-accent green) for confirmations, destructive (bg-destructive red) for sell/withdraw
- **Cards**: 6px radius, `bg-card` base, `border-b-2` colored for gain (green) or loss (red) state
- **Badges**: Pill-shaped (full radius), gain badge `bg-gain text-chart-1`, loss badge `bg-loss text-destructive`
- **Tables**: Crypto holdings rows with price in `font-mono`, gain% in `text-gain` or `text-loss` with colored background
- **Inputs**: `bg-input` (26% L), `border-input` subtle, focus `ring-2 ring-primary`

## Motion

- **Entrance**: Cards fade-in 0.3s staggered on load
- **Hover**: Buttons scale 1.02, card shadows lift on `shadow-elevated`
- **Decorative**: Portfolio sparkle pulse on gain state (optional micro-interaction)

## Constraints

- Never use raw hex colors, only semantic tokens (text-chart-1, bg-gain, etc.)
- Dark mode always enabled — no light mode toggle
- Price figures always use JetBrains Mono for monospace trust
- Red/green must always mean loss/gain — never inverted
- No gradients, no shadows > 16px blur
- Maintain AA+ contrast ratio across all text (0.95 fg on 0.135 bg = 0.815 Δ lightness)

## Signature Detail

Gain/loss color bleeding (gain cards have green left border, loss cards have red) — a subtle persistent visual state that builds confidence in portfolio clarity without decoration.


