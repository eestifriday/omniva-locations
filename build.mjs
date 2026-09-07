name: Omniva asukohad

on:
  schedule:
    - cron: '30 4 * * *'   # iga päev 04:30 UTC (07:30 Eesti suveajal)
  workflow_dispatch:

permissions:
  contents: write
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  build-deploy:
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: node build.mjs
      - name: Commit muudatused
        run: |
          git config user.name "omniva-bot"
          git config user.email "bot@users.noreply.github.com"
          git add omniva-ee.js omniva-ee.json
          git diff --cached --quiet || git commit -m "Omniva $(date -u +%F)"
          git push
      - name: Failid Pages'i kausta
        run: mkdir -p site && cp omniva-ee.js omniva-ee.json site/
      - uses: actions/upload-pages-artifact@v3
        with:
          path: site
      - id: deployment
        uses: actions/deploy-pages@v4
