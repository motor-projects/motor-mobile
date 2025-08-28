# Testing Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Your First Test
```bash
npm test
```

### 3. Check Test Coverage
```bash
npm run test:coverage
open coverage/lcov-report/index.html
```

## 🧪 Common Test Commands

| Command | Description |
|---------|-------------|
| `npm test` | Run unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:performance` | Run performance tests |

## 📝 Writing Your First Test

### Component Test
```typescript
// src/components/__tests__/MyComponent.test.tsx
import React from 'react'
import { render, fireEvent } from '../../__tests__/utils/testUtils'
import MyComponent from '../MyComponent'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const { getByText } = render(<MyComponent title="Test" />)
    expect(getByText('Test')).toBeTruthy()
  })
  
  it('should handle button press', () => {
    const onPress = jest.fn()
    const { getByRole } = render(<MyComponent onPress={onPress} />)
    
    fireEvent.press(getByRole('button'))
    expect(onPress).toHaveBeenCalled()
  })
})
```

### Redux Test
```typescript
// src/store/__tests__/mySlice.test.ts
import reducer, { myAction } from '../slices/mySlice'

describe('mySlice', () => {
  it('should handle myAction', () => {
    const initialState = { value: 0 }
    const action = myAction(5)
    
    const newState = reducer(initialState, action)
    expect(newState.value).toBe(5)
  })
})
```

### E2E Test
```typescript
// e2e/MyFlow.test.ts
import { device, element, by, expect as detoxExpect } from 'detox'

describe('My Flow', () => {
  beforeAll(async () => {
    await device.launchApp()
  })

  it('should complete user flow', async () => {
    await element(by.id('start-button')).tap()
    await detoxExpect(element(by.id('success-screen'))).toBeVisible()
  })
})
```

## 🏃‍♂️ Quick Setup for E2E Tests

### iOS
```bash
# Build app
npm run test:e2e:build -- ios.sim.debug

# Run tests  
npm run test:e2e -- --configuration ios.sim.debug
```

### Android
```bash
# Start emulator first
emulator -avd Pixel_3a_API_30_x86

# Build app
npm run test:e2e:build -- android.emu.debug

# Run tests
npm run test:e2e -- --configuration android.emu.debug
```

## 🐛 Quick Debugging

### Test Failing?
```bash
# Run with verbose output
npm test -- --verbose

# Run specific test
npm test MyComponent.test.tsx

# Debug with logs
npm test -- --silent=false
```

### E2E Test Failing?
```bash
# Run with detailed logs
npm run test:e2e -- --loglevel verbose

# Take screenshot for debugging
await device.takeScreenshot('debug-screenshot')
```

### Coverage Too Low?
1. Check which files need tests: `open coverage/lcov-report/index.html`
2. Focus on red/orange files first
3. Aim for 80%+ coverage

## 📋 Test Checklist

Before committing:
- [ ] `npm test` passes
- [ ] Coverage is above 80%
- [ ] E2E tests pass for main flows
- [ ] No console errors in tests
- [ ] New features have tests

## 🔧 Quick Fixes

### Common Jest Issues
```bash
# Clear cache
npm test -- --clearCache

# Update snapshots
npm test -- --updateSnapshot

# Run in band (no parallel)
npm test -- --runInBand
```

### Common Detox Issues
```bash
# Reset iOS simulator
xcrun simctl erase all

# Restart Metro bundler
npx react-native start --reset-cache

# Rebuild test app
npm run test:e2e:build
```

## 📚 Need More Help?

- Full documentation: [TESTING.md](./TESTING.md)
- Examples: Check `src/__tests__/` folder
- Issues: Create GitHub issue with `testing` label

---

🎉 **You're ready to start testing!** Run `npm test` to begin.