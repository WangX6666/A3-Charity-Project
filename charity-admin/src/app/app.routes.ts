import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './pages/admin-dashboard.component';
import { AdminActivitiesComponent } from './pages/admin-activities.component';
import { AdminRegistrationsComponent } from './pages/admin-registrations.component';

export const routes: Routes = [
  { path: 'admin', component: AdminDashboardComponent },
  { path: 'admin/activities', component: AdminActivitiesComponent },
  { path: 'admin/registrations', component: AdminRegistrationsComponent },
  { path: '', redirectTo: '/admin', pathMatch: 'full' },
  { path: '**', redirectTo: '/admin' }
];
