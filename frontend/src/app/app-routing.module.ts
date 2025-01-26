import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';

//
// Pages only
//
import { AuthCallbackComponent } from './pages/auth-callback.component';
import { OrganizationComponent } from './pages/organization.component';
import { CreateOrganizationComponent } from './pages/organization-create.component';
import { IndexComponent } from './pages/index.component';
import { LoginComponent } from './pages/login.component';
import { CrmClientListComponent } from './pages/app-crm-client-list.component';
import { TransactionManagerComponent } from './pages/app-transaction-manager.component';
import { SettingsComponent } from './pages/app-settings.component';
import { HomeComponent } from './pages/app-home.component';
import { InboxComponent } from './pages/app-inbox.component';
import { PartnerOnboardingComponent } from './pages/partner-onboarding.component';

const routes: Routes = [
  // Public pages
  { path: '', component: CrmClientListComponent },
  { path: 'home', component: IndexComponent },

  // Login flow
  { path: 'login', component: LoginComponent },
  { path: 'auth-callback', component: AuthCallbackComponent },

  // Dashboard pages
  { path: 'clients', component: CrmClientListComponent },
  { path: 'transactions', component: TransactionManagerComponent },
  { path: 'clients/:clientId/transactions', component: TransactionManagerComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'inbox', component: InboxComponent },
  { path: 'help', component: IndexComponent },
  { path: 'partner-onboarding', component: PartnerOnboardingComponent },

  { path: 'organization', component: OrganizationComponent },
  { path: 'organization/new', component: CreateOrganizationComponent },

  // Catch all page thats shows 404 error
  // { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [FormsModule, ReactiveFormsModule, RouterModule.forRoot(routes, { anchorScrolling: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
