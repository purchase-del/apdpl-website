# APDPL Website Project Structure

## Deployment and source model

GitHub Pages publishes the `main` branch's `docs/` directory at <https://www.apdpl.in>. The repository setting is the deployment configuration; there is no checked-in GitHub Actions workflow or build pipeline. `site/` is the development copy. The two directories contain matching homepages and their own matching assets because Pages only publishes `docs/`, while development serves `site/` as its own root.

## Final tree

```text
apdpl-website/
├── docs/                                  # GitHub Pages publish root
│   ├── CNAME                              # Active custom domain: www.apdpl.in
│   ├── CNAME.local-backup                 # Preserved backup; not the active config
│   ├── index.html                         # Deployed homepage
│   └── assets/
│       ├── aushad-logo.png                # Logo referenced by deployed homepage
│       └── admin/
│           ├── admin-prototype.css        # Dynamically loaded by prototype JS
│           └── admin-prototype.js         # Hidden client-side admin UI prototype
├── site/                                  # Development source root
│   ├── index.html                         # Source homepage; matches docs/index.html
│   └── assets/
│       ├── aushad-logo.png                # Logo referenced by source homepage
│       └── admin/
│           ├── admin-prototype.css        # Source-local copy required by prototype
│           └── admin-prototype.js         # Source-local copy required by homepage
├── README.md
└── PROJECT-STRUCTURE.md
```

## File inventory and classification

The final tree has 12 files. Git status reflects the uncommitted cleanup: `tracked` files are unchanged, `modified` is an edited tracked file, `untracked` is a new path, and `deleted` refers to the tracked logo's former path. Git may recognize the logo move as a rename after staging; no files are staged by this task.

| Final relative path | Name / extension | Git status | References and deployment role | Classification; duplicate / obsolete status |
|---|---|---|---|---|
| `README.md` | `README.md` / `.md` | Modified | Project overview; not a runtime dependency | Active documentation; not duplicate or obsolete |
| `PROJECT-STRUCTURE.md` | `PROJECT-STRUCTURE.md` / `.md` | Untracked | Documents current files and architecture; not a runtime dependency | Active documentation; not duplicate or obsolete |
| `docs/index.html` | `index.html` / `.html` | Tracked | Pages homepage; references deployment-local logo and admin script | Required deployment file; intentionally mirrors source |
| `docs/assets/aushad-logo.png` | `aushad-logo.png` / `.png` | Tracked | Header and loader images from `docs/index.html` | Required deployment asset; byte-identical source copy is necessary |
| `docs/assets/admin/admin-prototype.js` | `admin-prototype.js` / `.js` | Tracked | Loaded by deployed HTML; derives the sibling stylesheet path | Required deployment asset; byte-identical source copy is necessary |
| `docs/assets/admin/admin-prototype.css` | `admin-prototype.css` / `.css` | Tracked | Dynamically loaded by the deployed admin prototype | Required deployment asset; byte-identical source copy is necessary |
| `docs/CNAME` | `CNAME` / no extension | Tracked | GitHub Pages custom-domain configuration | Required deployment configuration; retained unchanged |
| `docs/CNAME.local-backup` | `CNAME.local-backup` / `.local-backup` | Tracked | No page reference; Pages may serve it as a static file | Explicitly preserved duplicate backup; not archived or obsolete under the preservation rule |
| `site/index.html` | `index.html` / `.html` | Tracked | Development homepage; references source-local logo and admin script | Active source; intentionally mirrors deployment |
| `site/assets/aushad-logo.png` | `aushad-logo.png` / `.png` | Untracked at destination; moved from tracked `assets/aushad-logo.png` | Header and loader images from `site/index.html` | Required source asset; relocated unchanged, not obsolete |
| `site/assets/admin/admin-prototype.js` | `admin-prototype.js` / `.js` | Tracked | Loaded by source HTML; derives the sibling stylesheet path | Required source asset; byte-identical deployment copy is necessary |
| `site/assets/admin/admin-prototype.css` | `admin-prototype.css` / `.css` | Tracked | Dynamically loaded by the source admin prototype | Required source asset; byte-identical deployment copy is necessary |

Before cleanup, there were 11 project files and no untracked files. After adding this structure document and relocating the source logo, there are 12 files. No confirmed-unused files remain to archive, so no `dump/` directory was created. No other HTML pages, standalone stylesheets, fonts, media, data files, Python scripts, package/build manifests, temporary files, or GitHub workflow files were present outside `.git/`.

## Why the matching copies remain

- `site/index.html` and `docs/index.html` are intentionally byte-identical source and publish copies.
- Each page's relative logo and admin-script paths resolve inside its own root. GitHub Pages does not publish repository-root assets, so a single root-level asset copy would break deployment.
- The admin script derives the CSS URL from its own script URL. Keeping the JavaScript and stylesheet in each root preserves that behavior for both source and published pages.
- The source/deployment logo, JavaScript, and CSS copies have matching contents. They are operational copies, not safe-to-remove redundant files.

The root-level logo was confirmed byte-identical to the deployed logo. Inspection showed that the development homepage references `assets/aushad-logo.png` relative to `site/`; the logo had to be restored to `site/assets/aushad-logo.png` for that source reference to resolve. It was relocated, not archived or deleted.

## Asset and link checks

- Both homepage copies use only the local logo and admin JavaScript as file-valued HTML references; the prototype derives its sibling CSS path.
- Navigation links target IDs in the same page. Contact links use `tel:` and `mailto:` URLs. There are no separate font files or external CSS dependencies.
- The contact form's Apps Script endpoint and URL-encoded POST implementation remain in the homepage and were not changed during cleanup.
- The active `docs/CNAME` and preserved backup both contain `www.apdpl.in`; the backup is byte-preserved at its explicitly required path.

## Admin Studio direction

The existing code is only a browser-side prototype, not a CMS or secure authentication system. Keep it separate conceptually from a future Admin Studio. When that work is approved, document and build a real application with server-side identity/authorization, persisted content, validation, auditability, and a controlled preview/publish process. Create a root `admin/` application and any `data/`, `scripts/`, or `config/` folders only when they contain implemented, documented components. Never reuse the client-side prototype as a security boundary or store credentials in the repository.

## Archive policy and known limitation

When confirmed-unused files are identified in future, place them in `dump/` under a descriptive category while retaining their former relative path. Do not permanently delete archived files or move active/uncertain files based on names alone. `docs/CNAME.local-backup` is intentionally left in `docs/`; because Pages publishes that directory, it may also be served as a static file. Its contents are only the same public domain value as `docs/CNAME`, and it remains in place per the preservation instruction.
