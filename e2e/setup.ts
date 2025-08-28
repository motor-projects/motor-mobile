import { beforeAll, beforeEach, afterAll } from '@jest/globals'
import { device, element, by, waitFor } from 'detox'

// Global test configuration
const TIMEOUT = 30000

beforeAll(async () => {
  // Device preparation - handled by Detox environment
})

beforeEach(async () => {
  // Reload the app before each test to ensure clean state
  await device.reloadReactNative()
  
  // Wait for the app to load
  await waitFor(element(by.id('app-root')))
    .toBeVisible()
    .withTimeout(TIMEOUT)
})

afterAll(async () => {
  // Cleanup - handled by Detox environment
})

// Global test utilities
global.waitForElement = async (matcher: any, timeout = TIMEOUT) => {
  await waitFor(element(matcher))
    .toBeVisible()
    .withTimeout(timeout)
}

global.tapElement = async (matcher: any) => {
  await element(matcher).tap()
}

global.typeInElement = async (matcher: any, text: string) => {
  await element(matcher).typeText(text)
}

global.scrollToElement = async (scrollableMatcher: any, elementMatcher: any) => {
  await waitFor(element(elementMatcher))
    .toBeVisible()
    .whileElement(scrollableMatcher)
    .scroll(200, 'down')
}

global.expectElementToBeVisible = async (matcher: any) => {
  await expect(element(matcher)).toBeVisible()
}

global.expectElementToHaveText = async (matcher: any, text: string) => {
  await expect(element(matcher)).toHaveText(text)
}

// Mock server setup for E2E tests
global.setupMockServer = () => {
  // In a real implementation, you might want to set up MSW or similar
  console.log('Setting up mock server for E2E tests')
}

global.teardownMockServer = () => {
  console.log('Tearing down mock server')
}

// Test data helpers
global.getTestMotorcycle = () => ({
  id: 'test-motorcycle-1',
  brand: 'Honda',
  model: 'CBR1000RR',
  year: 2023,
  category: 'Sport',
  price: {
    msrp: 16999,
    currency: 'USD'
  }
})

global.getTestUser = () => ({
  email: 'test@example.com',
  password: 'password123',
  username: 'testuser'
})

// Device-specific helpers
global.isIOS = () => device.getPlatform() === 'ios'
global.isAndroid = () => device.getPlatform() === 'android'

// Screenshot helpers for debugging
global.takeScreenshot = async (name: string) => {
  if (process.env.CI) {
    await device.takeScreenshot(name)
  }
}

// Network condition helpers
global.setNetworkCondition = async (condition: 'online' | 'offline') => {
  // This would require additional setup with proxy or network simulation
  console.log(`Setting network condition to: ${condition}`)
}

// Permission helpers
global.grantPermissions = async (permissions: string[]) => {
  if (device.getPlatform() === 'ios') {
    for (const permission of permissions) {
      await device.setPermissions({
        [permission]: 'YES'
      })
    }
  } else {
    // Android permission handling would go here
    console.log('Granting Android permissions:', permissions)
  }
}

// App state helpers
global.backgroundApp = async (duration: number = 2000) => {
  await device.sendToHome()
  await new Promise(resolve => setTimeout(resolve, duration))
  await device.launchApp({ newInstance: false })
}

global.terminateApp = async () => {
  await device.terminateApp()
}

global.launchApp = async (newInstance: boolean = false) => {
  await device.launchApp({ newInstance })
}