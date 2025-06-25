import React, { useState, useEffect } from 'react'

// 模拟学校数据
const mockSchools = [
  '清华大学', '北京大学', '复旦大学', '上海交通大学', '浙江大学',
  '南京大学', '中国科学技术大学', '哈尔滨工业大学', '西安交通大学',
  '北京理工大学', '天津大学', '东南大学', '华中科技大学', '北京航空航天大学'
]

const mockOverseasSchools = [
  'Harvard University', 'Stanford University', 'MIT', 'Oxford University',
  'Cambridge University', 'Yale University', 'Princeton University',
  'University of Toronto', 'University of British Columbia', 'McGill University',
  'University of Melbourne', 'Australian National University', 'University of Sydney'
]

interface SchoolMatchingProps {
  onComplete: () => void
}

export default function SchoolMatching({ onComplete }: SchoolMatchingProps) {
  const [formData, setFormData] = useState({
    studentSchool: '',
    gradeSystem: '百分制',
    grade: '',
    isCurrentStudent: true,
    targetSchool: ''
  })

  const [schoolSuggestions, setSchoolSuggestions] = useState<string[]>([])
  const [overseasSuggestions, setOverseasSuggestions] = useState<string[]>([])
  const [showSchoolSuggestions, setShowSchoolSuggestions] = useState(false)
  const [showOverseasSuggestions, setShowOverseasSuggestions] = useState(false)

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

  // 实时查询国内学校
  useEffect(() => {
    if (formData.studentSchool.trim()) {
      const filtered = mockSchools.filter(school =>
        school.toLowerCase().includes(formData.studentSchool.toLowerCase())
      )
      setSchoolSuggestions(filtered.slice(0, 5))
      setShowSchoolSuggestions(filtered.length > 0)
    } else {
      setShowSchoolSuggestions(false)
    }
  }, [formData.studentSchool])

  // 实时查询海外学校
  useEffect(() => {
    if (formData.targetSchool.trim()) {
      const filtered = mockOverseasSchools.filter(school =>
        school.toLowerCase().includes(formData.targetSchool.toLowerCase())
      )
      setOverseasSuggestions(filtered.slice(0, 5))
      setShowOverseasSuggestions(filtered.length > 0)
    } else {
      setShowOverseasSuggestions(false)
    }
  }, [formData.targetSchool])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
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

  return (
    <div className="max-w-4xl mx-auto px-6 sm:px-8 lg:px-12 py-16  min-h-screen">
      <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-0 p-10 hover:shadow-3xl transition-all duration-300">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-black mb-3">
            院校匹配
          </h2>
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
            {/* 学校建议列表 */}
            {showSchoolSuggestions && (
              <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                {schoolSuggestions.map((school, index) => (
                  <div
                    key={index}
                    className="px-5 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      handleInputChange('studentSchool', school)
                      setShowSchoolSuggestions(false)
                    }}
                  >
                    <span className="text-gray-800 font-medium">{school}</span>
                  </div>
                ))}
              </div>
            )}
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
                  <option value="百分制">英国学位制</option>
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
            {/* 海外学校建议列表 */}
            {showOverseasSuggestions && (
              <div className="absolute z-20 w-full mt-2 bg-white/95 backdrop-blur-sm border border-gray-200 rounded-2xl shadow-xl max-h-48 overflow-y-auto">
                {overseasSuggestions.map((school, index) => (
                  <div
                    key={index}
                    className="px-5 py-3 hover:bg-gray-100 cursor-pointer transition-colors duration-150 first:rounded-t-2xl last:rounded-b-2xl border-b border-gray-100 last:border-b-0"
                    onClick={() => {
                      handleInputChange('targetSchool', school)
                      setShowOverseasSuggestions(false)
                    }}
                  >
                    <span className="text-gray-800 font-medium">{school}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-12 flex justify-center">
          <button
            onClick={onComplete}
            className="px-8 py-4 bg-black text-white font-semibold rounded-2xl hover:bg-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-all duration-300 transform hover:scale-105 hover:shadow-xl active:scale-95 min-w-[200px]"
          >
            ✨ 完成此步骤
          </button>
        </div>
      </div>
    </div>
  )
} 