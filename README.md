# Credit Approval Sheet — Fillable Web Form

A blank, reusable Credit Approval Sheet. Every section is a table:
the left-hand labels (Field, Designation, etc.) are static and
locked; the space beside each one is blank for whoever fills the
form. Any section can have extra columns or rows added on the fly.

## Structure

```
credit-approval-site/
├── index.html          — page shell, loads the css/js below
├── css/
│   └── styles.css       — all visual styling
├── js/
│   ├── data.js           — the sections/fields themselves (edit this to add/rename sections)
│   ├── table-engine.js   — the reusable dynamic-table component (add/remove column & row)
│   └── app.js             — builds the page from data.js, handles save/export/PDF
└── README.md
```

No build step, no framework, no server-side code — plain HTML/CSS/JS.

## Running it locally

Just double-click `index.html`, or open it from a browser's File
menu. Everything works offline once loaded (PDF export needs
internet the first time, to fetch the html2pdf.js library from its
CDN).

## Hosting it so people can use it from anywhere

Since there's no backend, this is a **static site** — any static
host works. A few free/simple options:

- **Netlify Drop** — go to https://app.netlify.com/drop and drag the
  whole `credit-approval-site` folder onto the page. You get a live
  URL in seconds, no account required for a quick test link.
- **GitHub Pages** — push this folder to a GitHub repo, then enable
  Pages in the repo settings (Settings → Pages → deploy from branch).
- **Vercel** — `vercel` CLI or drag-and-drop on vercel.com, same idea
  as Netlify.
- **Your own web server / cPanel** — upload the folder via FTP/File
  Manager into your site's public folder; it'll work as-is.

## How data is saved

There's no shared backend or database — each person's entries
autosave only in their own browser (localStorage). Use:
- **Download PDF** — generates a PDF of the filled form, entirely in
  the browser (via html2pdf.js).
- **Export data (.json)** — saves a small file with everything typed
  in, in case someone wants to back it up or continue later on a
  different device/browser (use **Import data** to load it back in).
- **Clear form** — wipes the current browser's saved entries and
  starts fresh.

## Extending it

To add, rename, or remove a section (or its default fields),
edit `js/data.js` — the tables, headers, and rows are all generated
from that file. `table-engine.js` shouldn't need to change for
normal edits.
# credit-approval
