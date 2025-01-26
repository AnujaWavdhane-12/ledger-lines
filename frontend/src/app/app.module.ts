//
// Pages
//
import { CreateOrganizationComponent } from './pages/organization-create.component';
import { CrmClientListComponent } from './pages/app-crm-client-list.component';
import { InboxComponent } from './pages/app-inbox.component';
import { IndexComponent } from './pages/index.component';
import { LoginComponent } from './pages/login.component';
import { PartnerOnboardingComponent } from './pages/partner-onboarding.component';
import { ProblemCategoriesSectionComponent } from './pages/app-problem-categories-section.component';
import { SettingsComponent } from './pages/app-settings.component';
import { TransactionManagerComponent } from './pages/app-transaction-manager.component';

//
// Services
//
import { UIAlertsService } from './services/uialerts.service';
import { TelemetryService } from './services/telemetry.service';
import { PostHogService } from './services/posthog.service';
import { LocalStorageService } from './services/local-storage.service';

//
// Components
//
import { AlertsComponent } from './components/alerts.component';
import { AppFooterComponent } from './components/app-footer.component';
import { AuthImagePipe } from './components/image.component';
import { BankConnectionRequestComponent } from './components/bank-connection-request.component';
import { ClientCreateComponent } from './components/client-create.component';
import { ClientDetailsComponent } from './components/client-details.component';
import { ClientDetailsFormComponent } from './components/client-details-form.component';
import { ClientDropdownComponent } from './components/client-dropdown.component';
import { ClientSharesComponent } from './components/client-shares-component';
import { ClientSharesFormComponent } from './components/client-shares-form.component';
import { ClientsTableComponent } from './components/clients-table.component';
import { DashboardPageComponent } from './components/dashboard-page.component';
import { DatePickerComponent } from './components/datepicker.component';
import { FullscreenLoadingComponent } from './components/fullscreen-loading.component';
import { HorizontalMenuComponent } from './components/horizontal-menu.component';
import { InboxContactListComponent } from './components/inbox-contact-list.component';
import { InboxConversationComponent } from './components/inbox-conversation.component';
import { LoadingButtonComponent } from './components/button-loading.component';
import { MomentAgoPipe } from './components/ago.pipe.component';
import { MomentPipe } from './components/date.pipe.component';
import { DateObjectPipe } from './components/date-object.pipe.component';
import { OrganizationComponent } from './pages/organization.component';
import { OrganizationListComponent } from './components/organization-list.component';
import { RecruiterStatusBarComponent } from './components/status-bar.component';
import { TableComponent } from './components/table.component';
import { TransactionCreateComponent } from './components/transaction-create.component';
import { TransactionCreateTransferComponent } from './components/transaction-create-transfer.component';
import { BulkCategorizationDialogComponent } from './components/bulk-categorization-dialog.component';
import { TransactionDetailsFormComponent } from './components/transaction-details-form-component';
import { TransactionsTableComponent } from './components/transactions-table.component';
import { UserPillComponent } from './components/user-pill.component';
import { FieldsetModule } from 'primeng/fieldset';

//
// Templates
//
import { PageTemplate } from './templates/page-template.component';

//
// Other
//
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AuthHttpInterceptor } from '@auth0/auth0-angular';
import { AuthModule } from '@auth0/auth0-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { CUSTOM_ELEMENTS_SCHEMA, ErrorHandler, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Configuration, ApiModule } from 'src/service-sdk';
import { FormsModule } from '@angular/forms';
import { GlobalErrorHandler } from './global-error-handler';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
//import { NgxDropzoneModule } from 'ngx-dropzone';
//import { NgxMaskModule } from 'ngx-mask';
import { ReactiveFormsModule } from '@angular/forms';
import { environment } from 'src/environments/environment';
import { CurrencyPipe } from '@angular/common';

