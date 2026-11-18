targetScope = 'resourceGroup'
param baseName string = 'renovai'
param location string = resourceGroup().location
var uniqueName = toLower('${baseName}-${uniqueString(resourceGroup().id)}')
resource swa 'Microsoft.Web/staticSites@2023-12-01' = {
  name: uniqueName
  location: 'eastus2'
  sku: { name: 'Free', tier: 'Free' }
  properties: { buildProperties: { appLocation: 'web', apiLocation: 'api', outputLocation: 'dist' } }
}
output staticWebAppName string = swa.name
output defaultHostname string = swa.properties.defaultHostname
