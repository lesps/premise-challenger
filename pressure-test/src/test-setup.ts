import '@testing-library/jest-dom';

// jsdom doesn't implement URL.createObjectURL / revokeObjectURL
if (!('createObjectURL' in URL)) {
  Object.defineProperty(URL, 'createObjectURL', {
    value: () => 'blob:mock-url',
    writable: true,
  });
}
if (!('revokeObjectURL' in URL)) {
  Object.defineProperty(URL, 'revokeObjectURL', {
    value: () => undefined,
    writable: true,
  });
}
