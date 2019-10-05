import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';

export function fromActionAsync<T extends Action>(
  saga: (a1: T, dispatch: (a2: Action) => void) => Promise<void>
): (action: T) => Observable<Action> {
  return a3 =>
    new Observable<Action>(sub => {
      const dispatch = sub.next.bind(sub);

      saga(a3, dispatch)
        .catch(error => sub.error(error))
        .then(() => {
          sub.complete();
        });
    });
}
