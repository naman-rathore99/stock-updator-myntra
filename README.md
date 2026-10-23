# Myntra Stock Manager (Next.js + Tailwind)

The app opens on a home screen with summary counts and links. Open **View all inventory** to see every catalog SKU and quantity in one searchable list; select a SKU to edit its style or other-item group. Returns remain a separate section. Use **Home** to return to the overview. Select **Dark mode** or **Light mode** from the home or inventory screen.

The browser PIN lock is optional. Enable it from the home screen to set a 4–8 digit PIN. When enabled, the app locks after four minutes without interaction or when reopened; adjust the timeout from **Lock settings** (1–60 minutes), or lock immediately with **Lock now**. The PIN and timeout are local to that browser and do not sync. This is a UI privacy lock, not account authentication: someone with access to browser storage or developer tools can bypass it. Disable it any time in lock settings; **Forgot PIN? Reset browser lock** clears only the PIN, not inventory data.

Enter stock per style/color/size, then tap **Save & generate file** to download a CSV. Empty boxes are skipped. You can enter final quantities directly, increment with **+1**, or add notes such as `S=1, M=2, S=1` (which adds 2 to S and 2 to M).

Use the style selector in the dashboard to switch between styles, **Other** for one-off codes, and **Returns** to track returned stock. **Generate range** creates multiple numeric styles at once from a shared item name, color list, and SKU pattern (use `{style}`, `{color}`, and `{size}`). Existing styles are left unchanged; generated quantities start blank. **+ One style** still adds a single style for manual setup. To adapt the CSV headers, upload a sample CSV or enter the SKU and quantity column names. The sample is read locally; this app exports those two columns only and does not preserve extra columns or template formatting.

Use **Share this app** to share the current app link, and **Share CSV** in the export dialog to send the inventory file through a supported device share sheet. When file sharing is unavailable, the CSV downloads instead. The app link is useful to others only after the app is deployed to a URL they can access.

Use the **Returns** section to log returned quantities by SKU. Returns remain separate from sellable stock and exports until **Add back to stock** is selected. The matching catalog item cannot be removed while a return is pending.

    npm install
    npm run dev      # http://localhost:3000
    npm run build && npm start

Deploy: push to GitHub and import in Vercel (zero config).

- `lib/catalog.json` is the default/starting catalog (edits made in the UI are saved in the browser). It holds the exact seller SKU codes from the Myntra export (styles 1001-1018, `NY-` codes only).
  Format: `{ style: [[color, [[code, prefillQty] | null x5 for S,M,L,XL,XXL]]] }`. Add new styles/colors here.
- Data is stored in the browser (localStorage). To sync across devices, replace the two `useEffect` blocks in `app/page.jsx` with API/database calls.
- The UI lock also uses browser localStorage and does not restrict access to any connected spreadsheet.
- UI components are in `app/components/`: `InventoryOverview`, `InventoryList`, `StyleInventory`, `OtherInventory`, `ReturnsInventory`, `StyleRangeDialog`, `InventoryDialogs`, and shared styles/modal in `ui.jsx`. Numeric range creation is in `lib/style-range.mjs`.
