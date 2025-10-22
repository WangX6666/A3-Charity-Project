// 活动分类接口（如“环保”“社区支持”）
export interface Category {
  id: number;               // 分类唯一ID
  category_name: string;    // 分类名称（英文，如"Environmental Protection"）
  category_desc?: string;   // 分类描述（可选）
}

// 活动接口（核心数据模型）
export interface Activity {
  id: number;               // 活动唯一ID
  title: string;            // 活动标题（英文）
  description: string;      // 活动描述（英文）
  date: string;             // 活动时间（格式：YYYY-MM-DDTHH:mm:ss，如"2025-11-15T09:00:00"）
  location: string;         // 活动地点（英文）
  category_id: number;      // 关联的分类ID（对应Category的id）
  category_name?: string;   // 关联的分类名称（前端显示用，可选）
}
