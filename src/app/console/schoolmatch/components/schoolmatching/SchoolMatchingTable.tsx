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
import { ChevronUp, ChevronDown, ChevronsUpDown } from "lucide-react"

export interface MatchedSchool {
  school_category: string
  qs_ranking: string
  chinese_name: string
  english_name: string
  course_link: string
  admission_requirement: string
  recommendation_reason: string
  major_category: string
  location: string
  comments: string
}

interface SchoolMatchingTableProps {
  schools: MatchedSchool[]
}

type SortField = 'qs_ranking' | 'chinese_name' | 'school_category' | 'location' | 'major_category'
type SortDirection = 'asc' | 'desc' | null

interface SortConfig {
  field: SortField | null
  direction: SortDirection
}

const getCategoryColor = (category: string) => {
  switch (category.toLowerCase()) {
    case '冲刺':
      return 'bg-red-100 text-red-800 border-red-200'
    case '匹配':
      return 'bg-green-100 text-green-800 border-green-200'
    case '保底':
      return 'bg-blue-100 text-blue-800 border-blue-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

const getRankingColor = (ranking: string) => {
  const rank = parseInt(ranking)
  if (rank <= 10) return 'bg-purple-100 text-purple-800 border-purple-200'
  if (rank <= 50) return 'bg-orange-100 text-orange-800 border-orange-200'
  if (rank <= 100) return 'bg-yellow-100 text-yellow-800 border-yellow-200'
  return 'bg-gray-100 text-gray-800 border-gray-200'
}

export default function SchoolMatchingTable({ schools }: SchoolMatchingTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null })

  // 排序处理函数
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

  // 排序后的数据
  const sortedSchools = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return schools
    }

    return [...schools].sort((a, b) => {
      const aValue = a[sortConfig.field!]
      const bValue = b[sortConfig.field!]
      
      // 特殊处理QS排名（数字排序）
      if (sortConfig.field === 'qs_ranking') {
        const aNum = parseInt(aValue) || 9999
        const bNum = parseInt(bValue) || 9999
        return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum
      }
      
      // 字符串排序
      const comparison = aValue.localeCompare(bValue, 'zh-CN')
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }, [schools, sortConfig])

  // 可点击的表头组件
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

  if (!schools || schools.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>🏫 院校匹配结果</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">暂无匹配数据</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🏫 院校匹配结果
          <Badge variant="outline" className="ml-2">
            {schools.length} 所院校
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableCaption>
              基于您的背景为您匹配的院校列表
            </TableCaption>
            <TableHeader>
              <TableRow>
                <SortableHeader field="school_category" className="w-[70px]">类别</SortableHeader>
                <SortableHeader field="qs_ranking" className="w-[80px]">QS排名</SortableHeader>
                <SortableHeader field="chinese_name" className="w-[120px]">院校名称</SortableHeader>
                <SortableHeader field="major_category" className="w-[100px]">专业类别</SortableHeader>
                <SortableHeader field="location" className="w-[120px]">位置</SortableHeader>
                <TableHead className="w-[160px]">入学要求</TableHead>
                <TableHead className="w-[200px]">推荐理由</TableHead>
                <TableHead className="w-[200px]">备注</TableHead>
                <TableHead className="w-[100px]">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSchools.map((school, index) => (
                <TableRow key={index} className="hover:bg-gray-50">
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={getCategoryColor(school.school_category)}
                    >
                      {school.school_category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className={getRankingColor(school.qs_ranking)}
                    >
                      #{school.qs_ranking}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 max-w-[150px]">
                      <div className="font-semibold text-gray-900 break-words whitespace-normal">
                        {school.chinese_name}
                      </div>
                      <div className="text-sm text-gray-600 break-words whitespace-normal">
                        {school.english_name}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {school.major_category}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-gray-600 max-w-[120px] block break-words whitespace-normal">
                      {school.location}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm max-w-[160px] break-words whitespace-normal leading-relaxed">
                      {school.admission_requirement}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-700 max-w-[200px] break-words whitespace-normal leading-relaxed">
                      {school.recommendation_reason}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-700 max-w-[200px] break-words whitespace-normal leading-relaxed">
                      {school.comments}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <a
                        href={school.course_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 text-sm underline"
                      >
                        查看课程
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