<!-- BEGIN:nextjs-agent-rules -->
# Local Next.js guidance

Read the relevant guide in `node_modules/next/dist/docs/` before changing a
framework API or convention. Heed deprecation notices for the installed version.
<!-- END:nextjs-agent-rules -->

## AI Team pilot

- This repository is managed as `veli-frontend` by `../aiteam`.
- Preserve local changes and never stash, reset, commit, push, or deploy unless
  explicitly requested.
- Never read `.env`, credentials, tokens, private keys, or production data.
- Validate changes with `npm run lint`, `npm run test -- --run`, and
  `npm run build`.
- Implementation may edit this repository. QA must not edit source files, and
  review is read-only.

