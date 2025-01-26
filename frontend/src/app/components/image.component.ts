import { HttpClient } from '@angular/common/http';
import { Pipe, PipeTransform } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Pipe({
  name: 'authImage',
})
/**
 * The point of this pipe is that loading images from the API directly needs the Authorization
 * header. By using this as an AJAX call, we can attach the token using standard methods (ie.
 * the Auth0 interceptor).
 */
export class AuthImagePipe implements PipeTransform {
  constructor(private http: HttpClient) {}

  /**
   *
   * @param src The URL of the image we want to load
   */
  async transform(src: string): Promise<string> {
    if (src === undefined) {
      return Promise.resolve('');
    }

    const imageBlob = await lastValueFrom(this.http.get(src, { responseType: 'blob' }));
    const reader = new FileReader();

    return new Promise((resolve, reject) => {
      reader.onloadend = () => {
        // Image has been loaded from the server
        resolve(reader.result as string);
      };
      reader.readAsDataURL(imageBlob);
    });
  }
}
