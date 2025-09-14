# Test Suite Documentation

This directory contains comprehensive tests for the Adventurer Guild frontend application.

## Test Structure

```
test/
├── components/           # Component tests
│   ├── Treasury.test.tsx
│   ├── NavigationTabs.test.tsx
│   └── Modal.test.tsx
├── data/                # Data layer tests
│   └── crafting.test.ts
├── integration/         # Integration tests
│   └── gameFlow.test.tsx
├── stores/              # State management tests
│   └── gameStore.test.ts
├── utils/               # Utility function tests
│   ├── formatters.test.ts
│   ├── questGenerator.test.ts
│   └── relationshipSystem.test.ts
├── testUtils.tsx        # Testing utilities and helpers
├── setup.ts            # Test environment setup
└── README.md           # This file
```

## Test Categories

### 🧩 Component Tests
- **Treasury.test.tsx**: Tests the treasury display component
- **NavigationTabs.test.tsx**: Tests tab navigation functionality
- **Modal.test.tsx**: Tests modal dialog behavior and accessibility

### 📊 Store Tests
- **gameStore.test.ts**: Comprehensive tests for the main game state management
  - Initial state validation
  - Gold management operations
  - Adventurer hiring workflow
  - Quest management lifecycle
  - Recruit refresh system
  - Calculation utilities

### 🛠️ Utility Tests
- **formatters.test.ts**: Number formatting utilities
- **questGenerator.test.ts**: Procedural quest generation system
- **relationshipSystem.test.ts**: Adventurer relationship mechanics

### 📦 Data Layer Tests
- **crafting.test.ts**: Crafting system data integrity and business logic

### 🔄 Integration Tests
- **gameFlow.test.tsx**: End-to-end game workflows and user interactions

## Running Tests

### All Tests
```bash
npm run test
```

### Specific Test Files
```bash
npm run test formatters.test.ts
npm run test gameStore.test.ts
```

### With Coverage
```bash
npm run test:coverage
```

### Watch Mode
```bash
npm run test:watch
```

## Test Utilities

The `testUtils.tsx` file provides:

### Mock Factories
```typescript
createMockAdventurer(overrides?)    // Generate test adventurers
createMockQuest(overrides?)         // Generate test quests
createMockRecruit(overrides?)       // Generate test recruits
createMockGameState(overrides?)     // Generate test game states
```

### Helper Functions
```typescript
generateMockAdventurers(count)      // Generate multiple adventurers
generateMockQuests(count)           // Generate multiple quests
measureRenderTime(renderFn)         // Performance testing
checkAccessibilityAttributes(el)    // Accessibility validation
```

### Store Mocks
```typescript
createMockGameActions()             // Mock store actions
createMockUIActions()               // Mock UI actions
```

## Test Patterns

### Component Testing Pattern
```typescript
describe('Component', () => {
  beforeEach(() => {
    // Setup mocks
  });

  it('should render correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    const mockFn = vi.fn();
    render(<Component onClick={mockFn} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockFn).toHaveBeenCalled();
  });
});
```

### Store Testing Pattern
```typescript
describe('Store', () => {
  beforeEach(() => {
    // Reset store state
    useStore.setState(initialState);
  });

  it('should update state correctly', () => {
    const { action } = useStore.getState();
    action(params);
    expect(useStore.getState().property).toBe(expectedValue);
  });
});
```

### Integration Testing Pattern
```typescript
describe('Integration', () => {
  it('should complete user workflow', async () => {
    render(<App />);

    // User actions
    fireEvent.click(screen.getByText('Start'));

    // Wait for async operations
    await waitFor(() => {
      expect(screen.getByText('Success')).toBeInTheDocument();
    });
  });
});
```

## Coverage Goals

### Target Coverage
- **Statements**: >90%
- **Branches**: >85%
- **Functions**: >90%
- **Lines**: >90%

### Current Coverage Areas
- ✅ Utility functions: 95%+ coverage
- ✅ Store logic: 90%+ coverage
- ✅ Component rendering: 85%+ coverage
- ✅ Data validation: 95%+ coverage
- ✅ Integration flows: 80%+ coverage

## Testing Best Practices

### ✅ Do
- Write descriptive test names that explain the behavior being tested
- Use `beforeEach` for common setup code
- Test both success and failure cases
- Mock external dependencies
- Test accessibility attributes
- Use semantic queries (`getByRole`, `getByLabelText`)
- Test user interactions, not implementation details

### ❌ Don't
- Test implementation details (internal state, private methods)
- Write tests that depend on other tests
- Use too many mocks (prefer integration when possible)
- Ignore accessibility in tests
- Write tests without clear assertions

## Mock Strategy

### What We Mock
- **External APIs**: All network calls
- **Browser APIs**: LocalStorage, Date, Math.random
- **Store Dependencies**: Zustand stores in component tests
- **Time-dependent Operations**: Quest timers, save intervals

### What We Don't Mock
- **Pure Functions**: Formatters, calculators
- **React Hooks**: useState, useEffect (unless necessary)
- **DOM APIs**: When testing actual user interactions

## Debugging Tests

### Common Issues
1. **Async Operations**: Use `waitFor`, `findBy*` queries
2. **State Updates**: Ensure proper mocking of store actions
3. **Time-dependent Code**: Use `vi.useFakeTimers()`
4. **DOM Updates**: Use `act()` for complex state updates

### Debug Utilities
```typescript
// Debug rendered output
screen.debug();

// Debug specific element
screen.debug(screen.getByRole('button'));

// Check what queries are available
screen.logTestingPlaygroundURL();
```

## Continuous Integration

Tests run automatically on:
- **Pre-commit**: Via husky hooks
- **Pull Requests**: Full test suite
- **Main Branch**: Full test suite + coverage report

### CI Configuration
```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: npm run test:ci

- name: Coverage Report
  run: npm run test:coverage

- name: Upload Coverage
  uses: codecov/codecov-action@v3
```

## Performance Testing

### Render Performance
```typescript
it('should render quickly with large datasets', () => {
  const manyItems = generateMockAdventurers(1000);

  const renderTime = measureRenderTime(() => {
    render(<AdventurerList adventurers={manyItems} />);
  });

  expect(renderTime).toBeLessThan(100); // ms
});
```

### Memory Usage
Monitor for memory leaks in component tests:
```typescript
afterEach(() => {
  // Clean up listeners, timers, etc.
  cleanup();
});
```

---

## Contributing to Tests

When adding new features:

1. **Write tests first** (TDD approach recommended)
2. **Ensure coverage** meets project standards
3. **Update test documentation** if adding new patterns
4. **Run full test suite** before committing
5. **Add integration tests** for user-facing features

This comprehensive test suite ensures the Adventurer Guild application maintains high quality and reliability as it grows in complexity.