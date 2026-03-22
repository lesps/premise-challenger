export function isLocalStorageAvailable(): boolean {
  try {
    const key = '__storage_test__';
    localStorage.setItem(key, 'test');
    localStorage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
