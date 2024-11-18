# Kinde Infrastructure

## Description

Types and methods to work with Kinde Infrastructure features

## Installation

```bash
# npm
npm install @kinde/infrastructure
# yarn
yarn add @kinde/infrastructure
# pnpm
pnpm install @kinde/infrastructure
```

## Usage

### Methods

`idTokenCustomClaims` - Define and set custom claims on the id token

`accessCustomClaims` - Define and set custom claims on the access token

`m2mCustomClaims` - Define and set custom claims on the m2m token

`denyAccess` - Deny access to your application

`fetch` - Sent a request to external API

`getEnvironmentVariable` - Get Environment variable from Kinde secrets

`createKindeAPI` - Create handler to call the Kinde management SDK

### Workflow Event

#### User token generation

```json
{
  "request": {
    "ip": "1.2.3.4",
    "auth": {
      "audience": ["https://api.example.com/v1"]
    }
  },
  "context": {
    "auth": {
      "origin": "refresh_token_request",
      "connectionId": "conn_0192b...",
      "isExistingSession": false
    },
    "user": {
      "id": "kp_6a071...",
      "identityId": "identity_0192c..."
    },
    "domains": {
      "kindeDomain": "https://mykindebusiness.kinde.com"
    },
    "workflow": {
      "trigger": "user:tokens_generation"
    },
    "application": {
      "clientId": "f77dbc..."
    },
    "organization": {
      "code": "org_b5a9c8..."
    }
  }
}
```

#### M2M token generation

```json
{
  "request": {
    "ip": "1.2.3.4",
    "auth": {
      "audience": ["https://api.example.com/v1"]
    }
  },
  "context": {
    "domains": {
      "kindeDomain": "https://mykindebusiness.kinde.com"
    },
    "workflow": {
      "trigger": "m2m:tokens_generation"
    },
    "application": {
      "clientId": "f77dbc..."
    }
  }
}
```

### Examples

#### Customise tokens

##### Required bindings

```
kinde.accessToken
```

```ts
import {
  onUserTokenGeneratedEvent,
  getKindeAccessTokenHandle,
  WorkflowSettings,
  WorkflowTrigger,
} from "@kinde/infrastructure";

export const workflowSettings: WorkflowSettings = {
  id: "addAccessTokenClaim",
  trigger: WorkflowTrigger.UserTokenGeneration,
  bindings: {
    "kinde.accessToken": {},
  },
};

export default {
  async handle(event: onUserTokenGeneratedEvent) {
    const accessToken = accessTokenCustomClaims<{
      hello: string;
      ip: string;
    }>();

    accessToken.hello = "Hello there!";
    accessToken.ipAddress = event.request.ip;
  },
};
```

This will result with two new extra claims added to the AccessToken

```json
{
  "hello": "Hello there!",
  "ipAddress": "1.2.3.4"
}
```

#### Deny access to application

This example will prevent login from anyone accessing with an IP address starting with `192`

##### Required bindings

```
kinde.accessToken
```

```typescript
async handle(event: onUserTokenGeneratedEvent) {
  if (accessToken.ipAddress.startsWith('192')) {
    denyAccess("You are not allowed to access this resource");
  }
},
```

#### Call an external API

This example will get the api token from the Kinde environment variables and call an API to get the timezone for the IP address and add it to the ID token

##### Required bindings

```
kinde.ipToken
kinde.fetch
url
kinde.env
```

```typescript
async handle(event: onUserTokenGeneratedEvent) {
  const ipInfoToken = getEnvironmentVariable('IP_INFO_TOKEN')?.value

  const { data: ipDetails } = await fetch(`https://ipinfo.io/${event.request.ip}?token=${ipInfoToken}`, {
    method: "GET",
    responseFormat: 'json',
    headers: new Headers({
      "Content-Type": "application/json",
    })
  });

  const idToken = idTokenCustomClaims<
    {
      timezone: string;
    }
  >();

  idToken.timezone = ipDetails.timezone;
},
```

#### Kinde Management API

In order to use the Kinde management API you will need to first configure an application within Kinde and grant it access to the Kinde Management API with the desired scopes.

By default the `createKindeAPI` method initially look up the following environment variables setup in Kinde settings to determine the application to use.

- `KINDE_WF_M2M_CLIENT_ID`
- `KINDE_WF_M2M_CLIENT_SECRET` - Ensure this is setup with sensitive flag enabled to prevent accidental sharing

`createKindeAPI` can also accept an additional parameter which can contain clientID/clientSecret or clientIDKey/clientSecretKey which can define the environment variables to lookup

The example below will read the users permissions and add them to the accessToken

##### Required bindings

```
kinde.accessToken
kinde.fetch
url
kinde.env
```

```typescript
async handle(event: onUserTokenGeneratedEvent) {
  const orgCode = event.context.organization.code;
  const userId = event.context.user.id;

  const kindeAPI = await createKindeAPI(event);

  const { data: res } = await kindeAPI.get(
    `organizations/${orgCode}/users/${userId}/permissions`
  );

  const accessToken = accessTokenCustomClaims<{ hello: string; settings: string; permissions: []}>();
  accessToken.hello = "Hello there!";
  accessToken.settings = settings.output
  accessToken.permissions = res.permissions
},
```

> [!WARNING]
> Some claims are prohibited to be updated from a workflow. (see [Prohibited Claims](/lib/prohibitedClaims.ts))
>
> No sensitive data should be added to tokens as these can be accessed publically

## Kinde documentation

[Kinde Documentation](https://kinde.com/docs/) - Explore the Kinde docs

## Contributing

If you'd like to contribute to this project, please follow these steps:

1. Fork the repository.
2. Create a new branch.
3. Make your changes.
4. Submit a pull request.

## License

By contributing to Kinde, you agree that your contributions will be licensed under its MIT License.
