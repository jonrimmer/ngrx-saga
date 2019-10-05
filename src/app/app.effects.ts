import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Action, createAction, props, Store } from '@ngrx/store';
import { switchMap, map, catchError, subscribeOn } from 'rxjs/operators';
import { Observable, of, concat, EMPTY, from } from 'rxjs';
import { fromActionAsync } from './from-action-async';
import { UsersService, User } from './services/users.service';
import { PostsService, Post } from './services/posts.service';
import { fromActionGenerator } from './from-action-gen';

export const loadUser = createAction('[User] Load user');
export const loadUserSuccess = createAction(
  '[User] Load user success',
  props<{ user: User; permissions: string[] }>()
);
export const loadPostsSuccess = createAction(
  '[Posts] Load posts success',
  props<{ posts: Post[] }>()
);
export const notifyError = createAction(
  '[Notifications] Error',
  props<{ error: any }>()
);
export const showSpinner = createAction('[Spinner] Show spinner');
export const hideSpinner = createAction('[Spinner] Hide spinner');

function task<T extends Action>(
  work: (a: T) => Observable<Action>
): (a: T) => Observable<Action> {
  return (a: T) =>
    concat(
      of(showSpinner()),
      work(a).pipe(catchError(error => of(notifyError(error)))),
      of(hideSpinner())
    );
}

@Injectable()
export class AppEffects {
  public initUser5$: Observable<Action>;

  initUser$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUser),
      switchMap(() =>
        concat(
          of(showSpinner()),
          this.usersService.getUser().pipe(
            switchMap(user =>
              this.usersService
                .getPermissions(user.id)
                .pipe(
                  switchMap(permissions =>
                    concat(
                      of(loadUserSuccess({ user, permissions })),
                      permissions.includes('posts:read')
                        ? this.postsService
                            .getPosts()
                            .pipe(map(posts => loadPostsSuccess({ posts })))
                        : EMPTY
                    )
                  )
                )
            ),
            catchError(error => of(notifyError(error)))
          ),
          of(hideSpinner())
        )
      )
    )
  );

  initUser2$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUser),
      switchMap(
        task(() =>
          this.usersService
            .getUser()
            .pipe(
              switchMap(user =>
                this.usersService
                  .getPermissions(user.id)
                  .pipe(
                    map(permissions => loadUserSuccess({ user, permissions }))
                  )
              )
            )
        )
      )
    )
  );

  precachePosts$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUserSuccess),
      switchMap(
        task(({ permissions }) =>
          permissions.includes('posts:read')
            ? this.postsService
                .getPosts()
                .pipe(map(posts => loadPostsSuccess({ posts })))
            : EMPTY
        )
      )
    )
  );

  public initUser3$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUser),
      switchMap(
        fromActionAsync(async (_, dispatch) => {
          try {
            dispatch(showSpinner());

            const user = await this.usersService.getUser().toPromise();
            const permissions = await this.usersService
              .getPermissions(user.id)
              .toPromise();

            dispatch(loadUserSuccess({ user, permissions }));

            if (permissions.includes('posts:read')) {
              dispatch(
                loadPostsSuccess({
                  posts: await this.postsService.getPosts().toPromise()
                })
              );
            }
          } catch (error) {
            dispatch(notifyError(error));
          } finally {
            dispatch(hideSpinner());
          }
        })
      )
    )
  );

  public initUser4$ = createEffect(() =>
    this.actions$.pipe(
      ofType(loadUser),
      switchMap(
        () =>
          new Observable<Action>(sub => {
            (async () => {
              sub.next(showSpinner());

              const user = await this.usersService.getUser().toPromise();
              const permissions = await this.usersService
                .getPermissions(user.id)
                .toPromise();

              sub.next(loadUserSuccess({ user, permissions }));

              if (permissions.includes('posts:read')) {
                sub.next(
                  loadPostsSuccess({
                    posts: await this.postsService.getPosts().toPromise()
                  })
                );
              }
            })()
              .catch(error => sub.next(notifyError(error)))
              .finally(() => sub.next(hideSpinner()));
          })
      )
    )
  );

  constructor(
    private actions$: Actions,
    private usersService: UsersService,
    private postsService: PostsService
  ) {
    async function* loadUserSaga() {
      try {
        yield showSpinner();

        const user = await usersService.getUser().toPromise();
        const permissions = await usersService
          .getPermissions(user.id)
          .toPromise();

        yield loadUserSuccess({ user, permissions });

        if (permissions.includes('posts:read')) {
          yield loadPostsSuccess({
            posts: await postsService.getPosts().toPromise()
          });
        }
      } catch (error) {
        yield notifyError(error);
      } finally {
        yield hideSpinner();
      }
    }

    this.initUser5$ = createEffect(() =>
      this.actions$.pipe(
        ofType(loadUser),
        switchMap(fromActionGenerator(loadUserSaga))
      )
    );
  }
}
