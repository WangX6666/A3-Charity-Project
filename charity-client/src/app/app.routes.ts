import { Routes } from '@angular/router';
import { HomeComponent } from './pages/home.component';
import { ActivityDetailComponent } from './pages/activity-detail.component';
import { RegistrationComponent } from './pages/registration.component'; // 新增导入

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'activity/:id', component: ActivityDetailComponent },
  { path: 'register/:id', component: RegistrationComponent }, // 新增：报名页路由
  { path: '**', redirectTo: '' }
];
