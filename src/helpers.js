const config = {
  url: 'http://localhost:3000', // your url
  flux_url: 'https://flux.io', // flux url
  flux_client_id: '27789270-3db1-43da-800d-b3317b1fcd56', // your app's client id
}

const sdk = new window.FluxSdk(config.flux_client_id, { redirectUri: config.url, fluxUrl: config.flux_url })

export const helpers = new window.FluxHelpers(sdk)
