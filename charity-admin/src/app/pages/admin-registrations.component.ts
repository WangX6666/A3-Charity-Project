import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../components/admin-navbar.component';
import { ApiService } from '../services/api.service';
import { Activity } from '../models/activity';
import { Registration } from '../models/registration';

@Component({
  selector: 'app-admin-registrations',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminNavbarComponent],
  template: `
    <app-admin-navbar></app-admin-navbar>
    <div class="container">
      <h1>Manage Registrations</h1>

      <!-- 活动筛选下拉框 -->
      <div class="filter-container">
        <label>Filter by Event:</label>
        <select
          [(ngModel)]="selectedActivityId"
          name="activity"
          (change)="loadRegistrations()"
        >
          <option value="">All Events</option>
          @for (activity of activities(); track activity.id) {
            <option value="{{ activity.id }}">{{ activity.title }}</option>
          }
        </select>
      </div>

      <!-- 报名记录表格 -->
      <div class="registrations-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Event</th>
              <th>Name</th>
              <th>Email</th>
              <th>Tickets</th>
              <th>Registration Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (reg of registrations(); track reg.id) {
              <tr>
                <td>{{ reg.id }}</td>
                <td>{{ getActivityTitle(reg.activity_id) }}</td>
                <td>{{ reg.user_name }}</td>
                <td>{{ reg.user_email }}</td>
                <td>{{ reg.ticket_quantity }}</td>
                <td>{{ reg.registration_date | date:'MMM d, yyyy' }}</td>
                <td>
                  <button class="delete-btn" (click)="deleteRegistration(reg.id)">
                    Delete
                  </button>
                </td>
              </tr>
            }
            @empty {
              <tr>
                <td colspan="7" class="no-data">No registrations found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- 提示消息 -->
      @if (message()) {
        <div class="message {{ messageType() }}">
          {{ message() }}
          <button class="close-msg" (click)="clearMessage()">×</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    h1 { color: #2c3e50; margin: 20px 0; }

    .filter-container { margin: 20px 0; }
    select { padding: 8px; border: 1px solid #ddd; border-radius: 4px; min-width: 250px; }

    .registrations-table { margin: 30px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f2f2f2; }
    .no-data { text-align: center; color: #7f8c8d; padding: 30px; }
    .delete-btn { background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }

    /* 消息提示 */
    .message { position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 4px; color: white; z-index: 1001; }
    .success { background: #2ecc71; }
    .error { background: #e74c3c; }
    .close-msg { background: none; border: none; color: white; margin-left: 15px; cursor: pointer; }
  `]
})
export class AdminRegistrationsComponent implements OnInit {
  // 状态管理
  activities = signal<Activity[]>([]);
  registrations = signal<Registration[]>([]);
  selectedActivityId = ''; // 筛选的活动ID（空表示所有）
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadActivities(); // 加载所有活动（用于筛选下拉框）
    this.loadRegistrations(); // 加载所有报名记录
  }

  // 加载所有活动（用于筛选下拉框显示活动名称）
  loadActivities() {
    this.apiService.getActivities().subscribe(activities => {
      this.activities.set(activities);
    });
  }

  // 加载报名记录（支持按活动筛选）
  loadRegistrations() {
    if (this.selectedActivityId) {
      // 按选中的活动ID加载报名记录
      this.apiService.getActivityDetail(Number(this.selectedActivityId)).subscribe({
        next: (data) => {
          this.registrations.set(data.registrations);
        },
        error: () => this.showMessage('Failed to load registrations', 'error')
      });
    } else {
      // 加载所有活动的报名记录（合并数据）
      let allRegistrations: Registration[] = [];
      this.apiService.getActivities().subscribe(activities => {
        activities.forEach(activity => {
          this.apiService.getActivityDetail(activity.id).subscribe(data => {
            allRegistrations = [...allRegistrations, ...data.registrations];
            // 按报名时间倒序排序
            allRegistrations.sort((a, b) =>
              new Date(b.registration_date).getTime() - new Date(a.registration_date).getTime()
            );
            this.registrations.set(allRegistrations);
          });
        });
      });
    }
  }

  // 根据活动ID获取活动标题（用于表格显示）
  getActivityTitle(activityId: number): string {
    const activity = this.activities().find(act => act.id === activityId);
    return activity?.title || 'Unknown Event';
  }

  // 删除报名记录
  deleteRegistration(registrationId: number) {
    if (confirm('Are you sure you want to delete this registration?')) {
      this.apiService.deleteRegistration(registrationId).subscribe({
        next: () => {
          this.showMessage('Registration deleted successfully', 'success');
          this.loadRegistrations(); // 刷新列表
        },
        error: () => this.showMessage('Failed to delete registration', 'error')
      });
    }
  }

  // 显示提示消息
  showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    setTimeout(() => this.clearMessage(), 3000);
  }

  // 清除提示消息
  clearMessage() {
    this.message.set('');
  }
}
