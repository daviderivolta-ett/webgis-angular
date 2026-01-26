/** Dependencies */
import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

/** Models */
import { User } from '../models';

/** Services */
import { AuthService } from '../services';

/** Guard */
export const authGuard: CanMatchFn = async () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const user: User | null = authService.user();    
    return user ? true : router.createUrlTree(['/']);
}