/** Dependencies */
import { inject } from '@angular/core';
import { CanMatchFn, Router } from '@angular/router';

/** Services */
import { AuthService } from '../services';

/** Guard */
export const authGuard: CanMatchFn = async () => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const user: Record<string, any> | null = authService.user();
    return user ? true : router.createUrlTree(['/']);
}