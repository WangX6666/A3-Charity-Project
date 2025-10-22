import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'; // 用于路由链接

@Component({
  selector: 'app-navbar', // 组件选择器，用于在其他组件中引用
  standalone: true,
  imports: [CommonModule, RouterModule], // 依赖模块
  template: `
    <nav class="navbar">
      <div class="container">
        <!-- 网站名称（链接到首页） -->
        <a routerLink="/" class="logo">Charity Events</a>

        <!-- 导航链接 -->
        <div class="nav-links">
          <a routerLink="/" routerLinkActive="active">Home</a>
          <!-- 后续可添加其他导航项，如"About"等 -->
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .navbar { background: #2c3e50; color: white; padding: 15px 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
    .logo { color: white; text-decoration: none; font-size: 1.5em; font-weight: bold; }
    .nav-links { display: flex; gap: 20px; }
    .nav-links a { color: white; text-decoration: none; padding: 5px 0; }
    .nav-links a.active { border-bottom: 2px solid #3498db; } /* 激活状态样式 */
  `]
})
export class NavbarComponent {}
