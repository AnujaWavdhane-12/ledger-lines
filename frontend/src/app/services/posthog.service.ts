import { Injectable } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import posthog from 'posthog-js';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PostHogService {
  private initialized = false;

  constructor() {}

  private async init() {
    if (this.initialized) {
      return;
    }

    const currentUser = await this.getCurrentUser();

    return;
    // Currently disabled:
    //return new Promise((resolve, reject) => {
    //  posthog.init(environment.posthogToken, {
    //    api_host: 'https://us.i.posthog.com',
    //    person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
    //  });

    //  if (currentUser) {
    //    console.log('Identifying user with PostHog', (currentUser as any).sub);
    //    posthog.identify((currentUser as any).sub, {
    //      email: (currentUser as any).email,
    //      name: (currentUser as any).name,
    //      sub: (currentUser as any).sub,
    //    });
    //  }

    //  let thisInstance = this;
    //  posthog.onFeatureFlags(function () {
    //    thisInstance.initialized = true;
    //    console.log('PostHog feature flags are loaded');
    //    resolve(null);
    //  });
    //});
  }

  private async getCurrentUser() {
    return new Promise((resolve, reject) => {
      resolve(null);
      //this.auth.user$.subscribe({
      //  next: (userDetails) => {
      //    if (userDetails) {
      //      resolve(userDetails);
      //    } else {
      //      resolve(null);
      //    }
      //  },
      //  error: (error) => {
      //    reject(error);
      //  },
      //});
    });
  }

  public async isFeatureEnabled(feature: string): Promise<boolean> {
    await this.init();

    const isFeatureEnabled = posthog.isFeatureEnabled(feature);
    console.log(`Feature ${feature} is ${isFeatureEnabled ? 'enabled' : 'disabled'}`);
    return isFeatureEnabled;
  }
}
