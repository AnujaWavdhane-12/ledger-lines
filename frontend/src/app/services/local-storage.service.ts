import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalStorageService {
  constructor() {}

  // Set item
  setItem(key: string, value: any): void {
    localStorage.setItem(key, JSON.stringify(value));
  }

  // Get item
  getItem(key: string): any {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  }

  // Remove item
  removeItem(key: string): void {
    localStorage.removeItem(key);
  }

  // Clear all localStorage
  clear(): void {
    localStorage.clear();
  }
}
