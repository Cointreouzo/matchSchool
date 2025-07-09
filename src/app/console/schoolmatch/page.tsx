'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
// import { useAuth } from '@/components/providers/auth-provider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Shield, Loader2 } from 'lucide-react'
import StepNavigation from './components/StepNavigation'
import SchoolMatching from './components/schoolmatching/SchoolMatching'
import MajorRequirementMatching from './components/MajorRequirementMatching'
import MajorBackgroundMatching from './components/MajorBackgroundMatching'
import GenerateReport from './components/GenerateReport'
import CaseCalibration from './components/CaseCalibration'

/**
 * 检查用户是否有指定权限
 * @param userPermissions 用户权限列表
 * @param requiredPermission 所需权限
 * @returns 是否有权限
 */
function hasPermission(
  userPermissions: string[],
  requiredPermission: string
): boolean {
  if (!userPermissions || userPermissions.length === 0) {
    return false;
  }

  return userPermissions.some((permission) => {
    // 完全匹配
    if (permission === requiredPermission) {
      return true;
    }

    // 通配符匹配 (例如 "schoolmatch.*" 匹配 "schoolmatch.view")
    if (permission.endsWith(".*")) {
      const prefix = permission.slice(0, -2);
      return requiredPermission.startsWith(prefix + ".");
    }

    // 全权限匹配
    if (permission === "*") {
      return true;
    }

    return false;
  });
}

export default function Home() {
  // const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 权限验证（已注释认证相关逻辑）
  useEffect(() => {
    setIsLoading(false);
  }, []);

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

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <Card className="w-96">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center space-x-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>正在验证权限...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // 检查权限（已注释认证相关逻辑）
  // const userPermissions = user?.permissions ? (user.permissions as string[]) : [];
  // const hasSchoolmatchPermission =
  //   user?.role === 'admin' ||
  //   hasPermission(userPermissions, 'schoolmatch.*');
  // if (!hasSchoolmatchPermission) {
  //   return (
  //     <div className="min-h-screen bg-white flex items-center justify-center">
  //       <Card className="w-96">
  //         <CardHeader>
  //           <CardTitle className="flex items-center space-x-2">
  //             <Shield className="h-5 w-5" />
  //             <span>访问受限</span>
  //           </CardTitle>
  //         </CardHeader>
  //         <CardContent>
  //           <Alert>
  //             <AlertDescription>
  //               您没有访问院校匹配系统的权限，请联系管理员获取权限。
  //             </AlertDescription>
  //           </Alert>
  //         </CardContent>
  //       </Card>
  //     </div>
  //   )
  // }

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
            <p>&copy; 2025 院校匹配系统. 保留所有权利.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
