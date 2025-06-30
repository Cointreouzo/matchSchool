import React, { useState, useEffect } from 'react'
import { schoolMatchAPI, handleAPIError, type SchoolMatchResponse } from '@/lib/api'
import { type PromptData } from '../PromptCustomizer'
import SchoolMatchingForm, { type FormData } from './SchoolMatchingForm'
import { toast } from "sonner"



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
      toast.error('请填写完整的信息', {
        description: '请确保所有必填字段都已填写'
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
            setMatchResult(finalResult)
            toast.success('匹配完成', {
              description: '院校匹配已成功完成，请查看结果'
            })
          },
          // onError: 处理错误
          (error: string) => {
            console.error('SSE流处理错误:', error)
            toast.error('匹配失败', {
              description: error
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
        
        setMatchResult(result)
        toast.success('匹配完成', {
          description: '院校匹配已成功完成，请查看结果'
        })
      }
      
    } catch (error) {
      console.error('匹配失败:', error)
      const errorMessage = handleAPIError(error)
      toast.error('匹配失败', {
        description: errorMessage
      })
    } finally {
      setIsLoading(false)
      setProgressMessage('')
    }
  }

  // 清除所有数据
  const handleClearAll = () => {
    toast('确定要清除所有数据吗？', {
      description: '这将删除表单内容和查询结果，此操作无法撤销。',
      action: {
        label: '确认清除',
        onClick: () => {
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
          
          toast.success('数据已清除', {
            description: '所有表单内容和查询结果已被清除'
          })
          
          if (process.env.NODE_ENV === 'development') {
            console.log('所有数据已清除')
          }
        }
      },
      cancel: {
        label: '取消',
        onClick: () => {
          // 取消操作，无需处理
        }
      }
    })
  }

  // 格式化匹配结果显示
  const formatMatchResult = (response: string) => {
    // 将响应文本转换为HTML格式
    return response
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
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
    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 min-h-screen">
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
      />

      {/* 匹配结果卡片 - 只在有结果时显示 */}
      {matchResult && (
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-0 p-10 hover:shadow-3xl transition-all duration-300 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-black mb-3">
              🎯 匹配结果
            </h2>
            <p className="text-gray-600">
              基于您的背景为您匹配到以下院校
            </p>
          </div>

          {/* 用户输入信息回显 */}
          <div className="bg-gray-50 rounded-2xl p-6 mb-8">
            <h3 className="font-semibold text-gray-800 mb-4">📋 查询信息</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-700">学校：</span>
                <span className="text-gray-600">{formData.studentSchool}</span>
              </div>
              {formData.major && (
                <div>
                  <span className="font-semibold text-gray-700">专业：</span>
                  <span className="text-gray-600">{formData.major}</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">均分：</span>
                <span className="text-gray-600">{formData.gradeSystem} {formData.grade}分</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">状态：</span>
                <span className="text-gray-600">{formData.isCurrentStudent ? '在读' : '已毕业'}</span>
              </div>
              {formData.languageTestType && formData.languageTestScore && (
                <div>
                  <span className="font-semibold text-gray-700">语言成绩：</span>
                  <span className="text-gray-600">{formData.languageTestType} {formData.languageTestScore}分</span>
                </div>
              )}
              {formData.standardizedTestType && formData.standardizedTestType !== '无' && formData.standardizedTestScore && (
                <div>
                  <span className="font-semibold text-gray-700">标准化考试：</span>
                  <span className="text-gray-600">{formData.standardizedTestType} {formData.standardizedTestScore}分</span>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700">目标院校：</span>
                <span className="text-gray-600">{formData.targetSchool}</span>
              </div>
              {formData.requirements && (
                <div className="md:col-span-2">
                  <span className="font-semibold text-gray-700">其他需求：</span>
                  <span className="text-gray-600">{formData.requirements}</span>
                </div>
              )}
            </div>
          </div>

          {/* 匹配结果内容 */}
          <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
            <div 
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: formatMatchResult(matchResult.response) 
              }}
            />
          </div>

          {/* 时间戳和会话信息 */}
          <div className="text-center text-sm text-gray-500 mb-6">
            <div>匹配时间: {new Date(matchResult.timestamp).toLocaleString('zh-CN')}</div>
            <div className="text-xs mt-1">会话ID: {matchResult.session_id}</div>
          </div>
          
          {/* 结果操作按钮 */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={() => setMatchResult(null)}
              className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-all duration-300"
            >
              🔄 清除结果
            </button>
            <button
              onClick={onComplete}
              className="px-8 py-4 bg-black text-white font-semibold rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95"
            >
              ✨ 继续下一步
            </button>
          </div>
        </div>
      )}

    </div>
  )
} 