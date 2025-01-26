import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { AuthService } from '@auth0/auth0-angular';
import { MessageService } from 'primeng/api';
import { DefaultService } from 'src/service-sdk';
import { PrivateApi } from '../services/privateApi.service';

@Component({
  selector: 'app-partner-onboarding-component',
  styles: [
    `
      .form-group {
        margin-bottom: 1.5rem;
      }
      .form-label {
        display: block;
        margin-bottom: 0.5rem;
        font-weight: 500;
        color: #374151;
      }
      .form-control {
        border-color: grey;
        width: 100%;
        margin-bottom: 0.5rem;
      }
      .required:after {
        content: ' *';
        color: red;
      }
      .error-message {
        font-size: 0.875rem;
        color: #dc3545;
        margin-top: 0.25rem;
      }
    `,
  ],
  template: `
    <page-template>
      <div class="container-fluid d-flex justify-content-center">
        <div class="col-md-6">
          <div class="text-center m-4">
            <img alt="Propio" src="assets/images/logo-teal.png" width="35" class="mobile-logo" />
            <img alt="Propio" src="assets/images/logo-teal.png" class="desktop-logo" />
          </div>
          <p-messages />
          <div class="text-center mb-8">
            <h2 class="mb-2">Onboarding</h2>
            <p class="text-sm text-gray-600">Fill out the form to onboard you to Propio.</p>
          </div>

          <form class="space-y-6 px-4">
            <!-- Organization Name -->
            <div class="form-group">
              <label class="form-label required">Organization Name</label>
              <input
                type="text"
                pInputText
                [formControl]="orgName"
                placeholder="ACME Company Inc."
                required
                minlength="3"
                maxlength="260"
                class="form-control" />
              <div *ngIf="orgName.invalid && (orgName.dirty || orgName.touched)" class="error-message">
                <div *ngIf="orgName.errors?.['required']">Organization name is required.</div>
                <div *ngIf="orgName.errors?.['minlength']">Organization name must be at least 3 characters long.</div>
                <div *ngIf="orgName.errors?.['maxlength']">Organization name cannot be more than 260 characters long.</div>
              </div>
            </div>

            <!-- URL -->
            <div class="form-group">
              <label class="form-label">URL</label>
              <input
                type="url"
                pInputText
                [formControl]="url"
                placeholder="https://acmecompany.inc"
                pattern="https://.*"
                minlength="10"
                maxlength="2000"
                class="form-control" />
              <div *ngIf="url.invalid && (url.dirty || url.touched)" class="error-message">
                <div *ngIf="url.errors?.['minlength']">URL must be at least 10 characters long.</div>
                <div *ngIf="url.errors?.['maxlength']">URL cannot be more than 2000 characters long.</div>
                <div *ngIf="url.errors?.['pattern']">URL must start with https://.</div>
              </div>
            </div>

            <!-- Image URL -->
            <div class="form-group">
              <label class="form-label">Image URL</label>
              <input
                type="url"
                pInputText
                [formControl]="imageUrl"
                placeholder="https://acmecompany.inc/logo"
                pattern="https://.*"
                minlength="10"
                maxlength="2000"
                class="form-control" />
              <div *ngIf="imageUrl.invalid && (imageUrl.dirty || imageUrl.touched)" class="error-message">
                <div *ngIf="imageUrl.errors?.['minlength']">Image URL must be at least 10 characters long.</div>
                <div *ngIf="imageUrl.errors?.['maxlength']">Image URL cannot be more than 2000 characters long.</div>
                <div *ngIf="imageUrl.errors?.['pattern']">Image URL must start with https://.</div>
              </div>
            </div>

            <!-- First Name -->
            <div class="form-group">
              <label class="form-label required">First Name</label>
              <input type="text" pInputText [formControl]="contactFirstName" placeholder="Amy" minlength="1" maxlength="50" required class="form-control" />
              <div *ngIf="contactFirstName.invalid && (contactFirstName.dirty || contactFirstName.touched)" class="error-message">
                <div *ngIf="contactFirstName.errors?.['minlength']">First name must be at least 1 character long.</div>
                <div *ngIf="contactFirstName.errors?.['maxlength']">First name cannot be more than 50 characters long.</div>
                <div *ngIf="contactFirstName.errors?.['required']">First name is required.</div>
              </div>
            </div>

            <!-- Last Name -->
            <div class="form-group">
              <label class="form-label required">Last Name</label>
              <input type="text" pInputText [formControl]="contactLastName" placeholder="Langston" minlength="1" maxlength="50" required class="form-control" />
              <div *ngIf="contactLastName.invalid && (contactLastName.dirty || contactLastName.touched)" class="error-message">
                <div *ngIf="contactLastName.errors?.['minlength']">Last name must be at least 1 character long.</div>
                <div *ngIf="contactLastName.errors?.['maxlength']">Last name cannot be more than 50 characters long.</div>
                <div *ngIf="contactLastName.errors?.['required']">Last name is required.</div>
              </div>
            </div>

            <!-- Contact Email -->
            <div class="form-group">
              <label class="form-label required">Contact Email</label>
              <input type="email" pInputText [formControl]="contactEmail" placeholder="amy@acmecompany.inc" required email="" class="form-control" />
              <div *ngIf="contactEmail.invalid && (contactEmail.dirty || contactEmail.touched)" class="error-message">
                <div *ngIf="contactEmail.errors?.['required']">Contact email is required</div>
                <div *ngIf="contactEmail.errors?.['email']">Contact email must be a valid email address.</div>
              </div>
            </div>

            <!-- Save Button -->
            <div class="text-center mt-4">
              <p-button (click)="saveOnboarding()" label="Save" />
            </div>
          </form>
        </div>
      </div>
    </page-template>
  `,
  providers: [MessageService],
})
export class PartnerOnboardingComponent implements OnInit {
  orgName = new FormControl('');
  url = new FormControl('');
  imageUrl = new FormControl('');
  contactFirstName = new FormControl('');
  contactLastName = new FormControl('');
  contactEmail = new FormControl('');
  private auth0IdToken: string;

  public constructor(
    private auth: AuthService,
    private api: DefaultService,
    private privateApi: PrivateApi,
    private router: Router,
    private titleService: Title,
    private messageService: MessageService
  ) {
    this.titleService.setTitle('Partner onboarding');
  }

  public checkFormValid(): boolean {
    return this.orgName.valid && this.url.valid && this.imageUrl.valid && this.contactFirstName.valid && this.contactLastName.valid && this.contactEmail.valid;
  }

  public ngOnInit() {
    this.auth.user$.subscribe((user) => {
      this.auth0IdToken = user.sub;
    });
  }

  public saveOnboarding() {
    this.messageService.clear();
    if (this.checkFormValid()) {
      const partnerOnboardingRequest = {
        user: {
          email: this.contactEmail.value,
          first_name: this.contactFirstName.value,
          last_name: this.contactLastName.value,
        },
        organization: {
          name: this.orgName.value,
          web_url: this.url.value,
          logo_url: this.imageUrl.value,
        },
      };
      const observer = {
        next: () => {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: 'Your onboarding details have been saved.' });
          this.router.navigate(['/home']);
        },
        error: (error: any) => {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'There was an error saving your onboarding details. Please try again.' });
          console.error(error);
        },
      };

      this.api.onboardUser(partnerOnboardingRequest, this.auth0IdToken).subscribe(observer);
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'There are missing details in the onboarding form. Please review the form and try again.',
      });
    }
  }
}
