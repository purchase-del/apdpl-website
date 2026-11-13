# APDPL Website

The official static website for Aushad Pharma Distributors Pvt. Ltd.

- **Live website:** <https://www.apdpl.in>
- **Development source:** `site/`
- **GitHub Pages deployment copy:** `docs/`
- **Publishing configuration:** GitHub Pages serves the `main` branch's `/docs` directory.

## Project layout

- `site/` contains the development homepage and the assets it references.
- `docs/` contains the byte-synchronized homepage and its deployment-local assets, plus the active `CNAME`.
- `dump/` is reserved for confirmed unused or duplicate files under their former relative paths. No files are currently archived.
- `PROJECT-STRUCTURE.md` inventories the current files, their roles, and the rationale for keeping or archiving them.

Website assets are kept alongside each website copy in `site/assets/` and `docs/assets/`. This deliberate duplication keeps relative URLs valid both during source development and on GitHub Pages, which publishes only `docs/`.

## Development and deployment

Edit `site/index.html` and keep it synchronized with `docs/index.html`. Keep each copy's required assets under its respective `assets/` directory. Before publishing, verify that both homepage files are byte-identical, check all local references, and run `git diff --check`.

GitHub Pages is configured in repository settings to publish `main` from `/docs`; there is currently no checked-in Pages workflow or build step. A push to `main` triggers the configured Pages deployment. Do not change the Pages source, custom domain, or DNS as part of routine site edits.

## Contact form and admin prototype

The homepage contains the current Google Apps Script enquiry integration. Preserve its URL-encoded POST behavior and existing validation when editing the form. Do not submit a real enquiry as a deployment check.

The hidden admin login and dashboard under `assets/admin/` are local-facing UI prototypes only. Client-side checks are not secure authentication and must not protect real data. A future Admin Studio should use a separately designed, server-backed authentication and authorization system, with content persistence and a reviewed publish/preview workflow. Do not put credentials, tokens, or secrets in this repository.

## Archive policy

Never permanently delete an old project file during cleanup. Move only files confirmed unused by active pages and tooling into `dump/`, retaining their original relative paths beneath a descriptive category. Preserve `docs/CNAME.local-backup` at its current path and contents; `docs/CNAME` remains the active GitHub Pages custom-domain file. Do not archive unknown or active files.

No empty future folders are created. Add `admin/`, `data/`, `scripts/`, or `config/` only when there is concrete, documented code or configuration to place there.
