//自定义提示词

import React from 'react'

interface PromptData {
  role: string
  task: string
  output_format: string
}

interface PromptCustomizerProps {
  promptData: PromptData
  onPromptChange: (field: string, value: string) => void
  showPromptCard: boolean
  onTogglePromptCard: () => void
}

export default function PromptCustomizer({
  promptData,
  onPromptChange,
  showPromptCard,
  onTogglePromptCard
}: PromptCustomizerProps) {
  return (
    <>
      {/* 提示词卡片切换按钮 */}
      <div className="border-t border-gray-200 pt-6">
        <button
          onClick={onTogglePromptCard}
          className="flex items-center justify-between w-full px-4 py-3 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all duration-200"
        >
          <div className="flex items-center">
            <span className="text-lg mr-2">🔧</span>
            <span className="font-semibold text-gray-800">自定义提示词</span>
            <span className="text-xs text-gray-500 ml-2">（调试用）</span>
          </div>
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${showPromptCard ? 'rotate-180' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* 提示词卡片 */}
      {showPromptCard && (
        <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 space-y-4">
          <div className="flex items-center mb-4">
            <span className="text-gray-600 text-sm font-semibold">⚙️ 调试模式：自定义提示词参数</span>
          </div>
          
          {/* Role 输入 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              🎭 Role (角色提示词)
            </label>
            <textarea
              value={promptData.role}
              onChange={(e) => onPromptChange('role', e.target.value)}
              placeholder="例如：你是一名专业的留学咨询顾问..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition-all duration-200 text-gray-700 bg-white/80 resize-none"
              rows={2}
            />
          </div>

          {/* Task 输入 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📋 Task (任务提示词)
            </label>
            <textarea
              value={promptData.task}
              onChange={(e) => onPromptChange('task', e.target.value)}
              placeholder="例如：请根据学生背景匹配合适的海外院校..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition-all duration-200 text-gray-700 bg-white/80 resize-none"
              rows={2}
            />
          </div>

          {/* Output Format 输入 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📄 Output Format (输出格式提示词)
            </label>
            <textarea
              value={promptData.output_format}
              onChange={(e) => onPromptChange('output_format', e.target.value)}
              placeholder="例如：请以Markdown格式输出，包含匹配分析、推荐院校列表等..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-500 transition-all duration-200 text-gray-700 bg-white/80 resize-none"
              rows={2}
            />
          </div>
        </div>
      )}
    </>
  )
}

// 导出类型定义供其他组件使用
export type { PromptData } 