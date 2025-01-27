import 'zone.js/dist/zone-testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

declare const require: {
  context(
    path: string,
    deep?: boolean,
    filter?: RegExp
  ): {
    keys(): string[];
    <T>(id: string): T;
  };
};

// Initialize the Angular testing environment with additional modules.
getTestBed().initTestEnvironment(
  [BrowserDynamicTestingModule, HttpClientTestingModule],
  platformBrowserDynamicTesting()
);

// Find all .spec.ts files and load them.
const context = require.context('./', true, /\.spec\.ts$/);
context.keys().map(context);
