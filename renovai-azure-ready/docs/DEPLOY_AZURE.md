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

## Later phases
Add Azure OpenAI, project persistence, Blob Storage, invitations, collaboration, interactive blueprint editing, and cost estimation after the free web deployment is confirmed working.
