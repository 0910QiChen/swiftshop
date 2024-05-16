import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { SignupComponent } from './pages/signup/signup.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { HistoryComponent } from './pages/history/history.component';
import { CartComponent } from './pages/cart/cart.component';

export const routes: Routes = [
    {
        path: '', redirectTo: 'login', pathMatch :'full'
    },
    {
        path: 'login', component:LoginComponent
    },
    {
        path: 'signup', component:SignupComponent
    },
    { 
        path: 'dashboard', component: DashboardComponent
    },
    {
        path: 'history', component: HistoryComponent
    },
    {
        path: 'cart', component: CartComponent
    },
];
