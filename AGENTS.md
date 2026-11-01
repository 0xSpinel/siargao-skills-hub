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
# AGENTS
- Job posts live in public.job_posts; browsing is public, while posting requires an authenticated owner and valid profile — prevents anonymous posting while preserving community access.
- Account validation is shared by the account forms and mirrored in database profile validation; passwords are never scored as nonsense — protects signup without weakening secure passwords.
- A single root AccountProvider owns session transitions; protected posting lives under the integration-managed authenticated layout — keeps navigation and sign-out consistent.
- Service offers live separately in public.service_offers with public browsing and profile-validated owner writes; directory and offering pages reuse the community navigation — keeps offers distinct from task requests and prevents anonymous posting.
