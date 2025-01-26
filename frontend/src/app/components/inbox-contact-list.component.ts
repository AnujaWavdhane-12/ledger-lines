import { Component, OnInit } from '@angular/core';

interface Contact {
  name: string;
  email: string;
  phone: string;
}

@Component({
  selector: 'inbox-contact-list-component',
  template: `
    <div class="contacts-container">
      <p-listbox [options]="contactsList" [(ngModel)]="selectedContact" optionLabel="name" [filter]="true">
        <ng-template let-contact pTemplate="item">
          <div class="contact-item">
            <div class="contact-icon">
              {{ getInitials(contact.name) }}
            </div>
            <div class="contact-details">
              <p>{{ contact.name }}</p>
              <small>{{ contact.email }}</small>
            </div>
          </div>
        </ng-template>
      </p-listbox>
    </div>
  `,
  styles: [
    `
      .contacts-container {
        max-height: 550px;
        overflow-y: auto;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        margin-left: 10px;
      }
      :host ::ng-deep .p-listbox .p-listbox-list {
        padding: 0;
      }
      :host ::ng-deep .p-listbox .p-listbox-item {
        padding: 0.5rem;
      }

      :host ::ng-deep .p-listbox .p-listbox-header {
        position: sticky;
        top: 0;
        z-index: 1;
        background-color: #f8f9fa;
      }

      .contact-item {
        display: flex;
        align-items: center;
        gap: 16px;
      }
      .contact-icon {
        width: 35px;
        height: 35px;
        border-radius: 50%;
        background-color: #007bff;
        color: white;
        display: flex;
        justify-content: center;
        align-items: center;
        font-weight: bold;
      }
      .contact-details p {
        margin: 0;
      }
      .contact-details small {
        color: #666;
      }
    `,
  ],
})
export class InboxContactListComponent implements OnInit {
  selectedContact: Contact | null = null;
  contactsList: Contact[] = [
    { name: 'P Jiminez', email: 'someEmail@example.com', phone: '123-456-7890' },
    { name: 'Unknown Unknown', email: 'someEmail@example.com', phone: '123-456-7890' },
    { name: 'Unknown Unknown', email: 'someEmail@example.com', phone: '123-456-7890' },
    { name: 'Modesto Fernandez', email: 'someEmail@example.com', phone: '123-456-7890' },
    { name: 'Modesto Fernandez', email: 'someEmail@example.com', phone: '123-456-7890' },
    { name: 'Modesto Fernandez', email: 'someEmail@example.com', phone: '123-456-7890' },
    { name: 'Modesto Fernandez', email: 'someEmail@example.com', phone: '123-456-7890' },
    { name: 'Modesto Fernandez', email: 'someEmail@example.com', phone: '123-456-7890' },
    { name: 'Modesto Fernandez', email: 'someEmail@example.com', phone: '123-456-7890' },
    { name: 'First Last', email: 'someEmail@example.com', phone: '123-456-7890' },
    { name: 'David Smith', email: 'someEmail@example.com', phone: '123-456-7890' },
  ];

  getInitials(name: string): string {
    const names = name.split(' ');
    if (names.length >= 2) {
      return (names[0][0] + names[names.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }

  ngOnInit(): void {}
}
