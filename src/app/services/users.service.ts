import { Injectable } from '@angular/core';
import { of } from 'rxjs';

export interface User {
  id: string;
  username: string;
}

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  getUser() {
    return of({
      id: '1',
      username: 'jon'
    });
  }

  getPermissions(id: string) {
    return of(['posts:read', 'posts:create']);
  }

  constructor() {}
}
