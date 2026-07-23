# Git Workflow Detail

Use this reference for non-trivial git operations during LAH Stack missions. Load on demand from Gate 8 (Commit) or Gate 9 (PR & Merge).

## Working tree dirty before switching branches

Clean the working tree first:

```bash
# If modified files are generated artifacts (BIZX metadata, runs, data):
git stash push -m "description of dirty files"
# ... work on other branch ...
# Return and restore:
git stash pop
```

**Pitfall:** Don't forget the stash pop after returning to the original branch.

## Stash pop on wrong branch → files in "DU" state

If you stash, switch branches, and stash pop on a branch that never had those files, they appear as `DU` (Deleted/Unmerged).

**Fix:**
```bash
git rm --cached <files-in-DU>
```

## `gh pr merge` fails with stash or DU files

Error: `failed to run git: error: you need to resolve your current index first`

**Fix:** Clean the index first:
```bash
git stash drop          # if a stash is blocking
git rm --cached <file>  # if DU files are blocking
gh pr merge --squash --delete-branch
```

## Partial cherry-pick from a commit

When a commit contains both files to include and exclude:

```bash
# Apply only one file from a commit
git show <COMMIT> -- <path/to/file> | git apply
git add <path/to/file>
git commit -m "message"
```

## Multi-repo coordination

When a mission touches multiple repos (e.g. lah-stack-tools + lah-stack-biz-assets + cartelogic-v2):

1. Create branches with the **same name** in each repo
2. Commit each repo independently — commit messages reference the repo's scope
3. **Push all branches BEFORE** opening PRs
4. Open PRs — one per repo, title and scope specific to the repo
5. Verify each PR is `mergeable = true` before merging
6. **Merge in dependency order** — dependent repos first
7. After each merge, checkout master and pull on THAT repo before moving to the next

```bash
cd /home/deploy/lah-stack-repos/repo-a
git checkout -b ma-branche
git add <files-a>
git commit -m "feat: scope A"
git push origin ma-branche
gh pr create --base master --head ma-branche --title "Mission — scope A"

cd /home/deploy/lah-stack-repos/repo-b
git checkout -b ma-branche
git add <files-b>
git commit -m "feat: scope B"
git push origin ma-branche
gh pr create --base master --head ma-branche --title "Mission — scope B"

# Verify both mergeable
gh pr view <PR_A> --json mergeable,state
gh pr view <PR_B> --json mergeable,state

# Merge (any order if independent)
gh pr merge <PR_A> --merge
gh pr merge <PR_B> --merge
```

**Pitfall:** If branches have the same name but different commits, `git push` on the second repo may fail because the remote already has a branch with that name. Solution: push the first repo first, verify, then push the second. Or use different branch names.

## LOCAL_CI_VERIFIED_MERGE_POLICY_V1

When GitHub Actions is unavailable (down, quota exhausted):

```bash
# 1. Create, commit, push
git checkout -b feat/ma-mission
git add <files>
git commit -m "feat: description"
git push origin feat/ma-mission

# 2. Create PR
gh pr create --base main --head feat/ma-mission --title "..."

# 3. Merge locally via worktree (bypass missing GHA)
cd /tmp
rm -rf openclaw-main-merge 2>/dev/null
git worktree add /tmp/openclaw-main-merge main
cd /tmp/openclaw-main-merge
git merge --no-ff feat/ma-mission -m "chore: merge [LOCAL_CI_VERIFIED]"
git push origin main

# 4. Clean up
cd <repo>
git worktree remove /tmp/openclaw-main-merge
git fetch origin main
git checkout main
git merge --ff-only origin/main
```

The merge message must contain `[LOCAL_CI_VERIFIED]` to trace that validations were done locally.

**Rules:**
- Run `node --test` before every merge — verify all tests pass
- Run `git diff --check` — no whitespace errors
- Verify receipt JSONs are valid (`JSON.parse`)
- Produce a `LOCAL_CI_VERIFIED` receipt in `docs/operator/receipts/`
- Do NOT merge if tests fail

## Post-Push Verify (cartelogic-v2 direct push)

```bash
git status --short --branch                          # must be clean
git log --oneline origin/<branch>..HEAD              # must be empty (ahead=0)
git log --oneline HEAD..origin/<branch>              # must be empty (behind=0)
python3 -m v2.operational.cli verify                 # integrity still OK
```

## Post-Merge Verify

```bash
git checkout master
git pull origin master
git log --oneline -3
node --test
```

If the mission involves WordPress (draft posts): verify post status is unchanged:

```bash
source /home/deploy/.lah-secrets/wordpress-br26.env
curl -s --max-time 10 --user "$WP_APP_USERNAME:$WP_APP_PASSWORD" \
  "https://liveaccesshub.com/wp-json/wp/v2/posts/<POST_ID>" | python3 -c "
import sys,json; d=json.load(sys.stdin)
assert d.get('status')=='draft', f'Post {POST_ID} status changed: {d.get(\"status\")}'
assert d.get('status')!='publish', f'Post {POST_ID} was published!'
print(f'Post {POST_ID} OK: status=draft, not public, modified={d.get(\"modified\")}')
"
```
