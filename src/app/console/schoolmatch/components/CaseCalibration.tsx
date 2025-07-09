import React from 'react'

interface CaseCalibrationProps {
  onComplete: () => void
}

export default function CaseCalibration({ onComplete }: CaseCalibrationProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">案例库校准</h2>
        
        <div className="space-y-6">
          <div className="text-gray-600">
            <p>这里将实现案例库校准功能...</p>
            <p className="mt-2">内容待完善</p>
          </div>
          
          {/* 占位内容区域 */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <div className="text-gray-400">
              <h3 className="mt-2 text-sm font-medium text-gray-900">案例库校准内容区域</h3>
              <p className="mt-1 text-sm text-gray-500">此区域将用于实现案例库校准功能</p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 flex justify-end">
          <button
            onClick={onComplete}
            className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            完成所有步骤
          </button>
        </div>
      </div>
    </div>
  )
} 