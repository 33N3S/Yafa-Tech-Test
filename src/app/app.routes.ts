import { Routes } from '@angular/router';
import { EmployeeListComponent } from './views/employee-list/employee-list.component';
import { LoginComponent } from './views/login/login.component';

export const routes: Routes = [
    { path: 'employees', component: EmployeeListComponent },
    { path:'', component: LoginComponent }
];
