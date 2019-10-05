import { Action } from '@ngrx/store';
import { Observable } from 'rxjs';

export function fromActionGenerator<T extends Action>(
  // In TS 3.6 this type will change to AsyncGenerator:
  generator: (action: T) => AsyncIterableIterator<Action>
): (action: T) => Observable<Action> {
  return a1 =>
    new Observable<Action>(sub => {
      let unsubbed = false;

      (async () => {
        try {
          for await (const a of generator(a1)) {
            if (unsubbed) {
              return;
            }

            sub.next(a);
          }
        } catch (error) {
          sub.error(error);
          unsubbed = true;
        }
      })().then(() => {
        if (!unsubbed) {
          sub.complete();
        }
      });

      return () => {
        unsubbed = true;
      };
    });
}
