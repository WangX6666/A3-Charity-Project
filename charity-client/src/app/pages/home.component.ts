// 导入Angular核心模块和依赖
import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common'; // 提供通用指令（如日期管道）
import { RouterModule } from '@angular/router'; // 提供路由链接功能
import { FormsModule } from '@angular/forms';   // 提供表单双向绑定
import { ApiService } from '../services/api.service'; // 导入我们创建的API服务
import { Activity } from '../models/activity';       // 导入活动模型
import { WeatherData } from '../models/weather';     // 导入天气模型
import { NavbarComponent } from '../components/navbar.component';
import { FooterComponent } from '../components/footer.component';

@Component({
  selector: 'app-home', // 组件选择器（在路由中使用）
  standalone: true,    // 独立组件，无需模块
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent, FooterComponent], // 导入依赖模块
  // 模板：页面的HTML结构
  template: `
    <app-navbar></app-navbar> <!-- 新增：导航栏 -->
    <div class="container">
      <!-- 页面标题 -->
      <header>
        <h1>Local Charity Events</h1>
      </header>

      <!-- 搜索框：用于过滤活动 -->
      <div class="search-bar">
        <input
          type="text"
          [(ngModel)]="searchQuery"
          placeholder="Search events by title..."
          (input)="filterActivities()"
        >
      </div>

      <!-- 活动列表 + 天气信息 -->
      <div class="activities-grid">
        <!-- 循环显示所有活动 -->
        @for (activity of filteredActivities(); track activity.id) {
          <div class="activity-card">
            <h3>{{ activity.title }}</h3>
            <p class="category">Category: {{ activity.category_name || 'Uncategorized' }}</p>
            <p class="date">Date: {{ activity.date | date:'MMM d, yyyy HH:mm' }}</p>
            <p class="location">Location: {{ activity.location }}</p>

            <!-- 天气信息（默认显示活动地点的天气，这里先用悉尼的经纬度示例） -->
            <div class="weather" *ngIf="weatherData">
              <p class="weather-title">Weather on Event Day:</p>
              <p>{{ getWeatherDesc(weatherData.daily.weather_code[0]) }}</p>
              <p>Temp: {{ weatherData.daily.temperature_2m_min[0] }}°C ~ {{ weatherData.daily.temperature_2m_max[0] }}°C</p>
            </div>

            <!-- 查看详情按钮：跳转到活动详情页 -->
            <a [routerLink]="['/activity', activity.id]" class="detail-link">View Details</a>
          </div>
        }
        <!-- 当没有活动时显示 -->
        @empty {
          <p>No activities found. Try a different search.</p>
        }
      </div>
    </div>
    <app-footer></app-footer> <!-- 新增：页脚 -->
  `,
  // 样式：页面的CSS
  styles: [`
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    header h1 {
      color: #2c3e50;
      text-align: center;
    }
    .search-bar {
      margin: 20px 0;
      text-align: center;
    }
    .search-bar input {
      width: 50%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    .activities-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
    .activity-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .category {
      color: #7f8c8d;
      font-size: 0.9em;
    }
    .date, .location {
      color: #34495e;
      margin: 8px 0;
    }
    .weather {
      margin: 15px 0;
      padding: 10px;
      background: #f8f9fa;
      border-radius: 4px;
    }
    .weather-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .detail-link {
      display: inline-block;
      margin-top: 15px;
      color: #3498db;
      text-decoration: none;
      font-weight: bold;
    }
    .detail-link:hover {
      text-decoration: underline;
    }
  `]
})
export class HomeComponent implements OnInit {
  // 用signal存储活动数据（Angular 16+推荐的响应式状态管理）
  activities = signal<Activity[]>([]);
  filteredActivities = signal<Activity[]>([]); // 过滤后的活动
  searchQuery = ''; // 搜索关键词
  weatherData?: WeatherData; // 天气数据

  // 注入API服务
  constructor(private apiService: ApiService) {}

  // 组件初始化时执行
  ngOnInit() {
    // 1. 从后端获取所有活动
    this.apiService.getActivities().subscribe(activities => {
      this.activities.set(activities);
      this.filteredActivities.set(activities); // 初始显示所有活动
    });

    // 2. 获取天气数据（示例：悉尼的经纬度 -33.87, 151.21）
    this.apiService.getWeather(-33.87, 151.21).subscribe(data => {
      this.weatherData = data;
    });
  }

  // 根据搜索关键词过滤活动
  filterActivities() {
    if (!this.searchQuery) {
      // 若无搜索词，显示所有活动
      this.filteredActivities.set(this.activities());
      return;
    }
    // 按活动标题过滤（不区分大小写）
    const query = this.searchQuery.toLowerCase();
    const filtered = this.activities().filter(activity =>
      activity.title.toLowerCase().includes(query)
    );
    this.filteredActivities.set(filtered);
  }

  // 调用API服务的方法，将天气代码转为文字描述
  getWeatherDesc(code: number): string {
    return this.apiService.getWeatherDescription(code);
  }
}
