import { Injectable } from '@angular/core';
import { Store, ScannedActionsSubject, Action } from '@ngrx/store';

@Injectable({
  providedIn: 'root'
})
export class SagaService {
  constructor(
    private store: Store<any>,
    private actions$: ScannedActionsSubject
  ) {}

  saga(saga: (action: Action, dispatch: (action: Action) => any) => void) {
    const dispatch = this.store.dispatch.bind(this.store);
    this.actions$.subscribe(action => saga(action, dispatch));
  }
}
