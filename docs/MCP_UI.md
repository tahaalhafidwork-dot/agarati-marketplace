# UI templates via MCP

AGARATİ uses MCP servers to pull production UI blocks instead of hand-drawing chrome.

## Configured servers

| Server | Config | Auth |
| --- | --- | --- |
| **shadcn** | `.cursor/mcp.json` → `npx shadcn@latest mcp` | none |
| **21st.dev** | same file → `https://21st.dev/api/mcp` | `API_KEY_21ST` env |

## Enable in Cursor

1. Cursor Settings → MCP
2. Enable **shadcn** (green dot)
3. For **21st**: create a key at https://21st.dev/settings/api-keys (or https://21st.dev/mcp)
4. Set Windows user env `API_KEY_21ST` to that key, then restart Cursor
5. Confirm **21st** shows connected

## After reconnect — ask the agent

Examples:

- «ابحث عبر shadcn MCP عن listing card / property search وركّبها»
- «من 21st ابحث عن real estate / marketplace templates وطبّق أفضلها RTL»
- «ثبّت blocks للهيدر وبطاقة العقار وصفحة البحث»

## Brand locks

Keep AGARATİ: `#0F2744` + gold `#B8956C`, Arabic RTL, card 4/3, no exact public address. Do not ship competitor trademarks.
