import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const goToInGuard: CanActivateFn = (route, state) => {
  let router=inject(Router)
  if(localStorage.getItem('authToken')){
   return true
  }else{
    return router.parseUrl('/login')
  }
};
