/** Dependencies */
import { inject } from '@angular/core'
import { CanMatchFn, Route, Router } from '@angular/router'

/** Models */
import { User } from '../models'

/** Services */
import { AuthService } from '../services'

/** Guard */
export const editorGuard: CanMatchFn = async (route: Route) => {
    const router = inject(Router);
    const authService = inject(AuthService);
    const user: User | null = authService.user();
    const requiredRole: string | undefined = route.data?.['requiredRole'];
    if (!requiredRole) return router.createUrlTree(['/']);
    if (user && user.roles.includes(requiredRole)) return true;
    return router.createUrlTree(['/']);
}