import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Activity, Category } from '../models/activity';
import { Registration } from '../models/registration';
import { WeatherData } from '../models/weather';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiBaseUrl = 'http://localhost:3000/api'; // 与客户端共用后端API
  private weatherApiUrl = 'https://api.open-meteo.com/v1/forecast';

  constructor(private http: HttpClient) {}

  // -------------------------- 复用客户端接口 --------------------------
  getActivities(): Observable<Activity[]> {
    return this.http.get<Activity[]>(`${this.apiBaseUrl}/activities`);
  }

  getActivityDetail(id: number): Observable<{
    activity: Activity;
    registrations: Registration[];
  }> {
    return this.http.get<{ activity: Activity; registrations: Registration[] }>(
      `${this.apiBaseUrl}/activities/${id}`
    );
  }

  // -------------------------- 管理员专属接口（新增） --------------------------
  // 1. 获取所有活动分类
  getCategories(): Observable<Category[]> {
    return this.http.get<Category[]>(`${this.apiBaseUrl}/categories`);
  }

  // 2. 新增活动
  createActivity(activity: Omit<Activity, 'id' | 'category_name'>): Observable<Activity> {
    return this.http.post<Activity>(`${this.apiBaseUrl}/activities`, activity);
  }

  // 3. 编辑活动
  updateActivity(id: number, activity: Omit<Activity, 'id' | 'category_name'>): Observable<Activity> {
    return this.http.put<Activity>(`${this.apiBaseUrl}/activities/${id}`, activity);
  }

  // 4. 删除活动
  deleteActivity(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiBaseUrl}/activities/${id}`);
  }

  // 5. 删除报名记录
  deleteRegistration(id: number): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiBaseUrl}/registrations/${id}`);
  }

  // 天气相关接口（复用）
  getWeather(lat: number, lon: number): Observable<WeatherData> {
    const params = new HttpParams()
      .set('latitude', lat.toString())
      .set('longitude', lon.toString())
      .set('daily', 'weather_code,temperature_2m_max,temperature_2m_min')
      .set('timezone', 'Australia/Sydney')
      .set('forecast_days', '7');
    return this.http.get<WeatherData>(this.weatherApiUrl, { params });
  }

  getWeatherDescription(code: number): string {
    const weatherMap: Record<number, string> = {
      0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast',
      45: 'Fog', 48: 'Depositing rime fog',
      51: 'Light drizzle', 53: 'Moderate drizzle', 55: 'Dense drizzle',
      61: 'Light rain', 63: 'Moderate rain', 65: 'Heavy rain',
      80: 'Light rain showers', 81: 'Moderate rain showers', 82: 'Violent rain showers',
      95: 'Thunderstorm'
    };
    return weatherMap[code] || 'Unknown weather';
  }
}
