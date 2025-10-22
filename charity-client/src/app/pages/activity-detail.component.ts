import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../services/api.service';
import { Activity } from '../models/activity';
import { Registration } from '../models/registration';
import { WeatherData } from '../models/weather';
import { NavbarComponent } from '../components/navbar.component';
import { FooterComponent } from '../components/footer.component';

@Component({
  selector: 'app-activity-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, NavbarComponent, FooterComponent],
  template: `
    <app-navbar></app-navbar> <!-- 新增：导航栏 -->
    <div class="container">
      <!-- 回到首页链接 -->
      <a routerLink="/" class="back-link">← Back to Events</a>

      <!-- 加载中提示 -->
      @if (isLoading()) {
        <p>Loading activity details...</p>
      }

      <!-- 活动详情 -->
      @if (activity(); as act) {
        <div class="activity-detail">
          <h1>{{ act.title }}</h1>

          <div class="info-grid">
            <div class="info-item">
              <span class="label">Category:</span>
              <span>{{ act.category_name || 'Uncategorized' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Date:</span>
              <span>{{ act.date | date:'MMMM d, yyyy - HH:mm' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Location:</span>
              <span>{{ act.location }}</span>
            </div>
          </div>

          <div class="description">
            <h3>About this event:</h3>
            <p>{{ act.description }}</p>
          </div>

          <!-- 天气信息 -->
          @if (weatherData) {
            <div class="weather">
              <h3>Weather on Event Day:</h3>
              <p>{{ getWeatherDesc(weatherData.daily.weather_code[0]) }}</p>
              <p>Temperature: {{ weatherData.daily.temperature_2m_min[0] }}°C ~ {{ weatherData.daily.temperature_2m_max[0] }}°C</p>
            </div>
          }

          <!-- 报名按钮 -->
          <a [routerLink]="['/register', act.id]" class="register-btn">Register for this Event</a>
        </div>

        <!-- 报名记录 -->
        <div class="registrations">
          <h2>Registration List ({{ registrations().length }})</h2>
          @if (registrations().length > 0) {
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Tickets</th>
                  <th>Registration Date</th>
                </tr>
              </thead>
              <tbody>
                @for (reg of registrations(); track reg.id) {
                  <tr>
                    <td>{{ reg.user_name }}</td>
                    <td>{{ reg.user_email }}</td>
                    <td>{{ reg.ticket_quantity }}</td>
                    <td>{{ reg.registration_date | date:'MMM d, yyyy' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          } @else {
            <p>No one has registered yet.</p>
          }
        </div>
      }

      <!-- 错误提示 -->
      @if (errorMessage()) {
        <p class="error">{{ errorMessage() }}</p>
      }
    </div>
    <app-footer></app-footer> <!-- 新增：页脚 -->
  `,
  styles: [`
    .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
    .back-link { display: inline-block; margin: 10px 0; color: #3498db; text-decoration: none; }
    .activity-detail { margin: 30px 0; }
    .info-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
    .info-item { background: #f8f9fa; padding: 10px; border-radius: 4px; }
    .label { font-weight: bold; margin-right: 8px; }
    .description { margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 4px; }
    .weather { margin: 20px 0; padding: 15px; background: #e3f2fd; border-radius: 4px; }
    .register-btn { display: inline-block; margin: 20px 0; padding: 10px 20px; background: #2ecc71; color: white; text-decoration: none; border-radius: 4px; }
    .register-btn:hover { background: #27ae60; }
    .registrations { margin: 40px 0; }
    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
    th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
    th { background: #f2f2f2; }
    .error { color: #e74c3c; font-weight: bold; }
  `]
})
export class ActivityDetailComponent implements OnInit {
  // 信号状态管理
  activity = signal<Activity | null>(null);
  registrations = signal<Registration[]>([]);
  weatherData?: WeatherData;
  isLoading = signal(true);
  errorMessage = signal('');

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute, // 用于获取URL中的活动ID
    private router: Router
  ) {}

  ngOnInit() {
    // 从URL参数中获取活动ID（如/activity/1中的1）
    const activityId = this.route.snapshot.paramMap.get('id');
    if (!activityId) {
      this.errorMessage.set('Invalid activity ID');
      this.isLoading.set(false);
      return;
    }

    // 调用API获取活动详情和报名记录
    this.apiService.getActivityDetail(Number(activityId)).subscribe({
      next: (data) => {
        this.activity.set(data.activity);
        this.registrations.set(data.registrations);
        this.isLoading.set(false);

        // 获取该活动地点的天气（这里简化为悉尼经纬度，后续可扩展为按地点动态获取）
        this.apiService.getWeather(-33.87, 151.21).subscribe(weather => {
          this.weatherData = weather;
        });
      },
      error: (err) => {
        this.errorMessage.set('Failed to load activity details');
        this.isLoading.set(false);
        console.error(err);
      }
    });
  }

  // 天气代码转描述
  getWeatherDesc(code: number): string {
    return this.apiService.getWeatherDescription(code);
  }
}
