import { Injectable } from '@angular/core';
import { of } from 'rxjs';

export interface Post {
  id: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  getPosts() {
    return of([{ id: 'p1' }, { id: 'p2' }]);
  }

  constructor() {}
}
