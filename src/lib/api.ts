// API基础配置
const API_BASE_URL = process.env.NODE_ENV === 'development' ? '' : ''

// 学校匹配相关的API
export const schoolMatchAPI = {
  // 匹配学校
  match: async (data: {
    studentSchool: string
    gradeSystem: string
    grade: string
    isCurrentStudent: boolean
    targetSchool: string
    // 新增的提示词参数
    role?: string
    task?: string
    output_format?: string
  }) => {
    console.log('🔄 开始调用学校匹配API...', data)
    
    const response = await fetch(`${API_BASE_URL}/api/school-match`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    })

    console.log('📡 API响应状态:', response.status, response.statusText)

    if (!response.ok) {
      // 尝试获取详细的错误信息
      let errorDetails = `API调用失败: ${response.status} ${response.statusText}`
      
      try {
        const errorData = await response.json()
        console.error('❌ API错误详情:', errorData)
        errorDetails += ` - ${errorData.message || errorData.error || '无详细信息'}`
      } catch (parseError) {
        console.error('❌ 无法解析错误响应:', parseError)
        const errorText = await response.text()
        console.error('❌ 错误响应文本:', errorText)
        errorDetails += ` - ${errorText}`
      }
      
      throw new Error(errorDetails)
    }

    // 检查是否是SSE响应
    const contentType = response.headers.get('Content-Type')
    if (contentType && contentType.includes('text/event-stream')) {
      // 返回响应对象，让调用者处理SSE流
      return response
    } else {
      // 普通JSON响应
      const result = await response.json()
      console.log('✅ API调用成功:', result)
      return result
    }
  },

  // 处理SSE流的辅助方法
  processSSEStream: async (
    response: Response, 
    onProgress: (message: string) => void,
    onComplete: (result: any) => void,
    onError: (error: string) => void
  ) => {
    const reader = response.body?.getReader()
    const decoder = new TextDecoder()
    
    if (!reader) {
      onError('无法读取响应流')
      return
    }

    let buffer = ''
    let finalResult: any = null
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        // 解码数据块
        buffer += decoder.decode(value, { stream: true })
        
        // 按行分割处理
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留不完整的行
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          
          // 跳过空行和注释
          if (!trimmedLine || trimmedLine.startsWith(':')) {
            continue
          }
          
          // 解析SSE数据行 "data: {...}"
          if (trimmedLine.startsWith('data: ')) {
            try {
              const dataStr = trimmedLine.substring(6) // 移除 "data: " 前缀
              const eventData = JSON.parse(dataStr)
              
              console.log('📥 SSE事件:', eventData)
              
              // 实时显示进度消息
              if (eventData.description) {
                onProgress(eventData.description)
              } else if (eventData.message && (eventData.type === 'start' || eventData.type === 'tool_start' || eventData.type === 'tool_end')) {
                onProgress(eventData.message)
              }
              
              // 收集最终结果
              if (eventData.type === 'final_response' || eventData.type === 'result' || eventData.type === 'final') {
                finalResult = eventData
              } else if (eventData.type === 'ai_token' && eventData.content) {
                // 收集AI回复的token以构建完整响应
                if (!finalResult) {
                  finalResult = { type: 'ai_response', response: '' }
                }
                if (finalResult.type === 'ai_response') {
                  finalResult.response = (finalResult.response || '') + eventData.content
                }
              }
              
            } catch (parseError) {
              console.warn('解析SSE数据失败:', trimmedLine, parseError)
            }
          }
        }
      }
      
      // 处理完成
      if (finalResult) {
        const responseContent = finalResult.response || finalResult.message || finalResult.content || '匹配完成'
        onComplete({
          success: true,
          response: responseContent,
          timestamp: new Date().toISOString(),
          session_id: Date.now().toString(),
          eventData: finalResult
        })
      } else {
        onComplete({
          success: true,
          response: '匹配完成，但未获取到详细结果',
          timestamp: new Date().toISOString(),
          session_id: Date.now().toString()
        })
      }
      
    } catch (error) {
      console.error('处理SSE流时出错:', error)
      onError(error instanceof Error ? error.message : '处理SSE流时出错')
    } finally {
      reader.releaseLock()
    }
  }
}

// 通用API错误处理
export const handleAPIError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message
  }
  return '未知错误'
}

// API响应类型定义
export interface SchoolMatchResponse {
  response: string
  timestamp: string
  session_id: string
  success: boolean
  progressMessages?: string[]
  steps?: any[]
  eventData?: any
}

export interface APIError {
  success: false
  error: string
  message: string
}

// 学校匹配请求参数类型
export interface SchoolMatchRequest {
  studentSchool: string
  gradeSystem: string
  grade: string
  isCurrentStudent: boolean
  targetSchool: string
  // 提示词参数（可选）
  role?: string
  task?: string
  output_format?: string
} 