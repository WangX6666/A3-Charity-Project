// 天气数据接口（匹配open-meteo API返回格式）
export interface WeatherData {
  daily: {
    time: string[];                  // 日期数组（如["2025-11-15", "2025-11-16"]）
    weather_code: number[];          // 天气代码（对应天气状态，如0=晴天）
    temperature_2m_max: number[];    // 每日最高温度（摄氏度）
    temperature_2m_min: number[];    // 每日最低温度（摄氏度）
  };
  timezone: string;                  // 时区（如"Australia/Sydney"）
}
