import React from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  ColumnDef,
  flexRender,
  SortingState,
} from '@tanstack/react-table'
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

import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

export interface MatchedSchool {
  school_category: string
  qs_ranking: string
  chinese_name: string
  english_name: string
  course_link: string
  admission_requirement: string
  recommendation_reason: string
  education_group: string
  location: string
  comments: string
}

interface SchoolMatchingTableProps {
  schools: MatchedSchool[]
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
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [rowSelection, setRowSelection] = React.useState({})

  const columns: ColumnDef<MatchedSchool>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={table.getToggleAllPageRowsSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "school_category",
      header: "类别",
      cell: ({ row }) => (
        <Badge 
          variant="outline" 
          className={getCategoryColor(row.getValue("school_category"))}
        >
          {row.getValue("school_category")}
        </Badge>
      ),
    },
    {
      accessorKey: "qs_ranking",
      header: ({ column }) => {
        return (
          <div className="flex justify-center">
            <button
              className="flex items-center space-x-1 hover:text-gray-600"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              <span>QS排名</span>
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="h-4 w-4" />
              ) : (
                <ArrowUpDown className="h-4 w-4" />
              )}
            </button>
          </div>
        )
      },
      cell: ({ row }) => (
        <Badge 
          variant="outline"
          className={getRankingColor(row.getValue("qs_ranking"))}
        >
          #{row.getValue("qs_ranking")}
        </Badge>
      ),
      sortingFn: (rowA, rowB, columnId) => {
        const a = parseInt(rowA.getValue(columnId) as string)
        const b = parseInt(rowB.getValue(columnId) as string)
        return a - b
      },
    },
          {
        accessorKey: "chinese_name",
        header: () => (
          <div>
            院校名称
          </div>
        ),
        cell: ({ row }) => (
          <div className="px-2 py-1 rounded max-w-[150px] mx-auto">
            <div className="space-y-1">
              <div className="font-semibold text-gray-900 break-words whitespace-normal">
                {row.getValue("chinese_name")}
              </div>
              <div className="text-sm text-gray-600 break-words whitespace-normal">
                {row.original.english_name}
              </div>
            </div>
          </div>
        ),
      },
    {
      accessorKey: "education_group",
      header: "教育集团",
      cell: ({ row }) => {
        const educationGroup = row.getValue("education_group") as string
        if (!educationGroup) return null
        
        const groups = educationGroup.split(';').map(group => group.trim()).filter(group => group)
        
        return (
          <div className="flex flex-wrap justify-center gap-1 max-w-[120px] mx-auto">
            {groups.map((group, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {group}
              </Badge>
            ))}
          </div>
        )
      },
    },
    {
      accessorKey: "location",
      header: "位置",
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 max-w-[120px] block break-words whitespace-normal mx-auto">
          {row.getValue("location")}
        </span>
      ),
    },
    {
      accessorKey: "admission_requirement",
      header: "入学要求",
      cell: ({ row }) => (
        <div className="text-sm max-w-[160px] break-words whitespace-normal leading-relaxed mx-auto">
          {row.getValue("admission_requirement")}
        </div>
      ),
    },
    {
      accessorKey: "recommendation_reason",
      header: "推荐理由",
      cell: ({ row }) => (
        <div className="text-sm text-gray-700 max-w-[200px] break-words whitespace-normal leading-relaxed mx-auto">
          {row.getValue("recommendation_reason")}
        </div>
      ),
    },
    {
      accessorKey: "comments",
      header: "备注",
      cell: ({ row }) => (
        <div className="text-sm text-gray-700 max-w-[200px] break-words whitespace-normal leading-relaxed mx-auto">
          {row.getValue("comments")}
        </div>
      ),
    },
    {
      accessorKey: "course_link",
      header: "官网链接",
      cell: ({ row }) => (
        <div className="flex flex-col space-y-1">
          <a
            href={row.getValue("course_link")}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm underline"
          >
            查看官网
          </a>
        </div>
      ),
      enableSorting: false,
    },
  ]

  const table = useReactTable({
    data: schools,
    columns,
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
      rowSelection,
    },
  })
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

  const selectedRows = table.getFilteredSelectedRowModel().rows

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="flex items-center gap-2">
              🏫 院校匹配结果
              <Badge variant="outline" className="ml-2">
                {schools.length} 所院校
              </Badge>
              {selectedRows.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  已选择 {selectedRows.length} 所
                </Badge>
              )}
            </CardTitle>
          </div>
          {selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                onClick={() => {
                  const selectedSchools = selectedRows.map(row => row.original)
                  console.log('选中的学校：', selectedSchools)
                  // 这里可以添加导出或其他操作
                }}
              >
                导出选中
              </button>
              <button
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                onClick={() => table.toggleAllRowsSelected(false)}
              >
                取消选择
              </button>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableCaption>
              基于您的背景为您匹配的院校列表
            </TableCaption>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="text-center">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-gray-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-center">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    暂无数据
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 