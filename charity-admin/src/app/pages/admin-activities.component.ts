import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminNavbarComponent } from '../components/admin-navbar.component';
import { ApiService } from '../services/api.service';
import { Activity, Category } from '../models/activity';

@Component({
  selector: 'app-admin-activities',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, AdminNavbarComponent],
  template: `
    <app-admin-navbar></app-admin-navbar>
    <div class="container">
      <div class="page-header">
        <h1>Manage Events</h1>
        <button class="add-btn" (click)="openAddModal()">+ Add New Event</button>
      </div>

      <!-- 活动列表 -->
      <div class="activities-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Category</th>
              <th>Date</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            @for (activity of activities(); track activity.id) {
              <tr>
                <td>{{ activity.id }}</td>
                <td>{{ activity.title }}</td>
                <td>{{ activity.category_name || 'Uncategorized' }}</td>
                <td>{{ activity.date | date:'MMM d, yyyy' }}</td>
                <td>{{ activity.location }}</td>
                <td class="actions">
                  <button class="edit-btn" (click)="openEditModal(activity)">Edit</button>
                  <button class="delete-btn" (click)="deleteActivity(activity.id)">Delete</button>
                </td>
              </tr>
            }
            @empty {
              <tr>
                <td colspan="6" class="no-data">No events found</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- 新增/编辑活动弹窗 -->
      @if (isModalOpen()) {
        <div class="modal-backdrop" (click)="closeModal()">
          <div class="modal" (click)="$event.stopPropagation()">
            <div class="modal-header">
              <h2>{{ isEditing() ? 'Edit Event' : 'Add New Event' }}</h2>
              <button class="close-btn" (click)="closeModal()">×</button>
            </div>
            <div class="modal-body">
              <form (ngSubmit)="saveActivity()">
                <div class="form-group">
                  <label>Title *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.title"
                    name="title"
                    required
                    placeholder="Enter event title"
                  >
                </div>

                <div class="form-group">
                  <label>Description *</label>
                  <textarea
                    [(ngModel)]="formData.description"
                    name="description"
                    required
                    rows="4"
                    placeholder="Enter event description"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>Date & Time *</label>
                  <input
                    type="datetime-local"
                    [(ngModel)]="formData.date"
                    name="date"
                    required
                  >
                </div>

                <div class="form-group">
                  <label>Location *</label>
                  <input
                    type="text"
                    [(ngModel)]="formData.location"
                    name="location"
                    required
                    placeholder="Enter event location"
                  >
                </div>

                <div class="form-group">
                  <label>Category *</label>
                  <select
                    [(ngModel)]="formData.category_id"
                    name="category_id"
                    required
                  >
                    <option value="">Select category</option>
                    @for (category of categories(); track category.id) {
                      <option value="{{ category.id }}">{{ category.category_name }}</option>
                    }
                  </select>
                </div>

                <div class="form-actions">
                  <button type="button" class="cancel-btn" (click)="closeModal()">Cancel</button>
                  <button type="submit" class="save-btn">Save</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      }

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
    .page-header { display: flex; justify-content: space-between; align-items: center; margin: 20px 0; }
    .add-btn { padding: 8px 16px; background: #2ecc71; color: white; border: none; border-radius: 4px; cursor: pointer; }

    .activities-table { margin: 30px 0; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f2f2f2; }
    .no-data { text-align: center; color: #7f8c8d; padding: 30px; }
    .actions { display: flex; gap: 10px; }
    .edit-btn { background: #3498db; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }
    .delete-btn { background: #e74c3c; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }

    /* 弹窗样式 */
    .modal-backdrop { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
    .modal { background: white; width: 500px; max-width: 90%; border-radius: 8px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
    .modal-header { padding: 15px 20px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; }
    .close-btn { background: none; border: none; font-size: 1.5em; cursor: pointer; }
    .modal-body { padding: 20px; }
    .form-group { margin-bottom: 15px; }
    label { display: block; margin-bottom: 5px; font-weight: bold; }
    input, textarea, select { width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; }
    .form-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; }
    .cancel-btn { padding: 8px 16px; background: #95a5a6; color: white; border: none; border-radius: 4px; cursor: pointer; }
    .save-btn { padding: 8px 16px; background: #3498db; color: white; border: none; border-radius: 4px; cursor: pointer; }

    /* 消息提示 */
    .message { position: fixed; top: 20px; right: 20px; padding: 15px 20px; border-radius: 4px; color: white; z-index: 1001; }
    .success { background: #2ecc71; }
    .error { background: #e74c3c; }
    .close-msg { background: none; border: none; color: white; margin-left: 15px; cursor: pointer; }
  `]
})
export class AdminActivitiesComponent implements OnInit {
  // 状态管理
  activities = signal<Activity[]>([]);
  categories = signal<Category[]>([]);
  isModalOpen = signal(false);
  isEditing = signal(false);
  message = signal('');
  messageType = signal<'success' | 'error'>('success');

  // 表单数据
  formData: Omit<Activity, 'id' | 'category_name'> = {
    title: '',
    description: '',
    date: '',
    location: '',
    category_id: 0
  };
  currentActivityId = 0; // 编辑时保存当前活动ID

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadActivities();
    this.loadCategories();
  }

  // 加载所有活动
  loadActivities() {
    this.apiService.getActivities().subscribe(activities => {
      this.activities.set(activities);
    });
  }

  // 加载所有分类
  loadCategories() {
    this.apiService.getCategories().subscribe(categories => {
      this.categories.set(categories);
    });
  }

  // 打开新增活动弹窗
  openAddModal() {
    this.isEditing.set(false);
    this.formData = { title: '', description: '', date: '', location: '', category_id: 0 };
    this.isModalOpen.set(true);
  }

  // 打开编辑活动弹窗
  openEditModal(activity: Activity) {
    this.isEditing.set(true);
    this.currentActivityId = activity.id;
    this.formData = {
      title: activity.title,
      description: activity.description,
      date: activity.date, // 直接使用ISO格式日期
      location: activity.location,
      category_id: activity.category_id
    };
    this.isModalOpen.set(true);
  }

  // 关闭弹窗
  closeModal() {
    this.isModalOpen.set(false);
  }

  // 保存活动（新增或编辑）
  saveActivity() {
    if (this.isEditing()) {
      // 编辑活动
      this.apiService.updateActivity(this.currentActivityId, this.formData).subscribe({
        next: () => {
          this.showMessage('Event updated successfully', 'success');
          this.loadActivities(); // 刷新列表
          this.closeModal();
        },
        error: () => this.showMessage('Failed to update event', 'error')
      });
    } else {
      // 新增活动
      this.apiService.createActivity(this.formData).subscribe({
        next: () => {
          this.showMessage('Event created successfully', 'success');
          this.loadActivities(); // 刷新列表
          this.closeModal();
        },
        error: () => this.showMessage('Failed to create event', 'error')
      });
    }
  }

  // 删除活动
  deleteActivity(id: number) {
    if (confirm('Are you sure you want to delete this event?')) {
      this.apiService.deleteActivity(id).subscribe({
        next: () => {
          this.showMessage('Event deleted successfully', 'success');
          this.loadActivities(); // 刷新列表
        },
        error: () => this.showMessage('Failed to delete event', 'error')
      });
    }
  }

  // 显示提示消息
  showMessage(text: string, type: 'success' | 'error') {
    this.message.set(text);
    this.messageType.set(type);
    // 3秒后自动关闭消息
    setTimeout(() => this.clearMessage(), 3000);
  }

  // 清除提示消息
  clearMessage() {
    this.message.set('');
  }
}
