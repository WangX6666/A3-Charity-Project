import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="admin-navbar">
      <div class="container">
        <a routerLink="/admin" class="logo">Admin Dashboard</a>
        <div class="nav-links">
          <a routerLink="/admin/activities" routerLinkActive="active">Manage Events</a>
          <a routerLink="/admin/registrations" routerLinkActive="active">Manage Registrations</a>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .admin-navbar { background: #34495e; color: white; padding: 15px 0; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; display: flex; justify-content: space-between; align-items: center; }
    .logo { color: white; text-decoration: none; font-size: 1.5em; font-weight: bold; }
    .nav-links { display: flex; gap: 20px; }
    .nav-links a { color: white; text-decoration: none; padding: 5px 0; }
    .nav-links a.active { border-bottom: 2px solid #3498db; }
  `]
})
export class AdminNavbarComponent {}
