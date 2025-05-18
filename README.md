# Telgea MVNO Integration

A TypeScript module for integrating MVNO (Mobile Virtual Network Operator) providers with Telgea's internal API normalizer.

## Project Structure

```
/mvno-telgea-integration/
├── src/
│   ├── mvno_providers/                 # Container for all MVNO providers
│   │   └── provider_abc/               # First provider implementation
│   │       ├── sms_charge/             # SMS charge converter feature
│   │       ├── data_usage/             # Data usage converter feature
│   │       └── integration/            # Merges features into final format
│   └── shared/                         # Shared utilities and types
│       ├── types/                      # Shared type definitions
│       ├── utils/                      # Utility functions
│       └── errors/                     # Error handling classes
└── README.md
```

## Architecture Decisions

### Feature Modularity

Each provider has separate feature modules for different data types (SMS, data usage) which are then combined in a normalizer. This separation allows:

- Independent development and testing of conversion logic
- Clean boundaries between data types
- Easy extension to new features

### Cross-Feature Logic

The interation module is responsible for merging outputs from multiple features into a unified format. This approach:

- Keeps feature extraction separate from output orchestration
- Facilitates testing each component independently
- Makes it easier to add new features later

### Error Handling

The project implements comprehensive error handling:

- Custom error classes with appropriate context and error codes
- Clear error messages with detailed information

### Monorepo & Microservice Compatibility

The architecture is designed to work in both monorepo and microservice environments:

- Clean module boundaries and explicit exports
- Transport-agnostic business logic
- Shared utilities that could be extracted as separate packages

### Testing Strategy

Each component includes its own tests and test data:

- Feature-specific test directories with `__tests__` folders
- Test data located close to the tests that use them
- Isolated tests for converters and normalizers
- All tests co-located with their respective modules

## Getting Started

```bash
# Install dependencies
npm install

# Run tests
npm test

# Lint the project
npm run lint
```


## Packages used
The project uses neverthrow for error handling and zod for schema validation. Neverthrow makes sure that errors are handled consistently and zod provides a powerful schema validation library.

Eslint is used for linting and formatting. Eslint is configured to use the recommended rules from the eslint-plugin-js package. Eslint is also configured to use the recommended rules from the typescript-eslint package.

## Assumptions

It is assumed that there will be seperate API calls to for data usage and SMS charges. The integration module will handle the merging of these features into a unified format. 

Each SMS charge contains user ID and phone number and it is assumed that these will safe to trust. Depending on how data fetching is performed there might be necessary to verify each SMS charge that they actually belong to the combination of user ID and phone number that is requested.

## Full integration
A full integration would include adapters in both the sms_charge and the data_usage for data fetching from the provider. These adapters would handle authentication, error handling, and retries where necessary.

The integration module is the coordinator, where the results from the provider are combined into a normalized internal data format. This module can then expose the result via an API route (e.g., with an Express router), or be triggered by a cron job if the data is meant to be pulled on a schedule.

To support persistence, the integration should include a storage mechanism—this could be a simple database layer or repository class within the integration module (or in a shared storage/ directory). This layer would allow writing normalized data to a database for historical lookup, reporting, or downstream processing.

The design allows flexibility: the integration can be consumed by internal systems via HTTP, event queues, or scheduled jobs, depending on Telgea's architecture.
