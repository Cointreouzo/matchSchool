'use client'

import { useState } from 'react'
import StepNavigation from '@/components/StepNavigation'
import SchoolMatching from '@/components/SchoolMatching'
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

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return <SchoolMatching onComplete={() => handleStepComplete(1)} />
      case 2:
        return <MajorRequirementMatching onComplete={() => handleStepComplete(2)} />
      case 3:
        return <MajorBackgroundMatching onComplete={() => handleStepComplete(3)} />
      case 4:
        return <GenerateReport onComplete={() => handleStepComplete(4)} />
      case 5:
        return <CaseCalibration onComplete={() => handleStepComplete(5)} />
      default:
        return <SchoolMatching onComplete={() => handleStepComplete(1)} />
    }
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
        {renderCurrentStep()}
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
