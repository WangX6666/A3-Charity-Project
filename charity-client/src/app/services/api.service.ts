// 导入Angular核心模块和HTTP相关工具
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// 导入我们之前定义的数据模型
import { Activity } from '../models/activity';
import { Registration } from '../models/registration';
import { WeatherData } from '../models/weather';

// 标记为全局可用的服务（整个应用都能调用）
@Injectable({ providedIn: 'root' })
export class ApiService {
  // 后端API基础地址（本地开发用，后续部署到cPanel时需要替换）
  private apiBaseUrl = 'http://localhost:3000/api';
  // 天气API地址（使用open-meteo的公开接口）
  private weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';

  // 注入HttpClient，用于发送HTTP请求
  constructor(private http: HttpClient) {}

  // 1. 获取所有活动（带分类名称）
  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiBaseUrl}/activities`);
  }

  // 2. 获取单个活动详情 + 关联的报名记录
  getActivityDetail(id: number): Observable<{
    activity: Activity;
    registrations: Registration[];
  }> {
    return this.http.get<{ activity: Activity; registrations: Registration[] }>(
      `${this.apiBaseUrl}/activities/${id}`
    );
  }

  // 3. 提交活动报名
  submitRegistration(data: {
    activity_id: number;
    user_name: string;
    user_email: string;
    phone?: string;
    ticket_quantity: number;
  }): Observable<{ success: boolean; message: string }> {
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiBaseUrl}/registrations`,
      data
    );
  }

  // 4. 调用天气API（根据经纬度获取未来7天天气）
  getWeather(lat: number, lon: number): Observable<WeatherData> {
    // 构造请求参数（匹配open-meteo的要求）
    const params = new HttpParams()
      .set('latitude', lat.toString())    // 纬度（例如悉尼：-33.87）
      .set('longitude', lon.toString())   // 经度（例如悉尼：151.21）
      .set('daily', 'weather_code,temperature_2m_max,temperature_2m_min') // 需要的天气字段
      .set('timezone', 'Australia/Sydney') // 时区（澳洲悉尼）
      .set('forecast_days', '7');         // 预测7天

    return this.http.get<WeatherData>(this.weatherApiUrl, { params });
  }

  // 5. 天气代码转文字描述（参考open-meteo官方文档）
  getWeatherDescription(code: number): string {
    const weatherMap: Record<number, string> = {
      0: 'Clear sky',
      1: 'Mainly clear',
      2: 'Partly cloudy',
      3: 'Overcast',
      45: 'Fog',
      48: 'Depositing rime fog',
      51: 'Light drizzle',
      53: 'Moderate drizzle',
      55: 'Dense drizzle',
      61: 'Light rain',
      63: 'Moderate rain',
      65: 'Heavy rain',
      80: 'Light rain showers',
      81: 'Moderate rain showers',
      82: 'Violent rain showers',
      95: 'Thunderstorm'
    };
    return weatherMap[code] || 'Unknown weather';
  }

  
}
