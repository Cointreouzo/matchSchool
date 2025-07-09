import React, { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChevronUp, ChevronDown, ChevronsUpDown, ExternalLink } from "lucide-react"
import { type RecommendedProject } from '../../lib/api'

interface ProjectTableProps {
  projects: RecommendedProject[]
}

type SortField = 'school_ranking' | 'school_name' | 'project_name' | 'duration' | 'application_difficulty'
type SortDirection = 'asc' | 'desc' | null

interface SortConfig {
  field: SortField | null
  direction: SortDirection
}

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty.toLowerCase()) {
    case '简单':
    case 'easy':
      return 'bg-green-100 text-green-800 border-green-200'
    case '中等':
    case 'medium':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case '困难':
    case 'hard':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getRankingColor = (ranking: number) => {
  if (ranking <= 50) return 'bg-purple-100 text-purple-800 border-purple-200'
  if (ranking <= 100) return 'bg-orange-100 text-orange-800 border-orange-200'
  if (ranking <= 200) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function ProjectTable({ projects }: ProjectTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null })

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection = 'asc'
    
    if (sortConfig.field === field) {
      if (sortConfig.direction === 'asc') {
        newDirection = 'desc'
      } else if (sortConfig.direction === 'desc') {
        newDirection = null
      }
    }
    
    setSortConfig({ field: newDirection ? field : null, direction: newDirection })
  }

  const sortedProjects = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return projects
    }

    return [...projects].sort((a, b) => {
      const aValue = a[sortConfig.field!]
      const bValue = b[sortConfig.field!]
      
      if (sortConfig.field === 'school_ranking') {
        // 显式转为 number 排序，防止类型错误
        const aNum = Number(aValue)
        const bNum = Number(bValue)
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
      }
      
      // 其他字段用字符串比较
      const comparison = String(aValue).localeCompare(String(bValue), 'zh-CN')
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [projects, sortConfig])

  const SortableHeader = ({ field, children, className }: { 
    field: SortField, 
    children: React.ReactNode, 
    className?: string 
  }) => (
    <TableHead 
      className={`cursor-pointer select-none hover:bg-gray-50 ${className}`}
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center gap-1">
        {children}
        {sortConfig.field === field ? (
          sortConfig.direction === 'asc' ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )
        ) : (
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        )}
      </div>
    </TableHead>
  )

  if (!projects || projects.length === 0) {
    return null
  }

  return (
    <Card className="w-full mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📚 推荐项目
          <Badge variant="outline" className="ml-2">
            {projects.length} 个项目
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableCaption>
              基于您的背景为您推荐的具体项目列表
            </TableCaption>
            <TableHeader>
              <TableRow>
                <SortableHeader field="school_ranking" className="w-[80px]">学校排名</SortableHeader>
                <SortableHeader field="school_name" className="w-[120px]">学校名称</SortableHeader>
                <SortableHeader field="project_name" className="w-[180px]">项目名称</SortableHeader>
                <SortableHeader field="duration" className="w-[80px]">学制</SortableHeader>
                <TableHead className="w-[100px]">学费</TableHead>
                <TableHead className="w-[120px]">语言要求</TableHead>
                <TableHead className="w-[120px]">GPA要求</TableHead>
                <TableHead className="w-[100px]">GRE/GMAT</TableHead>
                <SortableHeader field="application_difficulty" className="w-[80px]">申请难度</SortableHeader>
                <TableHead className="w-[120px]">匹配标签</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedProjects.map((project, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={getRankingColor(project.school_ranking)}
                    >
                      #{project.school_ranking}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-gray-900 max-w-[120px] break-words whitespace-normal">
                      {project.school_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-[180px] break-words whitespace-normal leading-relaxed">
                      {project.project_name}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {project.duration}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm font-medium text-gray-900">
                      {project.tuition_fee}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-[120px] break-words whitespace-normal">
                      {project.ielts_requirement}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1 max-w-[120px]">
                      <div>百分制: {project.gpa_requirement.percentage}%</div>
                      <div>四分制: {project.gpa_requirement.four_point}</div>
                      <div className="text-gray-600">{project.gpa_requirement.uk_degree}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs space-y-1 max-w-[100px]">
                      <div className={project.gre_gmat_requirement.required === '不需要' ? 'text-green-600' : 'text-orange-600'}>
                        {project.gre_gmat_requirement.required}
                      </div>
                      {project.gre_gmat_requirement.type !== '无' && (
                        <div>{project.gre_gmat_requirement.type}: {project.gre_gmat_requirement.score}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getDifficultyColor(project.application_difficulty)}
                    >
                      {project.application_difficulty}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1 max-w-[120px]">
                      {project.matched_tags.map((tag, tagIndex) => (
                        <Badge key={tagIndex} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <a
                        href={project.project_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center gap-1"
                      >
                        查看详情
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}