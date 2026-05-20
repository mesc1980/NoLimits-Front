import '@testing-library/jest-dom';

class IntersectionObserverMock {
  constructor() {}

  observe() {}

  unobserve() {}

  disconnect() {}
}

global.IntersectionObserver = IntersectionObserverMock;