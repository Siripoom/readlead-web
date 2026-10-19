# Bundled Noto fonts

These variable TrueType fonts are loaded with `next/font/local` so production
builds do not depend on Google Fonts responses or network access.

Sources (downloaded 2026-10-19):

- [Noto Sans](https://github.com/google/fonts/tree/main/ofl/notosans)
- [Noto Sans Thai](https://github.com/google/fonts/tree/main/ofl/notosansthai)
- [Noto Sans Mono](https://github.com/google/fonts/tree/main/ofl/notosansmono)

The upstream `[wdth,wght]` files are renamed for local imports without modifying
their contents. Each family's SIL Open Font License is included alongside it.
