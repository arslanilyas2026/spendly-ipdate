---
name: V2 Design System
description: Warm premium light theme, Plus Jakarta Sans, credit card widget, 4-tab nav
type: design
---
## Theme: Warm Premium ("Noir & Gold")
- Light: warm off-white bg (#FAF8F5 equiv), cream cards, warm amber accent (hsl 25 70% 52%)
- Dark: deep charcoal (#0D0F14 equiv), warm amber accent (hsl 25 75% 58%)
- Font: Plus Jakarta Sans (replaced DM Sans/DM Serif Display)
- Credit card widget on home: gradient-card class (deep navy/purple gradient)
- Card chip uses yellow-300/500 for metallic gold effect (intentional hardcoded)

## Navigation: 4-tab + FAB
- Home | Transactions | [FAB] | Reports | More
- "More" replaces old Profile tab — contains wallets, goals, debts, categories, recurring, settings
- ProfileScreen still exists at /profile for goals/debts management

## New Features
- Reminders: payment reminders with auto-transaction on "Pay"
- Transaction Templates: save & reuse frequent transactions
- Types: Reminder, TransactionTemplate added to types/index.ts
- Storage keys: reminders, templates added
