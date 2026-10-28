# Deploy ReadLead on EasyPanel

## Access

| Item | Value |
| --- | --- |
| EasyPanel | http://187.127.103.82:3000/ |
| EasyPanel account | admin@fengshui.com |
| Project | `readlead` |
| Web service | `readlead-web` |
| Backoffice service | `readlead-backoffice` |
| PostgreSQL service | `readlead-db` |
| Website | https://readlead.co.th/ |
| Backoffice | https://readlead-readlead-backoffice.cqejbz.easypanel.host/ |
| Web deployments | http://187.127.103.82:3000/projects/readlead/app/readlead-web/deployments |
| Backoffice deployments | http://187.127.103.82:3000/projects/readlead/app/readlead-backoffice/deployments |

Use the existing EasyPanel session in the user's Chrome browser when available. The user selected the EasyPanel service Terminal for production commands. SSH access has not been configured for this workflow. Passwords, session cookies, deployment tokens, and database credentials are not stored in this repository. If the browser session has expired, sign in using credentials supplied by the user.

## Deploy a change

1. Run the relevant checks in the changed repository.
2. Commit and push the change to `origin/main`.
3. Open the matching service's deployments page in EasyPanel.
4. Select **ปรับใช้** to deploy the latest source.
5. Open the deployment log with **ดู**. Confirm that its commit matches the pushed change and that the log ends with `Success`.
6. Wait for the new service to start. Check its public URL and the changed feature in the browser.

Web-only changes require deploying `readlead-web`. Deploy `readlead-backoffice` when its code changes. Production deployment requires user authorization for the current task.

## Open a service Terminal

Select the service, open **Console**, select its current container, and choose **Sh**. Application files are in `/app`. Use the environment variables already configured on that service. Do not print environment variables or credentials to inspect the connection.

## Homepage preview seed

The backoffice image includes `/app/scripts/seed-home-design.mjs` and its bundled data. The seed was applied on 2026-10-28 with 24 works and 49 CMS items. Do not rerun it as a routine deployment step, because it replaces the enabled items in the six homepage design sections.

When the user requests seeding, deploy the corresponding web assets and backoffice script first. Run a dry-run in the backoffice Terminal:

```sh
node /app/scripts/seed-home-design.mjs --production --web-origin https://readlead.co.th
```

After the dry-run succeeds, apply the requested seed:

```sh
node /app/scripts/seed-home-design.mjs --production --web-origin https://readlead.co.th --apply
```

The script prints the backup path under `/app/.seed-backups`. Copy required backups outside the container before replacing it. Check the public CMS response at https://readlead-readlead-backoffice.cqejbz.easypanel.host/api/public/cms/home and the rendered homepage after applying the seed.
