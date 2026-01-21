import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { CallbackComponent } from './callback/callback.component';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'login', component: LoginComponent },
  { path: 'callback', component: CallbackComponent },
  { path: 'employees', component: EmployeeListComponent, canActivate: [authGuard] },
  // TODO: Add/Edit Components
  // { path: 'employees/add', component: EmployeeAddComponent, canActivate: [authGuard] },
  // { path: 'employees/edit/:id', component: EmployeeEditComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
