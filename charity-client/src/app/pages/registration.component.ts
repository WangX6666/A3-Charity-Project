import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 用于表单双向绑定
import { ApiService } from '../services/api.service';
import { Activity } from '../models/activity';
import { NavbarComponent } from '../components/navbar.component';
import { FooterComponent } from '../components/footer.component';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar> <!-- 新增：导航栏 -->
    <div class="container">
      <!-- 导航链接 -->
      <a routerLink="/" class="back-link">← Back to Events</a>
      @if (activity(); as act) {
        <a [routerLink]="['/activity', act.id]" class="detail-link">← Back to Event Details</a>
      }

      <!-- 加载中提示 -->
      @if (isLoading()) {
        <p>Loading event information...</p>
      }

      <!-- 报名表单 -->
      @if (activity(); as act) {
        <div class="registration-form">
          <h1>Register for: {{ act.title }}</h1>
          <p class="event-date">Date: {{ act.date | date:'MMMM d, yyyy - HH:mm' }}</p>

          <form (ngSubmit)="submitForm()" #regForm="ngForm">
            <div class="form-group">
              <label for="name">Full Name *</label>
              <input
                type="text"
                id="name"
                [(ngModel)]="formData.user_name"
                name="name"
                required
                placeholder="Enter your full name"
              >
            </div>

            <div class="form-group">
              <label for="email">Email Address *</label>
              <input
                type="email"
                id="email"
                [(ngModel)]="formData.user_email"
                name="email"
                required
                placeholder="Enter your email"
              >
            </div>

            <div class="form-group">
              <label for="phone">Phone Number (Optional)</label>
              <input
                type="tel"
                id="phone"
                [(ngModel)]="formData.phone"
                name="phone"
                placeholder="Enter your phone number"
              >
            </div>

            <div class="form-group">
              <label for="tickets">Number of Tickets *</label>
              <input
                type="number"
                id="tickets"
                [(ngModel)]="formData.ticket_quantity"
                name="tickets"
                required
                min="1"
                value="1"
              >
            </div>

            <div class="form-actions">
              <button type="submit" [disabled]="!regForm.form.valid || isSubmitting()">
                @if (isSubmitting()) {
                  Processing...
                } @else {
                  Complete Registration
                }
              </button>
            </div>
          </form>

          <!-- 提交结果提示 -->
          @if (successMessage()) {
            <div class="success-message">
              ✅ {{ successMessage() }}<br>
              <a [routerLink]="['/activity', act.id]" class="link">View registration list →</a>
            </div>
          }

          @if (errorMessage()) {
            <div class="error-message">
              ⚠️ {{ errorMessage() }}
            </div>
          }
        </div>
      }

      <!-- 错误提示 -->
      @if (errorMessage() && !activity()) {
        <p class="error">{{ errorMessage() }}</p>
      }
    </div>
    <app-footer></app-footer> <!-- 新增：页脚 -->
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .back-link, .detail-link { display: inline-block; margin: 10px 15px 10px 0; color: #3498db; text-decoration: none; }
    .registration-form { margin: 30px 0; padding: 30px; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .event-date { color: #666; margin: 10px 0 20px; }
    .form-group { margin-bottom: 20px; }
    label { display: block; margin-bottom: 8px; font-weight: bold; color: #333; }
    input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; font-size: 1em; }
    input:invalid { border-color: #e74c3c; }
    .form-actions { margin-top: 30px; }
    button { padding: 12px 20px; background: #3498db; color: white; border: none; border-radius: 4px; font-size: 1em; cursor: pointer; }
    button:disabled { background: #bdc3c7; cursor: not-allowed; }
    .success-message { margin-top: 20px; padding: 15px; background: #eafaf1; color: #27ae60; border-radius: 4px; }
    .error-message { margin-top: 20px; padding: 15px; background: #fdedeb; color: #e74c3c; border-radius: 4px; }
    .link { color: #3498db; text-decoration: none; font-weight: bold; }
  `]
})
export class RegistrationComponent implements OnInit {
  // 表单数据
  formData = {
    activity_id: 0,
    user_name: '',
    user_email: '',
    phone: '',
    ticket_quantity: 1
  };

  // 状态管理
  activity = signal<Activity | null>(null);
  isLoading = signal(true);
  isSubmitting = signal(false);
  successMessage = signal('');
  errorMessage = signal('');

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    // 获取URL中的活动ID
    const activityId = this.route.snapshot.paramMap.get('id');
    if (!activityId) {
      this.errorMessage.set('Invalid event ID');
      this.isLoading.set(false);
      return;
    }

    // 保存活动ID到表单数据
    this.formData.activity_id = Number(activityId);

    // 获取活动信息（用于显示活动标题和日期）
    this.apiService.getActivityDetail(Number(activityId)).subscribe({
      next: (data) => {
        this.activity.set(data.activity);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.errorMessage.set('Failed to load event information');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  // 提交表单
  submitForm() {
    this.isSubmitting.set(true);
    this.successMessage.set('');
    this.errorMessage.set('');

    // 调用API提交报名
    this.apiService.submitRegistration(this.formData).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.isSubmitting.set(false);
        // 清空表单（可选）
        this.formData.user_name = '';
        this.formData.user_email = '';
        this.formData.phone = '';
        this.formData.ticket_quantity = 1;
      },
      error: (err) => {
        // 显示错误信息（后端返回的message或默认提示）
        this.errorMessage.set(err.error?.message || 'Registration failed. Please try again.');
        this.isSubmitting.set(false);
      }
    });
  }
}
