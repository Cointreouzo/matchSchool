'use client'

import React from 'react'
import { Steps } from 'antd'
import type { StepProps } from 'antd'

interface StepNavigationProps {
  currentStep: number
  completedSteps: number[]
  onStepClick: (step: number) => void
}

const steps = [
  { id: 1, name: '院校匹配', key: 'school-matching', description: '基础信息收集' },
  { id: 2, name: '专业需求匹配', key: 'major-requirement-matching', description: '专业偏好分析' },
  { id: 3, name: '专业背景匹配', key: 'major-background-matching', description: '学术背景评估' },
  { id: 4, name: '生成推荐报告', key: 'generate-report', description: '智能推荐生成' },
  { id: 5, name: '案例库校准', key: 'case-calibration', description: '方案优化调整' }
]

export default function StepNavigation({ currentStep, completedSteps, onStepClick }: StepNavigationProps) {
  const currentStepData = steps.find(step => step.id === currentStep)
  const canGoPrevious = currentStep > 1
  const canGoNext = currentStep < steps.length && (completedSteps.includes(currentStep) || currentStep === 1)

  const handlePrevious = () => {
    if (canGoPrevious) {
      onStepClick(currentStep - 1)
    }
  }

  const handleNext = () => {
    if (canGoNext) {
      onStepClick(currentStep + 1)
    }
  }

  // 将步骤数据转换为 Ant Design Steps 格式
  const stepsItems = steps.map((step) => {
    const isActive = step.id === currentStep
    const isCompleted = completedSteps.includes(step.id)
    const isClickable = step.id === 1 || completedSteps.includes(step.id - 1) || isCompleted

    let status: StepProps['status'] = 'wait'
    if (isCompleted && !isActive) {
      status = 'finish'
    } else if (isActive) {
      status = 'process'
    } else if (!isClickable) {
      status = 'wait'
    }

    return {
      title: step.name,
      description: step.description,
      status,
      disabled: !isClickable,
    }
  })

  const handleStepChange = (current: number) => {
    const stepId = current + 1 // Steps 组件从 0 开始，我们的步骤从 1 开始
    const isClickable = stepId === 1 || completedSteps.includes(stepId - 1) || completedSteps.includes(stepId)
    
    if (isClickable) {
      onStepClick(stepId)
    }
  }

  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-20">
      {/* 桌面端完整步骤导航 */}
      <div className="hidden lg:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Steps
          type="navigation"
          current={currentStep - 1}
          onChange={handleStepChange}
          items={stepsItems}
          className="custom-steps"
          style={{
            '--ant-primary-color': '#000000',
            '--ant-primary-color-hover': '#333333',
            '--ant-primary-color-active': '#000000',
            '--ant-steps-nav-active-border-color': '#000000',
          } as React.CSSProperties}
        />
      </div>

      {/* 移动端简化导航 */}
      <div className="lg:hidden px-4 py-4">
        <div className="flex items-center justify-between max-w-md mx-auto">
          {/* 左箭头 */}
          <button
            onClick={handlePrevious}
            disabled={!canGoPrevious}
            className={`p-3 rounded-full transition-all duration-200 ${
              canGoPrevious
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* 当前步骤信息 */}
          <div className="flex-1 text-center mx-4">
            <div className="flex items-center justify-center space-x-3 mb-2">
              {/* 步骤圆点 */}
              <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-semibold">
                {currentStep}
              </div>
              <div className="text-sm text-gray-500">
                {currentStep} / {steps.length}
              </div>
            </div>
            <h3 className="text-lg font-semibold text-black mb-1">
              {currentStepData?.name}
            </h3>
            <p className="text-sm text-gray-600">
              {currentStepData?.description}
            </p>
          </div>

          {/* 右箭头 */}
          <button
            onClick={handleNext}
            disabled={!canGoNext}
            className={`p-3 rounded-full transition-all duration-200 ${
              canGoNext
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-black'
                : 'bg-gray-50 text-gray-300 cursor-not-allowed'
            }`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* 进度条 */}
        <div className="mt-4 max-w-md mx-auto">
          <div className="flex justify-between mb-2">
            <span className="text-xs text-gray-500">进度</span>
            <span className="text-xs text-gray-500">{Math.round((completedSteps.length / steps.length) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-500"
              style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
            ></div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        /* 黑白主题的 Ant Design Steps 样式 */
        .custom-steps.ant-steps {
          /* 重置所有步骤的基础样式 */
          .ant-steps-item-icon {
            background-color: #fff !important;
            border-color: #d9d9d9 !important;
          }

          .ant-steps-item-icon .ant-steps-icon {
            color: #d9d9d9 !important;
          }

          /* 已完成步骤样式 */
          .ant-steps-item-finish .ant-steps-item-icon {
            background-color: #000 !important;
            border-color: #000 !important;
          }
        
          .ant-steps-item-finish .ant-steps-item-icon > .ant-steps-icon {
            color: #fff !important;
          }

          .ant-steps-item-finish .ant-steps-item-title {
            color: #000 !important;
          }

          .ant-steps-item-finish .ant-steps-item-description {
            color: #666 !important;
          }
        
          /* 当前进行中步骤样式 */
          .ant-steps-item-process .ant-steps-item-icon {
            background-color: #000 !important;
            border-color: #000 !important;
          }
        
          .ant-steps-item-process .ant-steps-item-icon > .ant-steps-icon {
            color: #fff !important;
          }

          .ant-steps-item-process .ant-steps-item-title {
            color: #000 !important;
            font-weight: 600 !important;
          }

          .ant-steps-item-process .ant-steps-item-description {
            color: #666 !important;
          }
        
          /* 等待状态步骤样式 */
          .ant-steps-item-wait .ant-steps-item-icon {
            background-color: #fff !important;
            border-color: #d9d9d9 !important;
          }
        
          .ant-steps-item-wait .ant-steps-item-icon > .ant-steps-icon {
            color: #d9d9d9 !important;
          }

          .ant-steps-item-wait .ant-steps-item-title {
            color: #d9d9d9 !important;
          }

          .ant-steps-item-wait .ant-steps-item-description {
            color: #d9d9d9 !important;
          }

          /* 连接线样式 - 这是关键部分 */
          .ant-steps-item .ant-steps-item-tail::after {
            background-color: #d9d9d9 !important;
          }

          .ant-steps-item-finish .ant-steps-item-tail::after {
            background-color: #000 !important;
          }

          /* 确保当前步骤的连接线是灰色的 */
          .ant-steps-item-process .ant-steps-item-tail::after {
            background-color: #d9d9d9 !important;
          }

          /* 禁用状态的步骤 */
          .ant-steps-item-disabled {
            cursor: not-allowed !important;
          }
        
          /* 可点击的步骤悬停效果 */
          .ant-steps-item:not(.ant-steps-item-disabled):not(.ant-steps-item-process):hover .ant-steps-item-icon {
            border-color: #666 !important;
          }
        
          .ant-steps-item:not(.ant-steps-item-disabled):not(.ant-steps-item-process):hover .ant-steps-item-title {
            color: #666 !important;
          }
        }

        /* 额外的全局覆盖，确保没有蓝色残留 */
        .custom-steps .ant-steps-item-tail::after {
          background: #d9d9d9 !important;
          background-color: #d9d9d9 !important;
        }

        .custom-steps .ant-steps-item-finish .ant-steps-item-tail::after {
          background: #000 !important;
          background-color: #000 !important;
        }

        /* navigation 模式下，激活步骤下划线颜色 → 黑色 */
        .custom-steps.ant-steps-navigation .ant-steps-item-active .ant-steps-item-container::after {
          background-color: #000 !important;
        }

        .custom-steps.ant-steps-navigation .ant-steps-item-active .ant-steps-item-title {
          color: #000 !important;
        }

        .custom-steps.ant-steps-navigation .ant-steps-item-active .ant-steps-item-description {
          color: #666 !important;
        }

        .custom-steps.ant-steps-navigation .ant-steps-item-finish:hover .ant-steps-item-container {
          border-color: #000 !important;
        }

        /* 修复动画下划线的具体选择器 */
        .custom-steps div.ant-steps-item.ant-steps-item-process.ant-steps-item-active:before,
        .custom-steps div.ant-steps-item.ant-steps-item-process.ant-steps-item-active::before,
        .custom-steps .ant-steps-item.ant-steps-item-process.ant-steps-item-active:before,
        .custom-steps .ant-steps-item.ant-steps-item-process.ant-steps-item-active::before {
          background-color: #000 !important;
          background: #000 !important;
        }

        /* 只覆盖颜色，保留原有动画 */
        .custom-steps .ant-steps-item:before,
        .custom-steps .ant-steps-item::before {
          background-color: #000 !important;
        }

        /* 覆盖可能的动画关键帧颜色，但保留动画属性 */
        .custom-steps {
          --ant-primary-color: #000 !important;
          --ant-primary-color-hover: #000 !important;
          --ant-primary-color-active: #000 !important;
        }
      `}</style>
    </div>
  )
} 