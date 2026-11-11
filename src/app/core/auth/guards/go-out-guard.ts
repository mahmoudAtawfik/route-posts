import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const goOutGuard: CanActivateFn = (route, state) => {
  let router=inject(Router)
  if(localStorage.getItem('authToken')){
    return router.parseUrl('/feed')
  }else{
    return true
  }
};