//
// PrimeNG
//
import { AccordionModule } from 'primeng/accordion';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { AvatarModule } from 'primeng/avatar';
import { BadgeModule } from 'primeng/badge';
import { BlockUIModule } from 'primeng/blockui';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { CarouselModule } from 'primeng/carousel';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { ChipsModule } from 'primeng/chips';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { EditorModule } from 'primeng/editor';
import { FileUploadModule } from 'primeng/fileupload';
import { HomeComponent } from './pages/app-home.component';
import { InboxEmailFormComponent } from './components/inbox-email-form.component';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputSwitchModule } from 'primeng/inputswitch';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ListboxModule } from 'primeng/listbox';
import { MenuModule } from 'primeng/menu';
import { MessageModule } from 'primeng/message';
import { MessagesModule } from 'primeng/messages';
import { MultiSelectModule } from 'primeng/multiselect';
import { PanelModule } from 'primeng/panel';
import { ProgressBarModule } from 'primeng/progressbar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { SplitterModule } from 'primeng/splitter';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TimelineModule } from 'primeng/timeline';
import { ToastModule } from 'primeng/toast';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { SliderModule } from 'primeng/slider';

// This is the url of the backend, defined in the environment files
const config: Configuration = new Configuration();
config.basePath = environment.backendUrl;

export function configFactory() {
  return config;
}

@NgModule({
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  declarations: [
    AlertsComponent,
    AppComponent,
    AppFooterComponent,
    AuthImagePipe,
    BankConnectionRequestComponent,
    ClientCreateComponent,
    ClientDetailsComponent,
    ClientDetailsFormComponent,
    ClientDropdownComponent,
    ClientSharesComponent,
    ClientSharesFormComponent,
    ClientsTableComponent,
    CreateOrganizationComponent,
    CrmClientListComponent,
    DashboardPageComponent,
    DatePickerComponent,
    FullscreenLoadingComponent,
    HomeComponent,
    HorizontalMenuComponent,
    InboxComponent,
    InboxComponent,
    InboxContactListComponent,
    InboxConversationComponent,
    InboxEmailFormComponent,
    IndexComponent,
    LoadingButtonComponent,
    LoginComponent,
    MomentAgoPipe,
    MomentPipe,
    DateObjectPipe,
    OrganizationComponent,
    OrganizationListComponent,
    PageTemplate,
    PartnerOnboardingComponent,
    ProblemCategoriesSectionComponent,
    RecruiterStatusBarComponent,
    SettingsComponent,
    TableComponent,
    TransactionCreateComponent,
    TransactionCreateTransferComponent,
    BulkCategorizationDialogComponent,
    TransactionDetailsFormComponent,
    TransactionManagerComponent,
    TransactionsTableComponent,
    UserPillComponent,
  ],
  imports: [
    AccordionModule,
    AppRoutingModule,
    AutoCompleteModule,
    AvatarModule,
    BadgeModule,
    BlockUIModule,
    CurrencyPipe,
    BreadcrumbModule,
    BrowserAnimationsModule,
    BrowserModule,
    ButtonModule,
    CalendarModule,
    CardModule,
    CarouselModule,
    CarouselModule,
    ChartModule,
    CheckboxModule,
    ChipModule,
    ChipsModule,
    CommonModule,
    ConfirmDialogModule,
    DialogModule,
    DropdownModule,
    EditorModule,
    FileUploadModule,
    FormsModule,
    InputSwitchModule,
    InputTextModule,
    InputTextareaModule,
    ListboxModule,
    MenuModule,
    MessageModule,
    MessagesModule,
    MultiSelectModule,
    PanelModule,
    ProgressBarModule,
    ProgressSpinnerModule,
    RadioButtonModule,
    ReactiveFormsModule,
    ScrollPanelModule,
    SelectButtonModule,
    SliderModule,
    SplitButtonModule,
    SplitterModule,
    TabViewModule,
    TableModule,
    TagModule,
    TimelineModule,
    ToastModule,
    ToggleButtonModule,
    ToolbarModule,
    TooltipModule,
    ApiModule.forRoot(configFactory),
    HttpClientModule,
    //NgbModule,
    //NgxDropzoneModule,
    FieldsetModule,
    InputNumberModule,
  ],
  providers: [
    TelemetryService,
    PostHogService,
    UIAlertsService,
    LocalStorageService,
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },
  ],
  bootstrap: [AppComponent],
  entryComponents: [],
})
export class AppModule {}
