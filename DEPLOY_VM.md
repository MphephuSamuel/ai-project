## Deploy on VM — prerequisites and manual test

This repository contains a GitHub Actions workflow (`.github/workflows/deploy.yml`) which, on `push` to `main`, will:

- checkout the repo in the Action runner
- SSH to the target VM using the `VM_SSH_KEY`, `VM_USER`, and `VM_HOST` secrets
- on the VM: `cd ~/IBM-Z-Datathon && git fetch --all && git reset --hard origin/main`
- then `cd frontend` and install dependencies and run the frontend build (`npm ci` / `npm install` + `npm run build`)

What this produces
- The Vite build will output the static files into `frontend/dist` (default Vite output directory). Those built files will live inside `~/IBM-Z-Datathon/frontend/dist` on the VM after the workflow runs.

VM prerequisites
- A Linux shell (bash/sh) accessible via SSH for the `VM_USER` account.
- Git installed and available in PATH.
- Node.js (recommended LTS, e.g. >=16) and npm installed and available in PATH.
- Sufficient permissions for `VM_USER` to write to `~/IBM-Z-Datathon` and run `npm` commands.

Required GitHub secrets (set in repository Settings → Secrets):
- `VM_SSH_KEY` — private SSH key (PEM) for the `VM_USER` that is allowed to connect.
- `VM_USER` — username on the VM.
- `VM_HOST` — host or IP address of the VM.

Manual test and troubleshooting

1. From your local machine (or the VM) you can run the same commands to confirm the build works:

```powershell
ssh -i C:\path\to\private_key ${VM_USER}@${VM_HOST} ;
# or without -i if your key is already loaded in ssh-agent:
ssh ${VM_USER}@${VM_HOST}
# once on the VM
cd ~/IBM-Z-Datathon/frontend
npm ci    # or npm install if you prefer
NODE_ENV=production npm run build
```

2. If the build fails in the Action but works locally on your machine, check:
- Node / npm versions on the VM match what you use locally.
- That the `VM_USER` has file system permissions in the repo folder.
- The VM has network access to fetch npm packages.

Notes
- The workflow uses `git reset --hard origin/main` to ensure the VM's working copy matches `origin/main`. This will discard uncommitted changes on the VM.
- If you prefer, you can modify the workflow to create a timestamped backup branch on the VM before resetting.

If you'd like, I can also add a small systemd or nginx example showing how to serve the static `frontend/dist` directory from the VM.
