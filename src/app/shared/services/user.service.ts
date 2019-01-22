import { Injectable } from "@angular/core";
import { Store } from "@ngrx/store";
import {
  SET_LATEST_SESSION,
  LatestSession
} from "../../state/latest-session.reducer";
import { AuthenticationService } from "../../core/authentication/authentication-service";
import { User } from "chipster-js-common";
import log from "loglevel";
import { Observable } from "rxjs/Observable";
import { SessionResource } from "../resources/session.resource";

@Injectable()
export class UserService {
  constructor(
    private store: Store<any>,
    private authenticationService: AuthenticationService,
    private sessionResource: SessionResource
  ) {}

  public updateLatestSession(sessionId: string, sourceSessionId?: string) {
    this.updateLatestSessionToStore(sessionId, sourceSessionId);
    this.updateLatestSessionToSessionDb(sessionId);
  }

  private updateLatestSessionToStore(
    sessionId: string,
    sourceSessionId?: string
  ) {
    if (sourceSessionId) {
      this.store.dispatch({
        type: SET_LATEST_SESSION,
        payload: { sessionId: sessionId, sourceSessionId: sourceSessionId }
      });
    } else {
      this.store.dispatch({
        type: SET_LATEST_SESSION,
        payload: { sessionId: sessionId }
      });
    }
  }

  private updateLatestSessionToSessionDb(sessionId: string) {
    // FIXME only update if changed?
    this.authenticationService
      .getUser()
      .mergeMap((user: User) => {
        user.latestSession = sessionId;
        return this.authenticationService.updateUser(user);
      })
      .subscribe(
        () => {
          log.info("update latest session to sessionDb successful");
        },
      err => {
          // maybe log is enough
          log.warn("updating latest session to sessionDb failed");
        }
      );
  }

  getLatestSession(): Observable<string> {
    let sessions;
    return this.sessionResource
      .getSessions() // sessions are needed to check if possibly found latest session still exists
      .do(s => (sessions = s))
      .mergeMap(() => {
        return this.getLatestSessionFromStore().mergeMap(
          (latestSession: LatestSession) => {
            // valid id from store?
            const idFromStore = latestSession.sessionId;
            if (
              idFromStore &&
              sessions.some(session => session.sessionId === idFromStore)
            ) {
              log.info("found valid latest session id from store", idFromStore);
              return Observable.of(idFromStore);
            } else {
              // valid source session id from store?
              const sourceSessionIdFromStore = latestSession.sourceSessionId;
              if (
                sourceSessionIdFromStore &&
                sessions.some(
                  session => session.sessionId === sourceSessionIdFromStore
                )
              ) {
                log.info(
                  "found valid source session id from store",
                  sourceSessionIdFromStore
                );
                return Observable.of(sourceSessionIdFromStore);
              } else {
                // valid id from session db?
                return this.getLatestSessionFromSessionDb().mergeMap(
                  (idFromSessionDb: string) => {
                    if (
                      idFromSessionDb !== null &&
                      sessions.some(
                        session => session.sessionId === idFromSessionDb
                      )
                    ) {
                      log.info(
                        "found valid latest session id from sessionDb",
                        idFromSessionDb
                      );
                      return Observable.of(idFromSessionDb);
                    } else {
                      log.info("no valid latest session id in sessionDb");
                      return Observable.of(null);
                    }
                  }
                );
              }
            }
          }
        );
      });
  }

  getLatestSessionFromStore(): Observable<LatestSession> {
    return this.store.select("latestSession").take(1);
  }

  getLatestSessionFromSessionDb(): Observable<string> {
    return this.authenticationService.getUser().map((user: User) => {
      return user.latestSession;
    });
  }
}
