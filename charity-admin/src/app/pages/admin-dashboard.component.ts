import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminNavbarComponent } from '../components/admin-navbar.component';
import { ApiService } from '../services/api.service';
import { Activity } from '../models/activity';
import { Registration } from '../models/registration';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, AdminNavbarComponent],
  template: `
    <app-admin-navbar></app-admin-navbar>
    <div class="container">
      <h1>Dashboard Overview</h1>

      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Events</h3>
          <p class="stat-value">{{ totalEvents() }}</p>
          <a routerLink="/admin/activities" class="view-link">Manage Events →</a>
        </div>
        <div class="stat-card">
          <h3>Total Registrations</h3>
          <p class="stat-value">{{ totalRegistrations() }}</p>
          <a routerLink="/admin/registrations" class="view-link">Manage Registrations →</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; margin: 30px 0; }
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 30px; }
    .stat-card { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); text-align: center; }
    .stat-value { font-size: 3em; font-weight: bold; color: #3498db; margin: 15px 0; }
    .view-link { display: inline-block; margin-top: 10px; color: #3498db; text-decoration: none; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  totalEvents = signal(0);
  totalRegistrations = signal(0);

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    // 获取活动总数
    this.apiService.getActivities().subscribe(activities => {
      this.totalEvents.set(activities.length);
    });

    // 简单计算所有活动的报名总数（实际项目可优化为后端直接返回统计）
    this.apiService.getActivities().subscribe(activities => {
      let total = 0;
      activities.forEach(act => {
        this.apiService.getActivityDetail(act.id).subscribe(data => {
          total += data.registrations.length;
          this.totalRegistrations.set(total);
        });
      });
    });
  }
}
