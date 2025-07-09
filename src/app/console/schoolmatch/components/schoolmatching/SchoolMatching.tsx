import React, { useState, useEffect } from 'react'
import { schoolMatchAPI, handleAPIError, type SchoolMatchResponse } from '../../lib/api'
import { type PromptData } from '../PromptCustomizer'
import SchoolMatchingForm, { type FormData } from './SchoolMatchingForm'
import SchoolMatchingResult from './SchoolMatchingResult'
import { toast } from "@/components/ui/use-toast"



interface SchoolMatchingProps {
  onComplete: () => void
}

export default function SchoolMatching({ onComplete }: SchoolMatchingProps) {
  // 使用纯React状态，组件不会被卸载所以状态会自动保持
  const [formData, setFormData] = useState<FormData>({
    studentSchool: '',
    gradeSystem: '百分制',
    grade: '',
    isCurrentStudent: true,
    targetSchool: '',
    major: '',
    languageTestType: '',
    languageTestScore: '',
    standardizedTestType: '',
    standardizedTestScore: '',
    requirements: ''
  })
  
  const [promptData, setPromptData] = useState<PromptData>({
    role: '',
    task: '',
    output_format: ''
  })
  
  const [showPromptCard, setShowPromptCard] = useState(false)
  const [matchResult, setMatchResult] = useState<SchoolMatchResponse | null>(null)

  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([])
  const [overseasSuggestions, setOverseasSuggestions] = useState<string[]>([])
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false)  
  const [showOverseasSuggestions, setShowOverseasSuggestions] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [progressMessage, setProgressMessage] = useState('')

  // 组件挂载时的调试信息（仅在开发环境显示）
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('SchoolMatching组件已挂载，使用纯React状态（组件不卸载）')
    }
  }, [])

  // 辅助函数：解析结构化数据
  const parseStructuredData = (resultObject: any) => {
    if (!resultObject) {
      console.log('❌ resultObject为空')
      return { matched_schools: null, student_background: null, recommended_projects: null }
    }
    
    console.log('🔍 开始解析结构化数据...', resultObject)
    
    // 先尝试直接从对象中获取
    if (resultObject.matched_schools || resultObject.student_background || resultObject.recommended_projects) {
      console.log('✅ 直接从对象获取结构化数据成功')
      console.log('🔍 matched_schools:', resultObject.matched_schools)
      console.log('🔍 student_background:', resultObject.student_background)
      console.log('🔍 recommended_projects:', resultObject.recommended_projects)
      return {
        matched_schools: resultObject.matched_schools || null,
        student_background: resultObject.student_background || null,
        recommended_projects: resultObject.recommended_projects || null
      }
    }
    
    // 从eventData中获取
    if (resultObject.eventData) {
      console.log('✅ 从eventData获取结构化数据')
      
      // 先尝试直接从eventData获取
      if (resultObject.eventData.matched_schools || resultObject.eventData.student_background || resultObject.eventData.recommended_projects) {
        return {
          matched_schools: resultObject.eventData.matched_schools || null,
          student_background: resultObject.eventData.student_background || null,
          recommended_projects: resultObject.eventData.recommended_projects || null
        }
      }
      
      // 如果eventData中没有直接的结构化数据，但有response字段，则解析response
      if (resultObject.eventData.response) {
        console.log('🔍 从eventData.response解析结构化数据')
        const parsedFromEventResponse = parseDataFromResponse(resultObject.eventData)
        if (parsedFromEventResponse.matched_schools || parsedFromEventResponse.student_background || parsedFromEventResponse.recommended_projects) {
          return parsedFromEventResponse
        }
      }
    }
    
    // 从响应文本解析
    return parseDataFromResponse(resultObject)
  }

  // 辅助函数：从响应文本解析结构化数据
  const parseDataFromResponse = (resultObject: any) => {
    const responseText = resultObject.response || resultObject.message || resultObject.content
    if (!responseText) {
      console.log('❌ 没有找到响应文本')
      return { matched_schools: null, student_background: null, recommended_projects: null }
    }
    
    console.log('📝 响应文本长度:', responseText.length)
    
    try {
      // 先尝试提取第一个完整的JSON对象（处理多个JSON对象连在一起的情况）
      const firstJsonStart = responseText.indexOf('{')
      if (firstJsonStart !== -1) {
        let braceCount = 0
        let jsonEnd = -1
        let inString = false
        let escapeNext = false
        
        for (let i = firstJsonStart; i < responseText.length; i++) {
          const char = responseText[i]
          
          if (escapeNext) {
            escapeNext = false
            continue
          }
          
          if (char === '\\' && inString) {
            escapeNext = true
            continue
          }
          
          if (char === '"' && !escapeNext) {
            inString = !inString
            continue
          }
          
          if (!inString) {
            if (char === '{') {
              braceCount++
            } else if (char === '}') {
              braceCount--
              if (braceCount === 0) {
                jsonEnd = i
                break
              }
            }
          }
        }
        
        if (jsonEnd !== -1) {
          const firstJsonObject = responseText.substring(firstJsonStart, jsonEnd + 1)
          try {
            const jsonData = JSON.parse(firstJsonObject)
            console.log('🔍 提取第一个JSON对象解析成功，数据keys:', Object.keys(jsonData))
            if (jsonData.matched_schools || jsonData.student_background || jsonData.recommended_projects) {
              console.log('✅ 从第一个JSON对象获取结构化数据成功')
              console.log('🔍 解析到的数据:', {
                matched_schools: jsonData.matched_schools ? `${jsonData.matched_schools.length}个学校` : 'null',
                student_background: jsonData.student_background ? '存在' : 'null',
                recommended_projects: jsonData.recommended_projects ? `${jsonData.recommended_projects.length}个项目` : 'null'
              })
              return {
                matched_schools: jsonData.matched_schools || null,
                student_background: jsonData.student_background || null,
                recommended_projects: jsonData.recommended_projects || null
              }
            }
          } catch (firstJsonParseError) {
            console.log('⚠️ 第一个JSON对象解析失败:', firstJsonParseError instanceof Error ? firstJsonParseError.message : String(firstJsonParseError))
          }
        }
      }
      
      // 尝试解析完整的JSON响应（向后兼容）
      try {
        const jsonData = JSON.parse(responseText)
        console.log('🔍 直接JSON解析成功，数据keys:', Object.keys(jsonData))
        if (jsonData.matched_schools || jsonData.student_background || jsonData.recommended_projects) {
          console.log('✅ 直接JSON解析获取结构化数据成功')
          console.log('🔍 解析到的数据:', {
            matched_schools: jsonData.matched_schools ? `${jsonData.matched_schools.length}个学校` : 'null',
            student_background: jsonData.student_background ? '存在' : 'null',
            recommended_projects: jsonData.recommended_projects ? `${jsonData.recommended_projects.length}个项目` : 'null'
          })
          return {
            matched_schools: jsonData.matched_schools || null,
            student_background: jsonData.student_background || null,
            recommended_projects: jsonData.recommended_projects || null
          }
        }
      } catch (directParseError) {
        console.log('⚠️ 直接JSON解析失败:', directParseError instanceof Error ? directParseError.message : String(directParseError))
      }
      
      // 处理markdown JSON格式响应 - 使用贪婪匹配提取完整JSON
      const markdownJsonMatch = responseText.match(/```(?:json)?\s*([\s\S]*)\s*```/i)
      if (markdownJsonMatch) {
        console.log('🔍 检测到markdown JSON格式响应')
        try {
          const jsonContent = markdownJsonMatch[1].trim()
          console.log('📝 提取的JSON内容长度:', jsonContent.length)
          const jsonData = JSON.parse(jsonContent)
          if (jsonData.matched_schools || jsonData.student_background || jsonData.recommended_projects) {
            console.log('✅ 从markdown代码块解析获取结构化数据成功')
            console.log('🔍 解析到的数据:', {
              matched_schools: jsonData.matched_schools ? `${jsonData.matched_schools.length}个学校` : 'null',
              student_background: jsonData.student_background ? '存在' : 'null',
              recommended_projects: jsonData.recommended_projects ? `${jsonData.recommended_projects.length}个项目` : 'null'
            })
            return {
              matched_schools: jsonData.matched_schools || null,
              student_background: jsonData.student_background || null,
              recommended_projects: jsonData.recommended_projects || null
            }
          }
        } catch (markdownParseError) {
          console.warn('❌ markdown代码块解析失败:', markdownParseError instanceof Error ? markdownParseError.message : String(markdownParseError))
          console.log('📝 尝试解析的JSON内容前200字符:', markdownJsonMatch[1].substring(0, 200) + '...')
        }
      }
      
      // 如果正则匹配失败，尝试原有的智能提取方法
      if (responseText.trim().startsWith('```json') || responseText.trim().startsWith('```')) {
        console.log('🔍 检测到markdown JSON格式响应')
        
        // 智能提取JSON的方法 - 使用栈来找到完整的JSON对象
        const jsonStart = responseText.indexOf('{')
        if (jsonStart !== -1) {
          let braceCount = 0
          let jsonEnd = -1
          let inString = false
          let escapeNext = false
          
          for (let i = jsonStart; i < responseText.length; i++) {
            const char = responseText[i]
            
            if (escapeNext) {
              escapeNext = false
              continue
            }
            
            if (char === '\\' && inString) {
              escapeNext = true
              continue
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString
              continue
            }
            
            if (!inString) {
              if (char === '{') {
                braceCount++
              } else if (char === '}') {
                braceCount--
                if (braceCount === 0) {
                  jsonEnd = i
                  break
                }
              }
            }
          }
          
          if (jsonEnd !== -1) {
            const extractedJson = responseText.substring(jsonStart, jsonEnd + 1)
            console.log('📝 parseDataFromResponse智能提取的JSON片段长度:', extractedJson.length)
            
            try {
              const jsonData = JSON.parse(extractedJson)
              if (jsonData.matched_schools || jsonData.student_background || jsonData.recommended_projects) {
                console.log('✅ parseDataFromResponse从智能提取的JSON片段获取结构化数据成功')
                return {
                  matched_schools: jsonData.matched_schools || null,
                  student_background: jsonData.student_background || null,
                  recommended_projects: jsonData.recommended_projects || null
                }
              }
            } catch (extractParseError) {
              console.warn('❌ parseDataFromResponse智能提取的JSON片段解析失败:', extractParseError instanceof Error ? extractParseError.message : String(extractParseError))
            }
          }
        }
      }
      
      // 使用正则匹配完整JSON对象
      const jsonRegex = /{[\s\S]*}/
      const jsonMatch = responseText.match(jsonRegex)
      
      if (jsonMatch) {
        try {
          const jsonData = JSON.parse(jsonMatch[0])
          if (jsonData.matched_schools || jsonData.student_background || jsonData.recommended_projects) {
            console.log('✅ 从正则匹配获取结构化数据成功')
            return {
              matched_schools: jsonData.matched_schools || null,
              student_background: jsonData.student_background || null,
              recommended_projects: jsonData.recommended_projects || null
            }
          }
        } catch (regexParseError) {
          console.warn('❌ 正则匹配JSON解析失败:', regexParseError)
        }
      }
      
    } catch (error) {
      console.error('❌ 解析结构化数据时发生错误:', error)
    }
    
    console.log('❌ 所有解析方法都失败了')
    return { matched_schools: null, student_background: null, recommended_projects: null }
  }

  // 辅助函数：解析matched_schools数据（保持向后兼容）
  const parseMatchedSchools = (resultObject: any): any[] | null => {
    if (!resultObject) {
      console.log('❌ resultObject为空')
      return null
    }
    
    console.log('🔍 开始解析matched_schools...', resultObject)
    
    // 方法1: 直接从对象中获取
    if (resultObject.matched_schools) {
      console.log('✅ 直接从对象获取matched_schools成功', resultObject.matched_schools)
      return resultObject.matched_schools
    }
    
    // 方法2: 从eventData中获取
    if (resultObject.eventData && resultObject.eventData.matched_schools) {
      console.log('✅ 从eventData获取matched_schools成功', resultObject.eventData.matched_schools)
      return resultObject.eventData.matched_schools
    }
    
    // 方法3: 从响应文本解析
    const responseText = resultObject.response || resultObject.message || resultObject.content
    if (!responseText) {
      console.log('❌ 没有找到响应文本')
      return null
    }
    
    console.log('📝 响应文本长度:', responseText.length)
    console.log('📝 响应文本内容:', responseText)
    
        try {
      // 方法3a: 尝试解析完整的JSON响应
      try {
        const jsonData = JSON.parse(responseText)
        if (jsonData.matched_schools) {
          console.log('✅ 直接JSON解析获取matched_schools成功', jsonData.matched_schools)
          return jsonData.matched_schools
        }
      } catch (directParseError) {
        console.log('⚠️ 直接JSON解析失败:', directParseError instanceof Error ? directParseError.message : String(directParseError))
      }
      
      // 方法3a2: 专门处理以```json开头的响应
      if (responseText.trim().startsWith('```json') || responseText.trim().startsWith('```')) {
        console.log('🔍 检测到markdown JSON格式响应')
        
        // 智能提取JSON的方法 - 使用栈来找到完整的JSON对象
        const jsonStart = responseText.indexOf('{')
        if (jsonStart !== -1) {
          let braceCount = 0
          let jsonEnd = -1
          let inString = false
          let escapeNext = false
          
          for (let i = jsonStart; i < responseText.length; i++) {
            const char = responseText[i]
            
            if (escapeNext) {
              escapeNext = false
              continue
            }
            
            if (char === '\\' && inString) {
              escapeNext = true
              continue
            }
            
            if (char === '"' && !escapeNext) {
              inString = !inString
              continue
            }
            
            if (!inString) {
              if (char === '{') {
                braceCount++
              } else if (char === '}') {
                braceCount--
                if (braceCount === 0) {
                  jsonEnd = i
                  break
                }
              }
            }
          }
          
          if (jsonEnd !== -1) {
            const extractedJson = responseText.substring(jsonStart, jsonEnd + 1)
            console.log('📝 智能提取的JSON片段长度:', extractedJson.length)
            console.log('📝 智能提取的JSON前200字符:', extractedJson.substring(0, 200))
            console.log('📝 智能提取的JSON后200字符:', extractedJson.substring(Math.max(0, extractedJson.length - 200)))
            
            try {
              const jsonData = JSON.parse(extractedJson)
              if (jsonData.matched_schools) {
                console.log('✅ 从智能提取的JSON片段获取matched_schools成功', jsonData.matched_schools)
                return jsonData.matched_schools
              }
            } catch (extractParseError) {
              console.warn('❌ 智能提取的JSON片段解析失败:', extractParseError instanceof Error ? extractParseError.message : String(extractParseError))
            }
          }
        }
      }
      
            // 方法3b: 从markdown代码块中提取
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/i)
      if (jsonMatch) {
        console.log('🔍 找到markdown JSON代码块')
        console.log('📝 提取的JSON内容:', jsonMatch[1])
        try {
          const jsonData = JSON.parse(jsonMatch[1])
          if (jsonData.matched_schools) {
            console.log('✅ 从markdown代码块获取matched_schools成功', jsonData.matched_schools)
            return jsonData.matched_schools
          }
        } catch (markdownParseError) {
          console.warn('❌ markdown代码块解析失败:', markdownParseError instanceof Error ? markdownParseError.message : String(markdownParseError))
          console.log('❌ 提取的内容长度:', jsonMatch[1].length)
          console.log('❌ 提取的内容前500字符:', jsonMatch[1].substring(0, 500))
        }
      } else {
        // 尝试更宽松的markdown匹配
        const loosejsonMatch = responseText.match(/```json\s*([\s\S]*)/i)
        if (loosejsonMatch) {
          console.log('🔍 找到松散的markdown JSON代码块')
          // 尝试找到JSON结束位置
          let jsonStr = loosejsonMatch[1]
          
          // 移除末尾的```如果存在
          jsonStr = jsonStr.replace(/\s*```\s*$/, '')
          
          console.log('📝 松散提取的JSON内容长度:', jsonStr.length)
          console.log('📝 松散提取的JSON前500字符:', jsonStr.substring(0, 500))
          
          try {
            const jsonData = JSON.parse(jsonStr)
            if (jsonData.matched_schools) {
              console.log('✅ 从松散markdown代码块获取matched_schools成功', jsonData.matched_schools)
              return jsonData.matched_schools
            }
          } catch (looseParseError) {
            console.warn('❌ 松散markdown解析失败:', looseParseError instanceof Error ? looseParseError.message : String(looseParseError))
          }
        }
      }
        
        // 方法3c: 更宽泛的JSON匹配 - 查找包含matched_schools的完整JSON对象
        const broadJsonMatch = responseText.match(/\{[\s\S]*?"matched_schools"\s*:\s*\[[\s\S]*?\][\s\S]*?\}/i)
        if (broadJsonMatch) {
          console.log('🔍 找到宽泛JSON匹配')
          try {
            const jsonData = JSON.parse(broadJsonMatch[0])
            if (jsonData.matched_schools) {
              console.log('✅ 从宽泛JSON匹配获取matched_schools成功', jsonData.matched_schools)
              return jsonData.matched_schools
            }
          } catch (broadParseError) {
            console.warn('❌ 宽泛JSON匹配解析失败:', broadParseError instanceof Error ? broadParseError.message : String(broadParseError))
          }
        }
        
        // 方法3d: 直接提取matched_schools数组
        const schoolsArrayMatch = responseText.match(/"matched_schools"\s*:\s*\[[\s\S]*?\]/i)
        if (schoolsArrayMatch) {
          console.log('🔍 找到matched_schools数组匹配')
          try {
            const arrayStr = schoolsArrayMatch[0].replace(/^"matched_schools"\s*:\s*/, '')
            const schoolsArray = JSON.parse(arrayStr)
            if (Array.isArray(schoolsArray) && schoolsArray.length > 0) {
              console.log('✅ 从数组匹配获取matched_schools成功', schoolsArray)
              return schoolsArray
            }
          } catch (arrayParseError) {
            console.warn('❌ 数组匹配解析失败:', arrayParseError instanceof Error ? arrayParseError.message : String(arrayParseError))
          }
        }
        
        // 方法3e: 尝试多行匹配更大的JSON结构 - 使用[\s\S]代替s标志
        const multilineJsonMatch = responseText.match(/\{[^{}]*"matched_schools"[^{}]*\[[\s\S]*?\][^{}]*\}/i)
        if (multilineJsonMatch) {
          console.log('🔍 找到多行JSON匹配')
          try {
            const jsonData = JSON.parse(multilineJsonMatch[0])
            if (jsonData.matched_schools) {
              console.log('✅ 从多行JSON匹配获取matched_schools成功', jsonData.matched_schools)
              return jsonData.matched_schools
            }
          } catch (multilineParseError) {
            console.warn('❌ 多行JSON匹配解析失败:', multilineParseError instanceof Error ? multilineParseError.message : String(multilineParseError))
          }
        }
      
    } catch (error) {
      console.error('❌ 解析matched_schools时发生错误:', error)
    }
    
    console.log('❌ 所有解析方法都失败了')
    console.log('💡 响应文本中是否包含matched_schools:', responseText.includes('matched_schools'))
    return null
  }

  // 分数转换函数
  const convertGrade = (grade: string, fromSystem: string, toSystem: string): string => {
    if (!grade || grade === '') return ''
    
    const numGrade = parseFloat(grade)
    if (isNaN(numGrade)) return ''

    let convertedGrade = 0

    // 首先转换为百分制作为中间值
    let gradeInPercent = 0
    switch (fromSystem) {
      case '百分制':
        gradeInPercent = numGrade
        break
      case '五分制':
        gradeInPercent = numGrade * 20
        break
      case '四分制':
        gradeInPercent = numGrade * 25
        break
    }

    // 然后转换为目标分制
    switch (toSystem) {
      case '百分制':
        convertedGrade = gradeInPercent
        break
      case '五分制':
        convertedGrade = gradeInPercent / 20
        break
      case '四分制':
        convertedGrade = gradeInPercent / 25
        break
    }

    // 根据分制保留合适的小数位
    if (toSystem === '百分制') {
      return Math.round(convertedGrade).toString()
    } else {
      return convertedGrade.toFixed(1)
    }
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handlePromptChange = (field: string, value: string) => {
    setPromptData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleTogglePromptCard = () => {
    setShowPromptCard(!showPromptCard)
  }

  const handleGradeSystemChange = (newSystem: string) => {
    const oldSystem = formData.gradeSystem
    const currentGrade = formData.grade
    
    // 如果有分数，进行转换
    const convertedGrade = convertGrade(currentGrade, oldSystem, newSystem)
    
    setFormData(prev => ({
      ...prev,
      gradeSystem: newSystem,
      grade: convertedGrade
    }))
  }



  const validateGrade = (grade: string, system: string): boolean => {
    const numGrade = parseFloat(grade)
    if (isNaN(numGrade)) return false
    
    switch (system) {
      case '百分制':
        return numGrade >= 0 && numGrade <= 100
      case '五分制':
        return numGrade >= 0 && numGrade <= 5
      case '四分制':
        return numGrade >= 0 && numGrade <= 4
      default:
        return false
    }
  }

  const handleGradeChange = (grade: string) => {
    // 验证分数是否符合当前分制
    if (grade === '' || validateGrade(grade, formData.gradeSystem)) {
      handleInputChange('grade', grade)
    }
  }

  // 提交表单并调用API
  const handleSubmit = async () => {
    // 验证必填字段
    if (!formData.studentSchool || !formData.grade ) {
      toast({
        title: '请填写完整的信息',
        description: '请确保所有必填字段都已填写',
        variant: 'destructive'
      })
      return
    }

    setIsLoading(true)
    setProgressMessage('正在准备匹配请求...')
    
    if (process.env.NODE_ENV === 'development') {
      console.log('开始提交匹配请求，当前数据:', { formData, promptData })
    }
    
    try {
      // 合并基础数据和提示词数据
      const requestData = {
        ...formData,
        ...(promptData.role && { role: promptData.role }),
        ...(promptData.task && { task: promptData.task }),
        ...(promptData.output_format && { output_format: promptData.output_format })
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('发送给API的数据:', requestData)
      }

      setProgressMessage('正在连接匹配服务...')
      
      // 使用api.ts中的工具类调用API
      const result = await schoolMatchAPI.match(requestData)
      
      if (process.env.NODE_ENV === 'development') {
        console.log('API返回结果类型:', typeof result, result instanceof Response)
      }
      
      // 检查是否是SSE响应
      if (result instanceof Response) {
        // 处理SSE流
        await schoolMatchAPI.processSSEStream(
          result,
          // onProgress: 实时更新进度消息
          (message: string) => {
            setProgressMessage(message)
          },
                    // onComplete: 处理最终结果
          (finalResult: any) => {
            if (process.env.NODE_ENV === 'development') {
              console.log('SSE流处理完成:', finalResult)
            }
            
            // 使用新的解析函数解析所有结构化数据
            console.log('🔧 开始解析最终结果:', finalResult)
            const structuredData = parseStructuredData(finalResult)
            console.log('🔧 解析后的结构化数据:', structuredData)
            
            // 如果新解析方法没有获取到student_background和recommended_projects，额外尝试从累积的响应中解析
            if (!structuredData.student_background || !structuredData.recommended_projects) {
              console.log('⚠️ 尝试从累积响应中解析结构化数据')
              const additionalData = parseDataFromResponse({ response: finalResult.response })
              console.log('🔧 从累积响应解析的数据:', additionalData)
              
              // 合并数据
              structuredData.student_background = structuredData.student_background || additionalData.student_background
              structuredData.recommended_projects = structuredData.recommended_projects || additionalData.recommended_projects
            }
            
            // 如果新解析失败，回退到旧的解析方法
            let finalMatchedSchools = structuredData.matched_schools
            if (!finalMatchedSchools) {
              console.log('⚠️ 新解析方法失败，尝试旧解析方法')
              finalMatchedSchools = parseMatchedSchools(finalResult)
            }
            
            const finalMatchResult = {
              ...finalResult,
              matched_schools: finalMatchedSchools,
              student_background: structuredData.student_background,
              recommended_projects: structuredData.recommended_projects
            }
            
            console.log('🔧 最终matchResult:', finalMatchResult)
            console.log('🔧 最终student_background:', finalMatchResult.student_background)
            console.log('🔧 最终recommended_projects:', finalMatchResult.recommended_projects)
            
            setMatchResult(finalMatchResult)
            
            toast({
              title: '匹配完成',
              description: '院校匹配已成功完成，请查看结果'
            })
          },
          // onError: 处理错误
          (error: string) => {
            console.error('SSE流处理错误:', error)
            toast({
              title: '匹配失败',
              description: error,
              variant: 'destructive'
            })
          }
        )
      } else {
        // 普通JSON响应（向后兼容）
        if (process.env.NODE_ENV === 'development') {
          console.log('API返回结果:', result)
        }
        
        // 如果返回结果包含进度信息，显示最后一条进度消息
        if (result.progressMessages && result.progressMessages.length > 0) {
          setProgressMessage(result.progressMessages[result.progressMessages.length - 1])
          // 延迟一下让用户看到最后的进度信息
          await new Promise(resolve => setTimeout(resolve, 500))
        }
        
                // 使用新的解析函数解析所有结构化数据
        const structuredData = parseStructuredData(result)
        console.log('🔧 解析后的结构化数据:', structuredData)
        
        // 如果新解析失败，回退到旧的解析方法
        let finalMatchedSchools = structuredData.matched_schools
        if (!finalMatchedSchools) {
          console.log('⚠️ 新解析方法失败，尝试旧解析方法')
          finalMatchedSchools = parseMatchedSchools(result)
        }
        
        const finalMatchResult = {
          ...result,
          matched_schools: finalMatchedSchools,
          student_background: structuredData.student_background,
          recommended_projects: structuredData.recommended_projects
        }
        
        console.log('🔧 普通响应最终matchResult:', finalMatchResult)
        console.log('🔧 普通响应最终student_background:', finalMatchResult.student_background)
        console.log('🔧 普通响应最终recommended_projects:', finalMatchResult.recommended_projects)
        
        setMatchResult(finalMatchResult)
        
        toast({
          title: '匹配完成',
          description: '院校匹配已成功完成，请查看结果'
        })
      }
      
    } catch (error) {
      console.error('匹配失败:', error)
      const errorMessage = handleAPIError(error)
      toast({
        title: '匹配失败',
        description: errorMessage,
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
      setProgressMessage('')
    }
  }

  // 清除所有数据
  // 测试表格数据 - 临时测试功能
  const handleTestTableData = () => {
    const testData = {
      success: true,
      response: "这是测试数据的响应内容",
      timestamp: new Date().toISOString(),
      session_id: Date.now().toString(),
      matched_schools: [
        {
          school_category: "冲刺",
          qs_ranking: "4",
          chinese_name: "牛津大学",
          english_name: "University of Oxford",
          course_link: "https://www.ox.ac.uk/admissions/graduate/courses/courses-a-z-listing",
          admission_requirement: "计算机科学专业通常要求获得一等或2:1学位，具体取决于学院和课程。",
          recommendation_reason: "牛津大学是世界顶尖学府，其计算机科学专业享有盛誉。",
          major_category: "非艺术类",
          location: "牛津",
          comments: "建议重点关注计算机科学相关的硕士或博士项目。"
        },
        {
          school_category: "冲刺",
          qs_ranking: "6",
          chinese_name: "剑桥大学",
          english_name: "University of Cambridge",
          course_link: "https://www.postgraduate.study.cam.ac.uk/courses?ucam-ref=homepage-signpost",
          admission_requirement: "计算机科学专业通常要求获得一等或2:1学位。",
          recommendation_reason: "剑桥大学是另一所世界顶尖学府，其计算机科学研究实力雄厚。",
          major_category: "非艺术类",
          location: "剑桥",
          comments: "可以考虑申请其计算机科学的授课型硕士项目。"
        },
        {
          school_category: "主申",
          qs_ranking: "2",
          chinese_name: "帝国理工学院",
          english_name: "Imperial College London",
          course_link: "https://www.imperial.ac.uk/study/courses/?courseType=postgraduate+taught&keywords=",
          admission_requirement: "计算机科学专业通常要求获得一等或2:1学位。",
          recommendation_reason: "帝国理工学院在工程和计算机科学领域享有极高声誉。",
          major_category: "非艺术类",
          location: "伦敦",
          comments: "重点关注其计算机科学系提供的授课型硕士项目。"
        }
      ]
    }
    setMatchResult(testData)
    toast({
      title: '测试数据已加载',
      description: '您现在可以看到表格的显示效果了'
    })
  }

  const handleClearAll = () => {
    if (window.confirm('确定要清除所有数据吗？这将删除表单内容和查询结果，此操作无法撤销。')) {
      if (process.env.NODE_ENV === 'development') {
        console.log('用户确认清除所有数据')
      }
      
      // 重置所有状态
      const defaultFormData: FormData = {
        studentSchool: '',
        gradeSystem: '百分制',
        grade: '',
        isCurrentStudent: true,
        targetSchool: '',
        major: '',
        languageTestType: '',
        languageTestScore: '',
        standardizedTestType: '',
        standardizedTestScore: '',
        requirements: ''
      }
      const defaultPromptData: PromptData = {
        role: '',
        task: '',
        output_format: ''
      }
      
      setFormData(defaultFormData)
      setPromptData(defaultPromptData)
      setMatchResult(null)
      setShowPromptCard(false)
      
      toast({
        title: '数据已清除',
        description: '所有表单内容和查询结果已被清除'
      })
      
      if (process.env.NODE_ENV === 'development') {
        console.log('所有数据已清除')
      }
    }
  }



  // 检查是否有数据需要显示清除按钮
  const hasData = Boolean(
    matchResult ||
    formData.studentSchool ||
    formData.grade ||
    formData.targetSchool ||
    formData.major ||
    formData.languageTestType ||
    formData.languageTestScore ||
    formData.standardizedTestType ||
    formData.standardizedTestScore ||
    formData.requirements ||
    promptData.role ||
    promptData.task ||
    promptData.output_format
  )

  return (
    <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-16 min-h-screen">
      {/* 使用提取的表单组件 */}
      <SchoolMatchingForm
        formData={formData}
        promptData={promptData}
        showPromptCard={showPromptCard}
        isLoading={isLoading}
        progressMessage={progressMessage}
        hasData={hasData}
        onInputChange={handleInputChange}
        onPromptChange={handlePromptChange}
        onTogglePromptCard={handleTogglePromptCard}
        onGradeSystemChange={handleGradeSystemChange}
        onGradeChange={handleGradeChange}
        onSubmit={handleSubmit}
        onClearAll={handleClearAll}
        onTestTableData={handleTestTableData}
      />

      {/* 匹配结果卡片 - 只在有结果时显示 */}
      {matchResult && (
        <SchoolMatchingResult
          matchResult={matchResult}
          formData={formData}
          onClearResult={() => setMatchResult(null)}
          onComplete={onComplete}
        />
      )}

    </div>
  )
} 