import { NextRequest, NextResponse } from 'next/server'

// 学校匹配API路由

// 解析SSE流数据
const parseSSEResponse = async (response: Response): Promise<any> => {
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  
  if (!reader) {
    throw new Error('无法读取响应流')
  }

  let buffer = ''
  let finalResult: any = null
  const steps: any[] = []
  const progressMessages: string[] = []
  
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
            
            if (process.env.NODE_ENV === 'development') {
              console.log('📥 SSE事件:', eventData)
            }
            
            // 收集不同类型的事件
            if (eventData.type === 'step') {
              steps.push(eventData)
            } else if (eventData.type === 'result' || eventData.type === 'final' || eventData.type === 'final_response') {
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
            
            // 收集进度描述信息
            if (eventData.description) {
              progressMessages.push(eventData.description)
            } else if (eventData.message && eventData.type === 'start') {
              progressMessages.push(eventData.message)
            }
            
          } catch (parseError) {
            console.warn('解析SSE数据失败:', trimmedLine, parseError)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
  
  // 如果没有获取到最终结果，但有步骤数据，尝试从步骤中提取
  if (!finalResult && steps.length > 0) {
    const lastStep = steps[steps.length - 1]
    if (lastStep && lastStep.status === 'success') {
      finalResult = {
        type: 'result',
        response: lastStep.description || '匹配完成',
        steps: steps
      }
    }
  }
  
  // 提取最终响应内容
  let responseContent = '匹配完成，但未获取到详细结果'
  
  if (finalResult) {
    if (finalResult.response) {
      responseContent = finalResult.response
    } else if (finalResult.message) {
      responseContent = finalResult.message
    } else if (finalResult.content) {
      responseContent = finalResult.content
    }
  }
  
  // 添加调试信息
  if (process.env.NODE_ENV === 'development') {
    console.log('🔍 最终结果分析:', {
      hasFinalResult: !!finalResult,
      finalResultType: finalResult?.type,
      responseLength: responseContent.length,
      stepsCount: steps.length
    })
  }
  
  return {
    success: true,
    response: responseContent,
    timestamp: new Date().toISOString(),
    session_id: Date.now().toString(),
    steps: steps,
    progressMessages: progressMessages,
    eventData: finalResult
  }
}

export async function POST(request: NextRequest) {
  console.log('🚀 API开始处理请求...')
  
  try {
    // 首先检查环境变量
    console.log('🔍 检查环境变量...')
    console.log('NODE_ENV:', process.env.NODE_ENV)
    console.log('BACKEND_API_URL:', process.env.BACKEND_API_URL)
    
    // 临时调试：尝试读取不同的环境变量名
    console.log('🔍 测试其他可能的环境变量名:')
    console.log('- NEXT_PUBLIC_BACKEND_API_URL:', process.env.NEXT_PUBLIC_BACKEND_API_URL)
    console.log('- BACKEND_URL:', process.env.BACKEND_URL)
    console.log('- API_URL:', process.env.API_URL)
    
    const body = await request.json()
    console.log('📨 接收到的请求数据:', body)
    
    // 从前端接收的数据格式转换
    const { 
      studentSchool, 
      gradeSystem, 
      grade, 
      isCurrentStudent, 
      targetSchool,
      // 新增的学生信息字段
      major,
      languageTestType,
      languageTestScore,
      standardizedTestType,
      standardizedTestScore,
      requirements,
      // 新增的提示词参数
      role,
      task,
      output_format
    } = body
    
    console.log('📋 解析后的字段:', {
      studentSchool,
      gradeSystem,
      grade,
      isCurrentStudent,
      targetSchool,
      major,
      languageTestType,
      languageTestScore,
      standardizedTestType,
      standardizedTestScore,
      requirements,
      role,
      task,
      output_format
    })

    // 构建发送给后端的消息
    let message = `我是${studentSchool}学生，`
    
    // 添加专业信息
    if (major && major.trim()) {
      message += `专业是${major}，`
    }
    
    // 处理分制和分数
    if (gradeSystem === '英国学位制') {
      message += `GPA为英国学位制${grade}分，`
    } else if (gradeSystem === '百分制') {
      message += `GPA为百分制${grade}分，`
    } else if (gradeSystem === '五分制') {
      message += `GPA为五分制${grade}分，`
    } else if (gradeSystem === '四分制') {
      message += `GPA为四分制${grade}分，`
    }
    
    // 是否在读
    message += isCurrentStudent ? '在读，' : '已毕业，'
    
    // 添加语言考试成绩
    if (languageTestType && languageTestScore) {
      message += `${languageTestType}成绩${languageTestScore}分，`
    }
    
    // 添加标准化考试成绩
    if (standardizedTestType && standardizedTestType !== '无' && standardizedTestScore) {
      message += `${standardizedTestType}成绩${standardizedTestScore}分，`
    }
    
    // 目标学校
    if (typeof targetSchool !== 'undefined' && targetSchool) {
      message += `想申请${targetSchool}`
    }
    
    // 移除最后的逗号（如果有的话）
    message = message.replace(/，$/, '')
    
    console.log('📝 构建的消息:', message)
    
    // 生成session_id（可以根据需要修改生成规则）
    const sessionId = Date.now().toString()
    
    // 发送给后端的数据
    const backendData = {
      message: message,
      session_id: sessionId,
      // 添加可选的提示词参数
      ...(role && { role }),
      ...(task && { task }),
      ...(output_format && { output_format }),
      // 将其他需求作为独立参数
      ...(requirements && requirements.trim() && { additional_requirements: requirements.trim() })
    }
    
    // 在开发环境使用console.log，生产环境使用console.info保留重要信息
    if (process.env.NODE_ENV === 'development') {
      console.log('📤 发送给后端的数据:', backendData)
    } else {
      console.info('📤 API请求 - 学校匹配', { 
        school: studentSchool,
        major: major || '未指定',
        grade: `${gradeSystem}${grade}分`,
        languageTest: languageTestType && languageTestScore ? `${languageTestType}${languageTestScore}分` : '未提供',
        standardizedTest: standardizedTestType && standardizedTestType !== '无' && standardizedTestScore ? `${standardizedTestType}${standardizedTestScore}分` : '未提供',
        target: targetSchool || '未指定',
        hasAdditionalRequirements: !!(requirements && requirements.trim()),
        sessionId 
      })
    }
    
    // 获取API URL（多种方式尝试）
    const backendUrl = process.env.BACKEND_API_URL 

    console.log('🔗 环境变量BACKEND_API_URL:', process.env.BACKEND_API_URL)
    console.log('🔗 最终使用地址:', backendUrl)
    
    // 构建完整的API URL
    const apiUrl = `${backendUrl}/chat`
    console.log('🔗 调用接口:', apiUrl)
    console.log('🔧 使用配置:', process.env.BACKEND_API_URL ? '环境变量' : '硬编码')
    
    // 调用后端API
    console.log('📡 开始调用后端API...')
    const response = await fetch(
      apiUrl,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream', // 明确指定接受SSE流
        },
        body: JSON.stringify(backendData)
      }
    )
    
    console.log('📡 后端API响应状态:', response.status, response.statusText)
    console.log('📡 响应头信息:', Object.fromEntries(response.headers.entries()))
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ 后端API错误响应:', errorText)
      throw new Error(`后端API调用失败: ${response.status} ${response.statusText} - ${errorText}`)
    }
    
    // 检查响应内容类型
    const contentType = response.headers.get('content-type')
    if (process.env.NODE_ENV === 'development') {
      console.log('📄 响应内容类型:', contentType)
    }
    
    let backendResponse: any
    
    // 根据内容类型处理响应
    if (contentType && contentType.includes('text/event-stream')) {
      console.log('🔄 直接转发SSE流响应...')
      // 直接转发SSE流给前端
      return new Response(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      })
    } else {
      console.log('🔄 处理JSON响应...')
      // 处理普通JSON响应（向后兼容）
      try {
        backendResponse = await response.json()
      } catch (jsonError) {
        console.warn('JSON解析失败，尝试作为文本处理:', jsonError)
        const textResponse = await response.text()
        console.log('📄 文本响应内容:', textResponse)
        backendResponse = {
          success: true,
          response: textResponse,
          timestamp: new Date().toISOString(),
          session_id: sessionId
        }
      }
    }
    
    // 在开发环境显示详细响应，生产环境只记录成功信息
    if (process.env.NODE_ENV === 'development') {
      console.log('📥 处理后的响应数据:', backendResponse)
    } else {
      console.info('📥 API响应成功', { sessionId, success: backendResponse.success })
    }
    
    console.log('✅ API处理完成，准备返回响应')
    // 返回处理后的响应
    return NextResponse.json(backendResponse)
    
  } catch (error) {
    console.error('❌ API完整错误信息:', error)
    console.error('❌ 错误堆栈:', error instanceof Error ? error.stack : '无堆栈信息')
    
    // 区分不同类型的错误
    if (error instanceof Error && error.message.includes('环境变量')) {
      console.error('❌ 环境变量配置错误')
      return NextResponse.json(
        { 
          success: false, 
          error: '服务器配置错误',
          message: '后端服务配置有误，请联系管理员',
          details: error.message
        },
        { status: 500 }
      )
    }
    
    console.error('❌ 通用服务器错误')
    return NextResponse.json(
      { 
        success: false, 
        error: '服务器内部错误',
        message: error instanceof Error ? error.message : '未知错误',
        details: error instanceof Error ? error.stack : '无详细信息'
      },
      { status: 500 }
    )
  }
} 