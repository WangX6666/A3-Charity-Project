import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer', // 组件选择器
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <p>&copy; 2025 Charity Events. All rights reserved.</p>
          <p>Contact: info@charityevents.example.com</p>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .footer { background: #2c3e50; color: white; padding: 30px 0; margin-top: 50px; }
    .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
    .footer-content { text-align: center; line-height: 1.6; }
  `]
})
export class FooterComponent {}
