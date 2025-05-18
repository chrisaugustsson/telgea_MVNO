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
│   │       └── normalizer/             # Merges features into final format
│   ├── shared/                         # Shared utilities and types
│   │   ├── types/                      # Shared type definitions
│   │   ├── utils/                      # Utility functions
│   │   └── errors/                     # Error handling classes
│   └── monitoring/                     # Health checks and monitoring
└── README.md
```

## Architecture Decisions

### Feature Modularity

Each provider has separate feature modules for different data types (SMS, data usage) which are then combined in a normalizer. This separation allows:

- Independent development and testing of conversion logic
- Clean boundaries between data types
- Easy extension to new features

### Cross-Feature Logic

The normalizer module is responsible for merging outputs from multiple features into a unified format. This approach:

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

# Build the project
npm run build
```

The project uses TypeScript with relative imports (e.g., '../../../shared/types') for module resolution rather than path aliases.

## Adding a New Provider

To add a new MVNO provider:

1. Create a new directory under `mvno_providers/`
2. Copy the structure of an existing provider as a template
3. Implement provider-specific converters for each feature
4. Create a new normalizer for the provider
5. Update the main exports in `index.ts`

## Notes on Transport/Infra Concerns

This module focuses purely on data transformation, not transport logic. Integration with HTTP clients, SOAP requests, or scheduling should be implemented in a separate layer.

## Health Checks

The `monitoring` directory contains health check implementations that can be used to verify the proper functioning of provider integrations.
