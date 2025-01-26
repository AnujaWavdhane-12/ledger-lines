import { Component } from '@angular/core';
import { DefaultService } from 'src/service-sdk';
import { Router, ActivatedRoute } from '@angular/router';
import { Inject } from '@angular/core';
import { AuthService } from '@auth0/auth0-angular';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-problem-categories-section-component',
  styles: [
    `
      h1 {
        color: var(--primary-color);
        text-align: center;
      }

      .subtitle {
        font-size: 24.5px;
        font-weight: 700;
        margin-bottom: 25px;
        text-align: center;
      }

      .tag {
        appearance: none;
        background-color: var(--primary-light-color);
        border: none;
        cursor: pointer;
        display: inline-block;
        font-size: 21px;
        font-weight: 700;
        margin: 21.5px 14.5px;
        padding: 15px 30px;
        border-radius: 100px;
        text-align: center;
        transition: all 0.25s;
      }

      .tag:hover {
        background-color: var(--primary-color);
        box-shadow: 0px 2.78037px 11.1215px var(--primary-light-color);
        color: var(--primary-color-text);
      }

      .tags {
        text-align: center;
      }

      @media only screen and (max-width: 992px) {
        .tag {
          display: block;
        }

        .tags br {
          display: none;
        }
      }
    `,
  ],
  template: `
    <div class="container d-flex align-items-center flex-column gap-3">
      <h1>Ready to join the fun?</h1>
      <div class="subtitle">Adding new languages, skills and frameworks</div>
      <div class="tags">
        <span *ngFor="let tag of tags">
          <button *ngIf="tag" class="tag" (click)="onTagClicked(tag)">{{ tag }}</button>
          <br *ngIf="!tag" />
        </span>
        <button class="tag" (click)="onTagClicked('')">more...</button>
      </div>
      <p-button [routerLink]="['/login']" label="Join the Community"></p-button>
    </div>
  `,
})
export class ProblemCategoriesSectionComponent {
  public tags: string[] = [];

  constructor(
    @Inject(DOCUMENT)
    public document: Document,
    private api: DefaultService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.tags = ['Node.js', 'C', 'Vue.js', '', 'Git', 'HTML/CSS', 'Python'];
  }

  public onTagClicked(tag: string): void {
    this.router.navigate(
      ['/problems'],
      tag
        ? {
            queryParams: { search: tag },
          }
        : undefined
    );
  }
}
