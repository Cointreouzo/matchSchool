import React from 'react'
import { type SchoolMatchResponse } from '../../lib/api'
import { type FormData } from './SchoolMatchingForm'
import SchoolMatchingTable from './SchoolMatchingTable'
import ProjectTable from './ProjectTable'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface SchoolMatchingResultProps {
  matchResult: SchoolMatchResponse
  formData: FormData
  onClearResult: () => void
  onComplete: () => void
}

export default function SchoolMatchingResult({
  matchResult,
  formData,
  onClearResult,
  onComplete
}: SchoolMatchingResultProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-0 p-10 hover:shadow-3xl transition-all duration-300 mb-8 ">
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

      {/* 学生背景信息显示 */}
      {matchResult?.student_background && (
        <div className="bg-blue-50 rounded-2xl p-6 mb-8">
          <h3 className="font-semibold text-blue-800 mb-4">👤 学生背景分析</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-blue-700">本科院校：</span>
              <span className="text-blue-600">{matchResult.student_background.domestic_university}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-700">院校层级：</span>
              <span className="text-blue-600">{matchResult.student_background.university_level}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-700">GPA：</span>
              <span className="text-blue-600">{matchResult.student_background.gpa_info}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-700">专业背景：</span>
              <span className="text-blue-600">{matchResult.student_background.major_background}</span>
            </div>
          </div>
        </div>
      )}

      {/* 学校匹配表格 - 如果有匹配的学校数据就显示表格 */}
      {matchResult?.matched_schools && matchResult.matched_schools.length > 0 ? (
        <div className="mb-8">
          <SchoolMatchingTable schools={matchResult.matched_schools} />
        </div>
      ) : (
        /* 匹配结果内容 - 仅在没有表格数据时显示 */
        <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-6">
          <div className="max-w-none">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                // 自定义组件样式
                h1: ({children}) => (
                  <h1 className="text-3xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
                    {children}
                  </h1>
                ),
                h2: ({children}) => (
                  <h2 className="text-2xl font-bold text-gray-800 mb-4 mt-8">
                    {children}
                  </h2>
                ),
                h3: ({children}) => (
                  <h3 className="text-xl font-semibold text-gray-800 mb-3 mt-6 flex items-center">
                    {children}
                  </h3>
                ),
                h4: ({children}) => (
                  <h4 className="text-lg font-semibold text-gray-800 mb-3 mt-5 p-3 bg-blue-50 rounded-lg border-l-4 border-blue-400">
                    {children}
                  </h4>
                ),
                h5: ({children}) => (
                  <h5 className="text-base font-semibold text-gray-800 mb-2 mt-4">
                    {children}
                  </h5>
                ),
                h6: ({children}) => (
                  <h6 className="text-sm font-semibold text-gray-800 mb-2 mt-3">
                    {children}
                  </h6>
                ),
                p: ({children}) => (
                  <p className="text-gray-700 mb-4 leading-relaxed">
                    {children}
                  </p>
                ),
                ul: ({children}) => (
                  <ul className="list-none pl-0 mb-6 space-y-2">
                    {children}
                  </ul>
                ),
                ol: ({children}) => (
                  <ol className="list-decimal pl-6 mb-6 space-y-2">
                    {children}
                  </ol>
                ),
                li: ({children}) => (
                  <li className="text-gray-700 leading-relaxed flex items-start">
                    <span className="text-blue-500 mr-2 mt-1 text-xs">●</span>
                    <span>{children}</span>
                  </li>
                ),
                strong: ({children}) => (
                  <strong className="font-semibold text-gray-900  px-1 rounded">
                    {children}
                  </strong>
                ),
                em: ({children}) => (
                  <em className="italic text-blue-600 font-medium">
                    {children}
                  </em>
                ),
                blockquote: ({children}) => (
                  <blockquote className="border-l-4 border-blue-400 pl-6 py-4 my-6 bg-blue-50 rounded-r-lg italic text-gray-700">
                    {children}
                  </blockquote>
                ),
                code: ({children}) => (
                  <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-red-600 font-medium">
                    {children}
                  </code>
                ),
                pre: ({children}) => (
                  <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto mb-6 text-sm">
                    {children}
                  </pre>
                ),
                hr: () => (
                  <hr className="my-8 border-t-2 border-gray-200" />
                ),
                table: ({children}) => (
                  <div className="overflow-x-auto mb-6 rounded-lg border border-gray-200">
                    <table className="min-w-full divide-y divide-gray-200">
                      {children}
                    </table>
                  </div>
                ),
                thead: ({children}) => (
                  <thead className="bg-gray-50">
                    {children}
                  </thead>
                ),
                tbody: ({children}) => (
                  <tbody className="bg-white divide-y divide-gray-200">
                    {children}
                  </tbody>
                ),
                tr: ({children}) => (
                  <tr className="hover:bg-gray-50 transition-colors">
                    {children}
                  </tr>
                ),
                th: ({children}) => (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {children}
                  </th>
                ),
                td: ({children}) => (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {children}
                  </td>
                ),
              }}
            >
              {matchResult.response}
            </ReactMarkdown>
          </div>
        </div>
      )}

      {/* 推荐项目表格 - 如果有推荐项目数据就显示表格 */}
      {matchResult?.recommended_projects && matchResult.recommended_projects.length > 0 && (
        <ProjectTable projects={matchResult.recommended_projects} />
      )}

      {/* 时间戳和会话信息 */}
      <div className="text-center text-sm text-gray-500 mb-6">
        <div>匹配时间: {new Date(matchResult.timestamp).toLocaleString('zh-CN')}</div>
        <div className="text-xs mt-1">会话ID: {matchResult.session_id}</div>
      </div>
      
      {/* 结果操作按钮 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onClearResult}
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
  )
} 