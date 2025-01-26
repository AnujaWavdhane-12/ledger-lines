import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({ providedIn: 'root' })
export class PrivateApi {
  private basePath: string;
  private http: HttpClient;

  constructor(protected httpClient: HttpClient) {
    this.basePath = environment.backendUrl;
    this.http = httpClient;
  }

  public addUserToNewsletter(email: string): Observable<any> {
    return this.http.post(
      `${this.basePath}/api/newsletter-user`,
      { email: email },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }

  public processSubmission(submissionId: number): Observable<any> {
    return this.http.post(
      `${this.basePath}/api/submissions/process`,
      { id: submissionId },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
}
