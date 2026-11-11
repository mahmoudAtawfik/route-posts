import { HttpContextToken } from '@angular/common/http';

export const SKIP_SPINNER = new HttpContextToken<boolean>(() => false);