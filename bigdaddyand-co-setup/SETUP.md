# bigdaddyand.co — GitHub Pages custom domain setup

## 1. The CNAME file  (DONE)
- Already placed at the band repo root: `Big-Daddy/big-daddy-216/CNAME`,
  containing one line: `bigdaddyand.co`
- Still needs to be committed + pushed to `main` (the branch Pages deploys from).
- GitHub also writes this file automatically when you set the custom domain in
  Settings -> Pages (step 3); having it in the repo just makes it stick across rebuilds.

## 2. DNS at Namecheap  (Domain List -> Manage -> Advanced DNS)
First delete the two default records Namecheap adds:
- CNAME  `www`  ->  `parkingpage.namecheap.com.`
- URL Redirect  `@`  ->  `http://www.bigdaddyand.co/`

Then add:

| Type  | Host | Value               | TTL       |
|-------|------|---------------------|-----------|
| A     | @    | 185.199.108.153     | Automatic |
| A     | @    | 185.199.109.153     | Automatic |
| A     | @    | 185.199.110.153     | Automatic |
| A     | @    | 185.199.111.153     | Automatic |
| CNAME | www  | big-daddy-216.github.io.  | Automatic |

Optional IPv6 — four AAAA records on Host `@`:
`2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`

> The `www` value is `big-daddy-216.github.io.` because the band repo lives under the
> separate **`big-daddy-216`** GitHub account (repo `big-daddy-216/big-daddy-216`).
> The four A records are the same as any other GitHub Pages site.

## 3. GitHub
1. Band repo -> Settings -> Pages.
2. Source = Deploy from a branch, branch `main` / root.
3. Custom domain -> `bigdaddyand.co` -> Save.
4. Wait for the green check, then tick **Enforce HTTPS**.

## 4. Verify
Both https://bigdaddyand.co and https://www.bigdaddyand.co should load with a valid lock.

---
You can delete this `bigdaddyand-co-setup` folder once the CNAME file is moved into the band repo.
