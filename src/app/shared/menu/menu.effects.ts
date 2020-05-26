import { ActivatedRoute } from '@angular/router';
import { MenuSection } from './menu.reducer';
import { hasNoValue, hasValue } from '../empty.util';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { MenuService } from './menu.service';
import { Observable } from 'rxjs/internal/Observable';
import { Action } from '@ngrx/store';
import { ROUTER_NAVIGATED } from '@ngrx/router-store';
import { Injectable } from '@angular/core';
import { map, take, tap } from 'rxjs/operators';
import { MenuID } from './initial-menus-state';

@Injectable()
export class MenuEffects {

  constructor(private actions$: Actions,
              private menuService: MenuService,
              private route: ActivatedRoute) {
  }

  @Effect({ dispatch: false })
  public buildRouteMenuSections$: Observable<Action> = this.actions$
    .pipe(
      ofType(ROUTER_NAVIGATED),
      tap(() => {
        Object.values(MenuID).forEach((menuID) => {
          this.buildRouteMenuSections(menuID);
        });
      })
    );

  buildRouteMenuSections(menuID: MenuID) {
    this.menuService.getNonPersistentMenuSections(menuID).pipe(
      map((sections) => sections.map((section) => section.id)),
      take(1)
    ).subscribe((shouldNotPersistIDs: string[]) => {
      const resolvedSections = this.resolveRouteMenuSections(this.route.root, menuID);
      resolvedSections.forEach((section) => {
        const index = shouldNotPersistIDs.indexOf(section.id);
        if (index > -1) {
          shouldNotPersistIDs.splice(index, 1);
        } else {
          this.menuService.addSection(menuID, section);
        }
      });
      shouldNotPersistIDs.forEach((id) => {
        this.menuService.removeSection(menuID, id);
      });
    });
  }

  /**
   * Resolve menu sections defined in the current route data (including parent routes)
   * @param route   The route to resolve data for
   * @param menuID  The menu to resolve data for
   */
  resolveRouteMenuSections(route: ActivatedRoute, menuID: MenuID): MenuSection[] {
    const data = route.snapshot.data;
    const last: boolean = hasNoValue(route.firstChild);

    if (hasValue(data) && hasValue(data.menu) && hasValue(data.menu[menuID])) {
      if (!last) {
        return [...data.menu[menuID], ...this.resolveRouteMenuSections(route.firstChild, menuID)]
      } else {
        return [...data.menu[menuID]];
      }
    }

    return !last ? this.resolveRouteMenuSections(route.firstChild, menuID) : [];
  }

}
