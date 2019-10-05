import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { loadUser } from './app.effects';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'ngrx-saga';

  constructor(private store: Store<any>) {}

  getUser() {
    this.store.dispatch(loadUser());
  }
}
