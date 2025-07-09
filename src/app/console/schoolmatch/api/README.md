# API 文档

本目录包含了所有的API路由文件。

## 目录结构

```
src/app/api/
├── school-match/
│   └── route.ts          # 学校匹配API
└── README.md             # API文档
```

## API 接口

### 1. 学校匹配 API

**路径**: `/api/school-match`
**方法**: `POST`
**描述**: 根据学生背景信息匹配合适的海外院校

#### 请求参数

```typescript
interface SchoolMatchRequest {
  studentSchool: string;      // 学生当前学校
  gradeSystem: string;        // 分制系统：百分制|五分制|四分制|英国学位制
  grade: string;              // 学生均分
  isCurrentStudent: boolean;  // 是否在读
  targetSchool: string;       // 目标院校
  
  // 自定义提示词参数（可选，用于调试）
  role?: string;              // 自定义角色提示词
  task?: string;              // 自定义任务提示词
  output_format?: string;     // 自定义输出格式提示词
}
```

#### 请求示例

**基础请求**:
```json
{
  "studentSchool": "上海交通大学",
  "gradeSystem": "百分制",
  "grade": "85",
  "isCurrentStudent": true,
  "targetSchool": "UCL"
}
```

**包含自定义提示词的请求**:
```json
{
  "studentSchool": "上海交通大学",
  "gradeSystem": "百分制",
  "grade": "85",
  "isCurrentStudent": true,
  "targetSchool": "UCL",
  "role": "你是一名专业的留学咨询顾问，拥有丰富的海外院校申请经验",
  "task": "请根据学生背景匹配合适的海外院校，并提供详细的申请建议",
  "output_format": "请以Markdown格式输出，包含匹配分析、推荐院校列表、申请建议等"
}
```

#### 响应格式

```typescript
interface SchoolMatchResponse {
  response: string;     // 匹配结果详细信息
  timestamp: string;    // 时间戳
  session_id: string;   // 会话ID
  success: boolean;     // 是否成功
}
```

#### 响应示例

```json
{
  "response": "**匹配结果分析：**\n\n根据您提供的信息，系统匹配到以下学校：\n\n* 牛津大学\n* 爱丁堡大学\n* 曼彻斯特大学\n...",
  "timestamp": "2025-06-25T09:44:58.015020",
  "session_id": "1735123456789",
  "success": true
}
```

#### 错误响应

```json
{
  "success": false,
  "error": "服务器内部错误",
  "message": "具体错误信息"
}
```

## 功能特性

### 🔧 自定义提示词功能

新增的提示词功能允许用户在调试模式下自定义AI的行为：

1. **Role (角色提示词)**: 定义AI的角色身份，如专业留学顾问等
2. **Task (任务提示词)**: 明确AI需要完成的具体任务
3. **Output Format (输出格式提示词)**: 指定返回结果的格式要求

### 📊 界面布局更新

- **左右分栏布局**: 输入表单在左侧，匹配结果在右侧
- **实时结果显示**: 匹配结果与输入框同时显示，无需页面切换
- **可折叠提示词卡片**: 提示词输入区域可以展开/收起
- **响应式设计**: 在移动设备上自动切换为上下布局

## 环境配置

### 环境变量设置

项目使用环境变量来配置不同环境的API地址，支持开发和生产环境：

#### 开发环境 (`.env.development`)
```bash
NODE_ENV=development
BACKEND_API_URL=http://10.10.10.25:8001/chat
```

#### 生产环境 (`.env.production`)
```bash
NODE_ENV=production
BACKEND_API_URL=https://your-production-api.com/chat
```

### 环境变量说明

| 变量名 | 必填 | 说明 | 示例值 |
|--------|------|------|---------|
| `NODE_ENV` | 是 | Node.js环境标识 | `development` / `production` |
| `BACKEND_API_URL` | 是 | 后端API完整地址 | `http://10.10.10.25:8001/chat` |

### 注意事项

- 环境文件已添加到 `.gitignore`，不会被提交到版本库
- 如果环境变量未配置，API会返回500错误
- 开发环境会在控制台输出详细的调试信息

## 后端服务配置

- **连接方式**: HTTP POST
- **数据格式**: JSON
- **环境配置**: 通过环境变量动态配置

## 使用方法

1. 在组件中引入API工具类：
```typescript
import { schoolMatchAPI } from '@/lib/api'
```

2. 调用API（基础匹配）：
```typescript
const result = await schoolMatchAPI.match(formData)
```

3. 调用API（包含自定义提示词）：
```typescript
const result = await schoolMatchAPI.match({
  ...formData,
  role: "你是专业留学顾问",
  task: "匹配最适合的院校",
  output_format: "请以详细的分析报告形式输出"
})
```

## 注意事项

1. 提示词参数为可选参数，不填写时使用默认配置
2. 自定义提示词功能主要用于调试和优化AI响应
3. 长提示词可能会影响响应时间
4. 建议在生产环境中谨慎使用自定义提示词功能
5. 所有API调用都需要处理错误情况
6. 请求数据需要进行验证
7. 响应结果需要进行格式化处理
8. **环境变量必须正确配置，否则API无法正常工作** 