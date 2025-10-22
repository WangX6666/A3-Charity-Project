// 活动报名记录接口
export interface Registration {
  id: number;               // 报名记录唯一ID
  activity_id: number;      // 关联的活动ID（对应Activity的id）
  user_name: string;        // 报名人姓名（英文）
  user_email: string;       // 报名人邮箱（用于联系和去重）
  phone?: string;           // 报名人电话（可选）
  ticket_quantity: number;  // 购票数量（至少1张）
  registration_date: string;// 报名时间（自动记录）
}
