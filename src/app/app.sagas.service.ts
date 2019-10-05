import { Injectable } from '@angular/core';
import { SagaService } from './services/saga.service';
import { Action, ActionCreator, Creator } from '@ngrx/store';
import {
  loadUser,
  showSpinner,
  hideSpinner,
  loadUserSuccess,
  notifyError,
  loadPostsSuccess
} from './app.effects';
import { UsersService } from './services/users.service';
import { PostsService } from './services/posts.service';

export function isType<V extends Action>(
  action: Action,
  ...allowedTypes: Array<string | ActionCreator<string, Creator>>
): boolean;
export function isType(
  action: Action,
  ...allowedTypes: Array<string | ActionCreator<string, Creator>>
): boolean {
  return allowedTypes.some(typeOrActionCreator => {
    if (typeof typeOrActionCreator === 'string') {
      // Comparing the string to type
      return typeOrActionCreator === action.type;
    }

    // We are filtering by ActionCreator
    return typeOrActionCreator.type === action.type;
  });
}

@Injectable({
  providedIn: 'root'
})
export class AppSagasService {
  constructor(
    sagas: SagaService,
    usersService: UsersService,
    postsService: PostsService
  ) {
    sagas.saga(async (action, dispatch) => {
      if (isType(action, loadUser)) {
        try {
          dispatch(showSpinner());

          const user = await usersService.getUser().toPromise();
          const permissions = await usersService
            .getPermissions(user.id)
            .toPromise();

          dispatch(loadUserSuccess({ user, permissions }));

          if (permissions.includes('posts:read')) {
            dispatch(
              loadPostsSuccess({
                posts: await postsService.getPosts().toPromise()
              })
            );
          }
        } catch (error) {
          dispatch(notifyError(error));
        } finally {
          dispatch(hideSpinner());
        }
      }
    });
  }
}
