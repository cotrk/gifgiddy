<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep generated reactions and custom portrait settings in versioned browser storage because the prank experience is intentionally account-free and client-owned.
- Render shared navigation in the root layout and canonicalize prank links to `/`; the Feed cannot display shared prank query data.
- The persona page reads the same local prank history as the Feed and stores editable bio/socials in versioned browser storage; one source keeps both views consistent without accounts.
- Keep dance searches and no-repeat selection in a shared browser-safe module, persist all used URLs separately from the capped Feed, and stop at pool exhaustion until more clips load; resets and reloads must not silently replay a clip.
- New prank entries carry an optional ISO timestamp and older entries derive their date from their existing ID; the timeline stays compatible with saved pranks.
