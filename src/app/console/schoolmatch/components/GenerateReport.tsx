import React from 'react'

interface GenerateReportProps {
  onComplete: () => void
}

export default function GenerateReport({ onComplete }: GenerateReportProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">生成推荐报告</h2>
        
        <div className="space-y-6">
          <div className="text-gray-600">
            <p>这里将实现生成推荐报告功能...</p>
            <p className="mt-2">内容待完善</p>
          </div>
          
          {/* 占位内容区域 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-gray-400">
              <h3 className="mt-2 text-sm font-medium text-gray-900">生成推荐报告内容区域</h3>
              <p className="mt-1 text-sm text-gray-500">此区域将用于实现生成推荐报告功能</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          >
            完成此步骤
          </button>
        </div>
      </div>
    </div>
  )
} 