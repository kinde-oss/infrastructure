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

`idTokenCustomClaims` - Returns mutatable ID token object

`accessCustomClaims` - Returns mutatable access token object

`m2mCustomClaims` - Returns mutatable M2M token object

### Workflow Event

```js
{
    request: {
        ipAddress // IP address of where the workflow was triggered from
    };
    context: {
        workflowTrigger // This is the type of the trigger
        clientId // this will contain the source application ID the workflow was triggered from
        orgCode // Organisation code the user is logging into
        userId // this is the user ID e.g. kp_XXXX 
        clientId // client id of the origin
    }
};
```

### Example

```ts
import { onUserTokenGeneratedEvent, getKindeAccessTokenHandle, WorkflowSettings, WorkflowTrigger } from "@kinde/infrastructure"

export const workflowSettings: WorkflowSettings = {
  id: "addAccessTokenClaim",
  trigger: WorkflowTrigger.UserTokenGeneration,
};
  
export default {
  async handle(event: onUserTokenGeneratedEvent) {
    const accessToken = accessCustomClaims<{ hello: string; ipAddress: string}>();
    accessToken.hello = "Hello there!";
    accessToken.ipAddress = event.request.ipAddress
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
