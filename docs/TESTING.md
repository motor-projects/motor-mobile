# Testing Guide

This document provides comprehensive information about the testing strategy, setup, and best practices for the Motorcycle Mobile application.

## Table of Contents

- [Overview](#overview)
- [Testing Strategy](#testing-strategy)
- [Test Types](#test-types)
- [Getting Started](#getting-started)
- [Writing Tests](#writing-tests)
- [Running Tests](#running-tests)
- [CI/CD Integration](#cicd-integration)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

Our testing strategy ensures high-quality, reliable code through comprehensive test coverage across multiple layers:

- **Unit Tests**: Test individual functions, components, and modules
- **Integration Tests**: Test component interactions and API integrations  
- **E2E Tests**: Test complete user workflows across the entire application
- **Performance Tests**: Monitor app performance, memory usage, and bundle size

### Testing Stack

- **Framework**: Jest + React Native Testing Library
- **E2E Testing**: Detox
- **API Mocking**: MSW (Mock Service Worker)
- **Performance**: Custom performance testing scripts + Lighthouse CI
- **Coverage**: Istanbul + Codecov
- **CI/CD**: GitHub Actions

## Testing Strategy

### Test Pyramid

```
        /\
       /  \
      / E2E \     <- Few, expensive, slow (10%)
     /______\
    /        \
   /Integration\ <- More, moderate cost (20%)
  /__________\
 /            \
/     Unit     \ <- Many, cheap, fast (70%)
/______________\
```

### Coverage Goals

- **Overall**: 80%+ code coverage
- **Unit Tests**: 85%+ coverage
- **Integration Tests**: 75%+ coverage
- **Critical Paths**: 95%+ coverage

## Test Types

### Unit Tests

Test individual components, functions, and modules in isolation.

**Location**: `src/**/__tests__/**/*.test.{ts,tsx}`

**Examples**:
- Component rendering and props
- Redux actions and reducers
- Utility functions
- API service functions

### Integration Tests

Test interactions between multiple components or modules.

**Location**: `src/__tests__/integration/**/*.test.{ts,tsx}`

**Examples**:
- Component + Redux integration
- API service + Redux integration
- Navigation flow testing
- Form submission workflows

### E2E Tests

Test complete user journeys across the entire application.

**Location**: `e2e/**/*.test.ts`

**Examples**:
- User registration and login
- Motorcycle search and filtering
- Adding motorcycles to favorites
- Complete purchase workflows

### Performance Tests

Monitor and validate app performance metrics.

**Location**: `scripts/performance-test.js`

**Metrics**:
- Bundle size analysis
- App startup time
- Memory usage
- Rendering performance

## Getting Started

### Prerequisites

1. Node.js 18+ installed
2. React Native development environment set up
3. iOS Simulator (for iOS testing)
4. Android Emulator (for Android testing)

### Installation

```bash
# Install dependencies
npm install

# Install iOS dependencies (macOS only)
cd ios && bundle install && bundle exec pod install && cd ..

# Install Detox CLI globally
npm install -g detox-cli
```

### Initial Setup

```bash
# Run initial test to verify setup
npm test

# Build E2E test app (iOS)
npm run test:e2e:build -- ios.sim.debug

# Build E2E test app (Android)
npm run test:e2e:build -- android.emu.debug
```

## Writing Tests

### Unit Test Structure

```typescript
import React from 'react'
import { render, fireEvent } from '../utils/testUtils'
import { createMockMotorcycle } from '../utils/testUtils'
import MotorcycleCard from '../../components/MotorcycleCard'

describe('MotorcycleCard Component', () => {
  const mockMotorcycle = createMockMotorcycle()
  const mockOnPress = jest.fn()

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Rendering', () => {
    it('should render motorcycle information', () => {
      const { getByText } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress} 
        />
      )

      expect(getByText(mockMotorcycle.brand)).toBeTruthy()
      expect(getByText(mockMotorcycle.model)).toBeTruthy()
    })
  })

  describe('Interactions', () => {
    it('should call onPress when tapped', () => {
      const { getByText } = render(
        <MotorcycleCard 
          motorcycle={mockMotorcycle} 
          onPress={mockOnPress} 
        />
      )

      fireEvent.press(getByText(mockMotorcycle.model))
      expect(mockOnPress).toHaveBeenCalledWith(mockMotorcycle)
    })
  })
})
```

### Integration Test Structure

```typescript
import { render, fireEvent, waitFor } from '../utils/testUtils'
import HomeScreen from '../../screens/tabs/HomeScreen'

describe('HomeScreen Integration', () => {
  it('should load and display motorcycles', async () => {
    const { getByText, getByTestId } = render(<HomeScreen />, {
      preloadedState: {
        motorcycles: {
          trending: mockMotorcycles,
          latest: mockMotorcycles,
          isLoading: false,
        }
      }
    })

    await waitFor(() => {
      expect(getByTestId('trending-section')).toBeTruthy()
    })

    expect(getByText('Honda CBR1000RR')).toBeTruthy()
  })
})
```

### E2E Test Structure

```typescript
import { device, element, by, expect as detoxExpect } from 'detox'

describe('Home Flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  beforeEach(async () => {
    await device.reloadReactNative()
  })

  it('should navigate to motorcycle detail', async () => {
    await element(by.id('motorcycle-card-0')).tap()
    
    await detoxExpect(element(by.id('motorcycle-detail-screen')))
      .toBeVisible()
  })
})
```

### Test Utilities

We provide several utilities to make testing easier:

```typescript
// Mock factories
const mockMotorcycle = createMockMotorcycle({
  brand: 'Honda',
  model: 'CBR1000RR'
})

// Redux test store
const { getByText } = render(<Component />, {
  preloadedState: {
    auth: { isAuthenticated: true }
  }
})

// Async utilities
await waitForLoadingToFinish()
```

## Running Tests

### Unit Tests

```bash
# Run all unit tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test MotorcycleCard.test.tsx

# Run tests matching pattern
npm test -- --testNamePattern="should render"
```

### Integration Tests

```bash
# Run integration tests
npm run test:integration

# Run with coverage
npm run test:integration -- --coverage
```

### E2E Tests

```bash
# iOS E2E tests
npm run test:e2e:build -- ios.sim.debug
npm run test:e2e -- --configuration ios.sim.debug

# Android E2E tests  
npm run test:e2e:build -- android.emu.debug
npm run test:e2e -- --configuration android.emu.debug

# Run specific E2E test
npm run test:e2e -- --testNamePattern="Home Flow"
```

### Performance Tests

```bash
# Run performance analysis
npm run test:performance

# Run performance tests
node scripts/performance-test.js
```

### All Tests

```bash
# Run complete test suite
npm run test:all

# Run tests for CI
npm run test:ci
```

## CI/CD Integration

### GitHub Actions

Our CI/CD pipeline runs automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`

**Pipeline Stages**:

1. **Lint & Type Check**: ESLint + TypeScript validation
2. **Unit Tests**: Jest unit tests with coverage
3. **Integration Tests**: Integration tests with MongoDB
4. **E2E Tests**: Detox tests on iOS/Android simulators
5. **Performance Tests**: Bundle size and performance analysis
6. **Security Scan**: Dependency audit + CodeQL
7. **Build Validation**: Test app builds

### Coverage Reports

Coverage reports are automatically:
- Generated after each test run
- Uploaded to Codecov
- Displayed in pull request comments
- Failed if below threshold (80%)

### Artifacts

Test artifacts are preserved for 30 days:
- Coverage reports
- Test results (JUnit XML)
- E2E screenshots and videos
- Performance reports

## Best Practices

### General

1. **AAA Pattern**: Arrange, Act, Assert
2. **Descriptive Names**: Test names should describe behavior
3. **Single Responsibility**: One assertion per test when possible
4. **Independent Tests**: Tests should not depend on each other
5. **Clean State**: Reset state between tests

### Unit Tests

1. **Mock External Dependencies**: API calls, navigation, third-party libraries
2. **Test Behavior, Not Implementation**: Focus on outputs, not internal logic
3. **Use Test Utilities**: Leverage provided mock factories
4. **Cover Edge Cases**: Test error states and boundary conditions

```typescript
// ✅ Good - tests behavior
it('should show error message when login fails', async () => {
  const { getByText, getByTestId } = render(<LoginScreen />)
  
  fireEvent.press(getByTestId('login-button'))
  
  await waitFor(() => {
    expect(getByText('Invalid credentials')).toBeTruthy()
  })
})

// ❌ Bad - tests implementation details
it('should call setError with message', () => {
  const setError = jest.fn()
  // Testing internal state management instead of user-visible behavior
})
```

### Integration Tests

1. **Test Real User Scenarios**: Focus on complete workflows
2. **Use Realistic Test Data**: Don't over-simplify test scenarios
3. **Test Error Handling**: Network failures, validation errors
4. **Mock External Services**: APIs, third-party integrations

### E2E Tests

1. **Test Happy Paths**: Focus on critical user journeys
2. **Be Patient**: Use proper waits and timeouts
3. **Stable Selectors**: Use testID over text or complex selectors
4. **Clean State**: Reset app state between tests
5. **Minimize Test Data**: Use minimal data needed for tests

```typescript
// ✅ Good - stable selector
await element(by.id('motorcycle-card-0')).tap()

// ❌ Bad - brittle selector
await element(by.text('Honda CBR1000RR')).tap()
```

### Performance Tests

1. **Set Realistic Thresholds**: Based on device capabilities
2. **Test on Multiple Devices**: Different screen sizes and performance
3. **Monitor Trends**: Track performance over time
4. **Profile Before Optimizing**: Identify actual bottlenecks

## Test Organization

### File Structure

```
src/
├── __tests__/
│   ├── setup.ts              # Test setup and configuration
│   ├── utils/
│   │   ├── testUtils.tsx      # Testing utilities and helpers
│   │   └── mockData.ts        # Mock data factories
│   ├── mocks/
│   │   ├── server.ts          # MSW mock server setup
│   │   └── handlers.ts        # API route handlers
│   ├── services/
│   │   └── api.test.ts        # API service unit tests
│   ├── store/
│   │   ├── authSlice.test.ts  # Redux slice tests
│   │   └── index.test.ts      # Store configuration tests
│   ├── components/
│   │   └── MotorcycleCard.test.tsx
│   ├── screens/
│   │   └── HomeScreen.test.tsx
│   └── integration/
│       └── userFlow.test.tsx  # Integration test scenarios
e2e/
├── jest.config.js             # E2E Jest configuration
├── setup.ts                   # E2E test setup
├── environment.js             # Detox test environment
└── HomeScreen.test.ts         # E2E test files
```

### Naming Conventions

- **Unit Tests**: `ComponentName.test.tsx`
- **Integration Tests**: `featureName.test.tsx`
- **E2E Tests**: `FeatureFlow.test.ts`
- **Test IDs**: `component-name-element` (kebab-case)

## Troubleshooting

### Common Issues

#### Jest Tests

**Issue**: Tests timeout or run slowly
```bash
# Solution: Increase timeout and limit workers
jest --testTimeout=30000 --maxWorkers=2
```

**Issue**: Module import errors
```bash
# Solution: Check jest.config.js transformIgnorePatterns
# Add problematic modules to transform patterns
```

#### Detox E2E Tests

**Issue**: App doesn't launch
```bash
# Solution: Rebuild app for testing
npm run test:e2e:build -- ios.sim.debug
```

**Issue**: Element not found
```typescript
// Solution: Use waitFor with timeout
await waitFor(element(by.id('element-id')))
  .toBeVisible()
  .withTimeout(10000)
```

**Issue**: iOS Simulator issues
```bash
# Solution: Reset simulator
xcrun simctl erase all
xcrun simctl boot "iPhone 14"
```

#### Coverage Issues

**Issue**: Low coverage warnings
- Add more unit tests for uncovered lines
- Check coverage reports: `open coverage/lcov-report/index.html`
- Focus on critical business logic first

**Issue**: Coverage not uploading to Codecov
- Check GitHub Actions secrets for `CODECOV_TOKEN`
- Verify codecov.yml configuration
- Check file paths in coverage reports

### Debug Mode

```bash
# Debug Jest tests
npm test -- --verbose --no-cache

# Debug Detox tests
npm run test:e2e -- --loglevel verbose

# Debug with breakpoints
npm test -- --runInBand --detectOpenHandles
```

### Performance Debugging

```bash
# Analyze bundle size
npm run analyze-bundle

# Profile Jest tests
npm test -- --logHeapUsage

# Monitor memory during E2E tests
# Use Xcode Instruments or Android Studio Profiler
```

## Contributing

When contributing tests:

1. **Follow the patterns** established in existing tests
2. **Add tests for new features** - aim for 80%+ coverage
3. **Update tests for changes** - don't just make them pass
4. **Run the full suite** before submitting PR
5. **Document complex test scenarios** with comments

### Pre-commit Checklist

- [ ] All tests pass locally
- [ ] New code has corresponding tests
- [ ] Coverage thresholds are met
- [ ] E2E tests pass for critical flows
- [ ] Performance tests don't show regressions

## Resources

- [Jest Documentation](https://jestjs.io/)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Detox Documentation](https://github.com/wix/Detox)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [MSW Documentation](https://mswjs.io/)

---

For questions or issues with testing, please:
1. Check this documentation first
2. Search existing GitHub issues
3. Create a new issue with detailed description
4. Tag relevant team members for review