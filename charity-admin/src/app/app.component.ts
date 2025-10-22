import { Component } from '@angular/core';
import { AdminDashboardComponent } from './pages/admin-dashboard.component'; // 导入仪表盘

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [AdminDashboardComponent], // 只使用我们的仪表盘组件
  template: `<app-admin-dashboard></app-admin-dashboard>`, // 直接显示仪表盘
  styles: []
})
export class AppComponent {
  title = 'charity-admin';
}
