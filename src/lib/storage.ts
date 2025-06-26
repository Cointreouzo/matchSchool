/**
 * 通用的 localStorage 管理工具类
 */
class StorageManager<T extends Record<string, any>> {
  private prefix: string

  constructor(prefix: string) {
    this.prefix = prefix
  }

  /**
   * 生成存储键名
   */
  private getKey(key: keyof T): string {
    return `${this.prefix}_${String(key)}`
  }

  /**
   * 从 localStorage 读取数据
   */
  get<K extends keyof T>(key: K, defaultValue: T[K]): T[K] {
    if (typeof window === 'undefined') {
      // 服务端渲染时返回默认值
      if (process.env.NODE_ENV === 'development') {
        console.log('非浏览器环境，返回默认值')
      }
      return defaultValue
    }

    try {
      const storageKey = this.getKey(key)
      const item = localStorage.getItem(storageKey)
      
      if (item === null) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`localStorage中未找到 ${storageKey}，使用默认值`)
        }
        return defaultValue
      }

      const parsed = JSON.parse(item) as T[K]
      if (process.env.NODE_ENV === 'development') {
        console.log(`从localStorage读取 ${storageKey}:`, parsed)
      }
      return parsed
    } catch (error) {
      console.warn(`从localStorage读取 ${String(key)} 失败:`, error)
      return defaultValue
    }
  }

  /**
   * 保存数据到 localStorage
   */
  set<K extends keyof T>(key: K, data: T[K]): void {
    if (typeof window === 'undefined') {
      // 服务端渲染时跳过
      if (process.env.NODE_ENV === 'development') {
        console.log('非浏览器环境，跳过保存')
      }
      return
    }

    try {
      const storageKey = this.getKey(key)
      const serialized = JSON.stringify(data)
      localStorage.setItem(storageKey, serialized)
      
      if (process.env.NODE_ENV === 'development') {
        console.log(`保存到localStorage ${storageKey}:`, data)
      }
    } catch (error) {
      console.warn(`保存到localStorage失败 ${String(key)}:`, error)
    }
  }

  /**
   * 删除指定键的数据
   */
  remove<K extends keyof T>(key: K): void {
    if (typeof window === 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        console.log('非浏览器环境，跳过删除')
      }
      return
    }

    try {
      const storageKey = this.getKey(key)
      localStorage.removeItem(storageKey)
      if (process.env.NODE_ENV === 'development') {
        console.log(`从localStorage删除 ${storageKey}`)
      }
    } catch (error) {
      console.warn(`从localStorage删除 ${String(key)} 失败:`, error)
    }
  }

  /**
   * 清除所有相关数据
   */
  clear(): void {
    if (typeof window === 'undefined') {
      if (process.env.NODE_ENV === 'development') {
        console.log('非浏览器环境，跳过清除')
      }
      return
    }

    try {
      // 获取所有以前缀开头的键并删除
      Object.keys(localStorage)
        .filter(key => key.startsWith(`${this.prefix}_`))
        .forEach(key => localStorage.removeItem(key))
      
      if (process.env.NODE_ENV === 'development') {
        console.log('已清除所有指定的localStorage数据')
      }
    } catch (error) {
      console.warn('清除localStorage数据失败:', error)
    }
  }

  /**
   * 获取存储使用情况信息
   */
  getStorageInfo(): { 
    totalSize: number; 
    relatedKeys: string[]; 
    relatedSize: number; 
  } {
    if (typeof window === 'undefined') {
      return { totalSize: 0, relatedKeys: [], relatedSize: 0 }
    }

    try {
      let totalSize = 0
      let relatedSize = 0
      const relatedKeys: string[] = []

      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          const value = localStorage.getItem(key) || ''
          const size = key.length + value.length
          totalSize += size

          if (key.startsWith(`${this.prefix}_`)) {
            relatedKeys.push(key)
            relatedSize += size
          }
        }
      }

      return { totalSize, relatedKeys, relatedSize }
    } catch (error) {
      console.warn('获取localStorage信息失败:', error)
      return { totalSize: 0, relatedKeys: [], relatedSize: 0 }
    }
  }
}

// 定义学校匹配相关的存储数据类型
interface SchoolMatchingStorageData {
  // 表单数据
  formData: {
    studentSchool: string
    gradeSystem: string
    grade: string
    isCurrentStudent: boolean
    targetSchool: string
  }
  // 提示词数据
  promptData: {
    role: string
    task: string
    output_format: string
  }
  // 匹配结果
  matchResult: any
  // 界面状态
  uiState: {
    showPromptCard: boolean
  }
}

// 创建学校匹配专用的存储管理器
export const schoolMatchingStorage = new StorageManager<SchoolMatchingStorageData>('school_matching')

// 导出类型供其他文件使用
export type { SchoolMatchingStorageData } 