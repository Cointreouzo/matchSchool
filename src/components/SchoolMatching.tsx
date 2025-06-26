import React, { useState, useEffect } from 'react'
import { schoolMatchAPI, handleAPIError, type SchoolMatchResponse } from '@/lib/api'
import PromptCustomizer, { type PromptData } from './PromptCustomizer'
import { toast } from "sonner"



interface SchoolMatchingProps {
  onComplete: () => void
}

export default function SchoolMatching({ onComplete }: SchoolMatchingProps) {
  // 使用纯React状态，组件不会被卸载所以状态会自动保持
  const [formData, setFormData] = useState({
    studentSchool: '',
    gradeSystem: '百分制',
    grade: '',
    isCurrentStudent: true,
    targetSchool: ''
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

  const getGradePlaceholder = () => {
    switch (formData.gradeSystem) {
      case '五分制':
        return '请输入0-5的分数'
      case '四分制':
        return '请输入0-4的分数'
      case '百分制':
        return '请输入0-100的分数'
      default:
        return '请输入分数'
    }
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
    if (!formData.studentSchool || !formData.grade || !formData.targetSchool) {
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
          const defaultFormData = {
            studentSchool: '',
            gradeSystem: '百分制',
            grade: '',
            isCurrentStudent: true,
            targetSchool: ''
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
    promptData.role ||
    promptData.task ||
    promptData.output_format
  )

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16 min-h-screen">
      {/* 主表单卡片 */}
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-0 p-10 hover:shadow-3xl transition-all duration-300 mb-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-black mb-3">
            院校匹配
          </h2>
          <p className="text-gray-600">
            填写您的基本信息，我们将为您匹配最适合的海外院校
          </p>
        </div>
        
        <div className="space-y-8">
          {/* 客户学校名字输入框 */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              🏫 客户学校名字
            </label>
            <input
              type="text"
              value={formData.studentSchool}
              onChange={(e) => handleInputChange('studentSchool', e.target.value)}
              placeholder="请输入学校名字"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 text-gray-800 bg-gray-50/50 hover:bg-white hover:border-gray-300"
            />
          </div>

          {/* 客户均分 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              📊 客户均分
            </label>
            <div className="flex space-x-4">
              {/* 分制选择 */}
              <div className="relative">
                <select
                  value={formData.gradeSystem}
                  onChange={(e) => handleGradeSystemChange(e.target.value)}
                  className="appearance-none px-5 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 font-medium text-gray-800 min-w-[120px] cursor-pointer"
                >
                  <option value="百分制">百分制</option>
                  <option value="英国学位制">英国学位制</option>
                  <option value="五分制">五分制</option>
                  <option value="四分制">四分制</option>
                </select>
                {/* 自定义下拉箭头 */}
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              
              {/* 分数输入 */}
              <input
                type="number"
                value={formData.grade}
                onChange={(e) => handleGradeChange(e.target.value)}
                placeholder={getGradePlaceholder()}
                className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 text-gray-800 bg-gray-50/50 hover:bg-white hover:border-gray-300"
                min="0"
                max={formData.gradeSystem === '百分制' ? '100' : formData.gradeSystem === '五分制' ? '5' : '4'}
                step={formData.gradeSystem === '百分制' ? '1' : '0.1'}
              />
            </div>
            {/* 分数范围提示 */}
            <p className="text-xs text-gray-500 mt-2">
              {formData.gradeSystem === '百分制' && '范围：0-100分'}
              {formData.gradeSystem === '英国学位制' && '范围：0-100分'}
              {formData.gradeSystem === '五分制' && '范围：0-5分（支持小数）'}
              {formData.gradeSystem === '四分制' && '范围：0-4分（支持小数）'}
            </p>
          </div>

          {/* 是否在读 */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-4">
              🎓 是否在读
            </label>
            <div className="flex space-x-6">
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    name="isCurrentStudent"
                    checked={formData.isCurrentStudent === true}
                    onChange={() => handleInputChange('isCurrentStudent', true)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    formData.isCurrentStudent === true 
                      ? 'border-black bg-black' 
                      : 'border-gray-300 bg-white group-hover:border-gray-500'
                  }`}>
                    {formData.isCurrentStudent === true && (
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-800 font-medium group-hover:text-black transition-colors duration-200">是</span>
              </label>
              <label className="flex items-center cursor-pointer group">
                <div className="relative">
                  <input
                    type="radio"
                    name="isCurrentStudent"
                    checked={formData.isCurrentStudent === false}
                    onChange={() => handleInputChange('isCurrentStudent', false)}
                    className="sr-only"
                  />
                  <div className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                    formData.isCurrentStudent === false 
                      ? 'border-black bg-black' 
                      : 'border-gray-300 bg-white group-hover:border-gray-500'
                  }`}>
                    {formData.isCurrentStudent === false && (
                      <div className="w-2 h-2 bg-white rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"></div>
                    )}
                  </div>
                </div>
                <span className="ml-3 text-gray-800 font-medium group-hover:text-black transition-colors duration-200">否</span>
              </label>
            </div>
          </div>

          {/* 心仪海外院校名字 */}
          <div className="relative">
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              🌍 心仪海外院校名字
            </label>
            <input
              type="text"
              value={formData.targetSchool}
              onChange={(e) => handleInputChange('targetSchool', e.target.value)}
              placeholder="请输入心仪的海外院校名字"
              className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 text-gray-800 bg-gray-50/50 hover:bg-white hover:border-gray-300"
            />
          </div>

          {/* 提示词自定义组件 */}
          <PromptCustomizer
            promptData={promptData}
            onPromptChange={handlePromptChange}
            showPromptCard={showPromptCard}
            onTogglePromptCard={handleTogglePromptCard}
          />
        </div>
        
        {/* 操作按钮区域 */}
        <div className="mt-8 flex flex-col items-center space-y-4">
          <div className="flex justify-center space-x-4">
            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="px-8 py-4 bg-black text-white font-semibold rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 min-w-[200px] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  匹配中...
                </div>
              ) : (
                '🎯 开始匹配'
              )}
            </button>
            
            {hasData && (
              <button
                onClick={handleClearAll}
                className="px-6 py-4 bg-gray-100 text-gray-700 font-semibold rounded-2xl hover:bg-gray-200 focus:outline-none focus:ring-4 focus:ring-gray-400 transition-all duration-300"
              >
                🗑️ 清除数据
              </button>
            )}
          </div>
          
          {/* 进度提示 */}
          {isLoading && (
            <div className="bg-gray-100 border border-gray-300 rounded-2xl px-6 py-3 text-center">
              <div className="flex items-center justify-center">
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce mr-2"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce mr-2 animation-delay-100"></div>
                <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce animation-delay-200"></div>
                <span className="text-gray-700 font-medium ml-3">
                  {progressMessage || '正在处理请求...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

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
              <div>
                <span className="font-semibold text-gray-700">均分：</span>
                <span className="text-gray-600">{formData.gradeSystem} {formData.grade}分</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">状态：</span>
                <span className="text-gray-600">{formData.isCurrentStudent ? '在读' : '已毕业'}</span>
              </div>
              <div>
                <span className="font-semibold text-gray-700">目标院校：</span>
                <span className="text-gray-600">{formData.targetSchool}</span>
              </div>
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