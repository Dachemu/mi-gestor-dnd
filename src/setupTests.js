import '@testing-library/jest-dom'

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn()
}
global.localStorage = localStorageMock

// Mock console.log para tests (mantenemos otros métodos)
global.console = {
  ...console,
  log: jest.fn() // Mock debug logs
}