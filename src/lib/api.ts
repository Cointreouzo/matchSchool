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
    onComplete: (result: any, rawResponse?: string) => void,
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
    let rawResponseText = '' // 保存原始响应文本
    let accumulatedResponse = '' // 累积的response内容
    let hasReceivedEndEvent = false // 是否收到end事件
    let totalChunks = 0 // 接收的数据块总数
    let totalBytes = 0 // 接收的总字节数
    let lastDataTime = Date.now() // 最后接收数据的时间
    const TIMEOUT_MS = 30000 // 30秒超时
    
    try {
      // 【关键修复】：不要在收到end事件时立即结束，而是等待所有数据读取完毕
      while (true) {
        // 检查超时
        if (Date.now() - lastDataTime > TIMEOUT_MS) {
          console.warn('⏰ SSE流接收超时，强制结束')
          break
        }
        
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('📡 SSE流读取完毕 - 所有数据已接收')
          console.log('📊 接收统计: 总数据块', totalChunks, '总字节数', totalBytes)
          break
        }
        
        // 更新最后接收数据时间
        lastDataTime = Date.now()
        
        // 解码数据块
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        totalChunks++
        totalBytes += chunk.length
        
        console.log(`📡 接收数据块 #${totalChunks}，长度: ${chunk.length}`)
        console.log(`📡 当前buffer长度: ${buffer.length}`)
        
        // 按行分割处理
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // 保留不完整的行
        
        for (const line of lines) {
          const trimmedLine = line.trim()
          
          // 保存原始响应文本
          rawResponseText += line + '\n'
          
          // 跳过空行和注释
          if (!trimmedLine || trimmedLine.startsWith(':')) {
            continue
          }
          
          // 解析SSE数据行 "data: {...}"
          if (trimmedLine.startsWith('data: ')) {
            try {
              const dataStr = trimmedLine.substring(6) // 移除 "data: " 前缀
              const eventData = JSON.parse(dataStr)
              
              console.log('📥 SSE事件类型:', eventData.type)
              console.log('📝 事件数据keys:', Object.keys(eventData))
              
              // 记录所有事件的数据内容（用于调试）
              if (eventData.response || eventData.content || eventData.data) {
                console.log('📝 事件包含数据内容:', {
                  response: eventData.response ? `长度${eventData.response.length}` : '无',
                  content: eventData.content ? `长度${eventData.content.length}` : '无',
                  data: eventData.data ? `长度${eventData.data.length}` : '无'
                })
              }
              
              // 实时显示进度消息
              if (eventData.description) {
                onProgress(eventData.description)
              } else if (eventData.message && (eventData.type === 'start' || eventData.type === 'tool_start' || eventData.type === 'tool_end')) {
                onProgress(eventData.message)
              }
              
              // 处理final_response类型的事件
              if (eventData.type === 'final_response') {
                console.log('📥 收到final_response事件')
                console.log('📝 事件完整内容:', JSON.stringify(eventData, null, 2))
                
                if (eventData.response) {
                  console.log('📝 本次response内容长度:', eventData.response.length)
                  console.log('📝 本次response开头100字符:', eventData.response.substring(0, 100))
                  console.log('📝 本次response结尾100字符:', eventData.response.substring(Math.max(0, eventData.response.length - 100)))
                  
                  accumulatedResponse += eventData.response
                  console.log('📝 累积response长度:', accumulatedResponse.length)
                  console.log('📝 累积response结尾200字符:', accumulatedResponse.substring(Math.max(0, accumulatedResponse.length - 200)))
                }
                
                // 保存或更新最终结果
                finalResult = {
                  ...finalResult,
                  ...eventData,
                  response: accumulatedResponse
                }
              }
              
              // 【关键修复】：只记录end事件，不要立即结束读取
              if (eventData.type === 'end') {
                console.log('📥 收到end事件，但继续读取剩余数据')
                hasReceivedEndEvent = true
                // 不要break，继续读取剩余数据
              }
              
              // 【新增】：处理所有可能包含数据的事件类型
              if (eventData.type !== 'final_response' && 
                  (eventData.response || eventData.content || eventData.data)) {
                console.log('📥 发现其他类型事件包含数据:', eventData.type)
                
                let additionalData = eventData.response || eventData.content || eventData.data
                if (additionalData) {
                  console.log('📝 其他事件数据长度:', additionalData.length)
                  console.log('📝 其他事件数据内容（前100字符）:', additionalData.substring(0, 100))
                  accumulatedResponse += additionalData
                  console.log('📝 累积response更新长度:', accumulatedResponse.length)
                }
              }
              
              // 如果事件数据包含matched_schools，也保存它
              if (eventData.matched_schools) {
                finalResult = {
                  ...finalResult,
                  matched_schools: eventData.matched_schools
                }
              }
              
            } catch (parseError) {
              console.warn('解析SSE数据失败:', trimmedLine, parseError)
              // 保存解析失败的行，以便后续分析
              console.warn('解析失败的行内容:', trimmedLine)
            }
          }
        }
      }
      
      // 【关键修复】：处理最后剩余的buffer数据
      if (buffer.trim()) {
        console.log('📡 处理剩余buffer:', buffer.length, '字符')
        console.log('📡 剩余buffer内容:', buffer)
        rawResponseText += buffer
        
        // 尝试从剩余buffer中解析数据
        const remainingLines = buffer.split('\n')
        for (const line of remainingLines) {
          const trimmedLine = line.trim()
          if (trimmedLine.startsWith('data: ')) {
            try {
              const dataStr = trimmedLine.substring(6)
              const eventData = JSON.parse(dataStr)
              
              if (eventData.type === 'final_response' && eventData.response) {
                accumulatedResponse += eventData.response
                console.log('📝 从剩余buffer添加response:', eventData.response.length, '字符')
              }
            } catch (parseError) {
              console.warn('解析剩余buffer失败:', trimmedLine, parseError)
            }
          }
        }
      }
      
      console.log('📊 SSE流处理完成统计:')
      console.log('- 接收的数据块总数:', totalChunks)
      console.log('- 接收的总字节数:', totalBytes)
      console.log('- 原始响应文本长度:', rawResponseText.length)
      console.log('- 累积response长度:', accumulatedResponse.length)
      console.log('- 是否收到end事件:', hasReceivedEndEvent)
      console.log('- finalResult存在:', !!finalResult)
      
      // 【额外调试】：检查累积的response内容
      if (accumulatedResponse) {
        console.log('📝 累积response前500字符:', accumulatedResponse.substring(0, 500))
        console.log('📝 累积response后500字符:', accumulatedResponse.substring(Math.max(0, accumulatedResponse.length - 500)))
      }
      
      // 处理完成
      if (finalResult) {
        const responseContent = finalResult.response || accumulatedResponse || finalResult.message || finalResult.content || '匹配完成'
        onComplete({
          success: true,
          response: responseContent,
          timestamp: new Date().toISOString(),
          session_id: Date.now().toString(),
          eventData: finalResult,
          matched_schools: finalResult.matched_schools || null
        }, rawResponseText)
      } else {
        onComplete({
          success: true,
          response: accumulatedResponse || '匹配完成，但未获取到详细结果',
          timestamp: new Date().toISOString(),
          session_id: Date.now().toString()
        }, rawResponseText)
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
  matched_schools?: MatchedSchool[]
}

export interface MatchedSchool {
  school_category: string
  qs_ranking: string
  chinese_name: string
  english_name: string
  course_link: string
  admission_requirement: string
  recommendation_reason: string
  major_category: string
  location: string
  comments: string
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