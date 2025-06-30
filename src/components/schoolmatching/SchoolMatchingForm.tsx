import React from 'react'
import PromptCustomizer, { type PromptData } from '../PromptCustomizer'
import { toast } from "sonner"

export interface FormData {
  studentSchool: string
  gradeSystem: string
  grade: string
  isCurrentStudent: boolean
  targetSchool: string
  major: string
  languageTestType: string
  languageTestScore: string
  standardizedTestType: string
  standardizedTestScore: string
  requirements: string
}

interface SchoolMatchingFormProps {
  formData: FormData
  promptData: PromptData
  showPromptCard: boolean
  isLoading: boolean
  progressMessage: string
  hasData: boolean
  onInputChange: (field: string, value: string | boolean) => void
  onPromptChange: (field: string, value: string) => void
  onTogglePromptCard: () => void
  onGradeSystemChange: (newSystem: string) => void
  onGradeChange: (grade: string) => void
  onSubmit: () => void
  onClearAll: () => void
}

export default function SchoolMatchingForm({
  formData,
  promptData,
  showPromptCard,
  isLoading,
  progressMessage,
  hasData,
  onInputChange,
  onPromptChange,
  onTogglePromptCard,
  onGradeSystemChange,
  onGradeChange,
  onSubmit,
  onClearAll
}: SchoolMatchingFormProps) {

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

  const getLanguageTestScorePlaceholder = () => {
    switch (formData.languageTestType) {
      case '雅思':
        return '请输入0-9的分数'
      case '托福':
        return '请输入0-120的分数'
      case '多邻国':
        return '请输入0-160的分数'
      default:
        return '请输入分数'
    }
  }

  const getStandardizedTestScorePlaceholder = () => {
    switch (formData.standardizedTestType) {
      case 'GRE':
        return '请输入260-340的分数'
      case 'GMAT':
        return '请输入200-800的分数'
      default:
        return '请输入分数'
    }
  }

  return (
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
            onChange={(e) => onInputChange('studentSchool', e.target.value)}
            placeholder="请输入学校名字"
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 text-gray-800 bg-gray-50/50 hover:bg-white hover:border-gray-300"
          />
        </div>

        {/* 专业输入框 */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            📚 专业
          </label>
          <input
            type="text"
            value={formData.major}
            onChange={(e) => onInputChange('major', e.target.value)}
            placeholder="请输入专业名称，如：计算机科学、金融学、市场营销等"
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
                onChange={(e) => onGradeSystemChange(e.target.value)}
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
              onChange={(e) => onGradeChange(e.target.value)}
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
                  onChange={() => onInputChange('isCurrentStudent', true)}
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
                  onChange={() => onInputChange('isCurrentStudent', false)}
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

        {/* 语言考试成绩 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            🗣️ 语言考试成绩
          </label>
          <div className="flex space-x-4">
            {/* 语言考试类型选择 */}
            <div className="relative">
              <select
                value={formData.languageTestType}
                onChange={(e) => onInputChange('languageTestType', e.target.value)}
                className="appearance-none px-5 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 font-medium text-gray-800 min-w-[140px] cursor-pointer"
              >
                <option value="">选择考试类型</option>
                <option value="雅思">雅思 (IELTS)</option>
                <option value="托福">托福 (TOEFL)</option>
                <option value="多邻国">多邻国 (Duolingo)</option>
              </select>
              {/* 自定义下拉箭头 */}
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* 语言考试分数输入 */}
            <input
              type="number"
              value={formData.languageTestScore}
              onChange={(e) => onInputChange('languageTestScore', e.target.value)}
              placeholder={getLanguageTestScorePlaceholder()}
              disabled={!formData.languageTestType}
              className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 text-gray-800 bg-gray-50/50 hover:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              min="0"
              max={formData.languageTestType === '雅思' ? '9' : formData.languageTestType === '托福' ? '120' : formData.languageTestType === '多邻国' ? '160' : ''}
              step={formData.languageTestType === '雅思' ? '0.5' : '1'}
            />
          </div>
          {/* 分数范围提示 */}
          {formData.languageTestType && (
            <p className="text-xs text-gray-500 mt-2">
              {formData.languageTestType === '雅思' && '范围：0-9分（支持0.5分档）'}
              {formData.languageTestType === '托福' && '范围：0-120分'}
              {formData.languageTestType === '多邻国' && '范围：0-160分'}
            </p>
          )}
        </div>

        {/* 标准化考试成绩 */}
        <div>
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            📝 标准化考试成绩
          </label>
          <div className="flex space-x-4">
            {/* 标准化考试类型选择 */}
            <div className="relative">
              <select
                value={formData.standardizedTestType}
                onChange={(e) => onInputChange('standardizedTestType', e.target.value)}
                className="appearance-none px-5 py-4 pr-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 bg-gray-50/50 hover:bg-white hover:border-gray-300 font-medium text-gray-800 min-w-[120px] cursor-pointer"
              >
                <option value="">选择考试类型</option>
                <option value="GRE">GRE</option>
                <option value="GMAT">GMAT</option>
                <option value="无">无</option>
              </select>
              {/* 自定义下拉箭头 */}
              <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            
            {/* 标准化考试分数输入 */}
            <input
              type="number"
              value={formData.standardizedTestScore}
              onChange={(e) => onInputChange('standardizedTestScore', e.target.value)}
              placeholder={getStandardizedTestScorePlaceholder()}
              disabled={!formData.standardizedTestType || formData.standardizedTestType === '无'}
              className="flex-1 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 text-gray-800 bg-gray-50/50 hover:bg-white hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
              min={formData.standardizedTestType === 'GRE' ? '260' : formData.standardizedTestType === 'GMAT' ? '200' : '0'}
              max={formData.standardizedTestType === 'GRE' ? '340' : formData.standardizedTestType === 'GMAT' ? '800' : ''}
            />
          </div>
          {/* 分数范围提示 */}
          {formData.standardizedTestType && formData.standardizedTestType !== '无' && (
            <p className="text-xs text-gray-500 mt-2">
              {formData.standardizedTestType === 'GRE' && '范围：260-340分'}
              {formData.standardizedTestType === 'GMAT' && '范围：200-800分'}
            </p>
          )}
        </div>

        {/* 心仪海外院校名字 */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            🌍 心仪海外院校名字
          </label>
          <input
            type="text"
            value={formData.targetSchool}
            onChange={(e) => onInputChange('targetSchool', e.target.value)}
            placeholder="请输入心仪的海外院校名字"
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 text-gray-800 bg-gray-50/50 hover:bg-white hover:border-gray-300"
          />
        </div>

        {/* 其他需求 */}
        <div className="relative">
          <label className="block text-sm font-semibold text-gray-800 mb-3">
            💭 其他需求或补充信息
          </label>
          <textarea
            value={formData.requirements}
            onChange={(e) => onInputChange('requirements', e.target.value)}
            placeholder="请输入其他需求或补充信息，如：希望的地理位置、学费预算、特殊要求等..."
            rows={4}
            className="w-full px-5 py-4 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-gray-200 focus:border-gray-400 transition-all duration-200 text-gray-800 bg-gray-50/50 hover:bg-white hover:border-gray-300 resize-vertical min-h-[120px]"
          />
          <p className="text-xs text-gray-500 mt-2">
            选填：可以补充任何有助于院校匹配的额外信息
          </p>
        </div>

        {/* 提示词自定义组件 */}
        <PromptCustomizer
          promptData={promptData}
          onPromptChange={onPromptChange}
          showPromptCard={showPromptCard}
          onTogglePromptCard={onTogglePromptCard}
        />
      </div>
      
      {/* 操作按钮区域 */}
      <div className="mt-8 flex flex-col items-center space-y-4">
        <div className="flex justify-center space-x-4">
          <button
            onClick={onSubmit}
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
              onClick={onClearAll}
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
  )
} 