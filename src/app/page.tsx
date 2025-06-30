'use client'

import { useState } from 'react'
import StepNavigation from '@/components/StepNavigation'
import SchoolMatching from '@/components/schoolmatching/SchoolMatching'
import MajorRequirementMatching from '@/components/MajorRequirementMatching'
import MajorBackgroundMatching from '@/components/MajorBackgroundMatching'
import GenerateReport from '@/components/GenerateReport'
import CaseCalibration from '@/components/CaseCalibration'

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  const handleStepClick = (step: number) => {
    // 只有当前步骤或者已完成的步骤的下一步可以点击
    if (step <= currentStep || completedSteps.includes(step - 1)) {
      setCurrentStep(step)
    }
  }

  const handleStepComplete = (step: number) => {
    if (!completedSteps.includes(step)) {
      setCompletedSteps([...completedSteps, step])
    }
    // 自动跳转到下一步
    if (step < 5) {
      setCurrentStep(step + 1)
    }
  }

  // 渲染所有步骤组件，通过CSS控制显示/隐藏（避免卸载组件）
  const renderAllSteps = () => {
    return (
      <>
        <div className={currentStep === 1 ? '' : 'hidden'}>
          <SchoolMatching onComplete={() => handleStepComplete(1)} />
        </div>
        <div className={currentStep === 2 ? '' : 'hidden'}>
          <MajorRequirementMatching onComplete={() => handleStepComplete(2)} />
        </div>
        <div className={currentStep === 3 ? '' : 'hidden'}>
          <MajorBackgroundMatching onComplete={() => handleStepComplete(3)} />
        </div>
        <div className={currentStep === 4 ? '' : 'hidden'}>
          <GenerateReport onComplete={() => handleStepComplete(4)} />
        </div>
        <div className={currentStep === 5 ? '' : 'hidden'}>
          <CaseCalibration onComplete={() => handleStepComplete(5)} />
        </div>
      </>
    )
  }

  return (
    <div className="min-h-screen bg-white">

      {/* 步骤导航 */}
      <StepNavigation 
        currentStep={currentStep} 
        completedSteps={completedSteps}
        onStepClick={handleStepClick}
      />

      {/* 当前步骤内容 */}
      <main>
        {renderAllSteps()}
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-500">
            <p>&copy; 2024 院校匹配系统. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
