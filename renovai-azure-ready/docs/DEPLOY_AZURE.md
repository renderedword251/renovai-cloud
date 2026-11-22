# RenovAI Azure deployment

Configuration:
- Azure subscription: Azure subscription 1
- GitHub: https://github.com/renderedword251/renovai-cloud.git
- Resource group: renovai-rg
- Region: eastus2
- Domain: Azure-generated azurestaticapps.net URL

## Upload source to GitHub
Open PowerShell in this extracted folder:

```powershell
git init -b main
git add .
git commit -m "Initial RenovAI Azure deployment"
git remote add origin https://github.com/renderedword251/renovai-cloud.git
git push -u origin main
```

Never commit API keys, passwords, Azure deployment tokens, or connection strings.

## Select Azure subscription

```powershell
az login
az account set --subscription "Azure subscription 1"
az account show --query "{name:name,id:id}" --output table
```

## Resource group

```powershell
az group create --name renovai-rg --location eastus2
```

## Deploy Static Web App resource with Bicep

```powershell
az deployment group create --resource-group renovai-rg --template-file infra/main.bicep
```

## Get the generated URL

```powershell
az staticwebapp list --resource-group renovai-rg --query "[].{Name:name,Host:defaultHostname}" --output table
```

Open `https://<Host>` in your browser.

## GitHub deployment token
In the Azure portal open the Static Web App and obtain its deployment token. Add it to the GitHub repository as an Actions secret named `AZURE_STATIC_WEB_APPS_API_TOKEN`. Do not commit the token.

Push to `main` to trigger `.github/workflows/azure-static-web-apps.yml`.

## Verify
After GitHub Actions succeeds, open `/api/health`. It should return JSON containing `"status":"ok"`.

## Projects API
The authenticated dashboard uses `GET /api/projects` to list the signed-in user's projects and `POST /api/projects` to create one. Project ownership is taken from the Static Web Apps `x-ms-client-principal` header, not from client-supplied owner IDs.

The current API stores projects in process memory for MVP contract validation only. Data can disappear when a Functions worker restarts and may not be shared across scaled-out workers. Do not rely on this storage for real projects; connect the API to durable storage such as Cosmos DB before production use.

## Later phases
Replace in-memory project storage with durable persistence, then add Azure OpenAI, Blob Storage, invitations, collaboration, interactive blueprint editing, and cost estimation.
