/**
 * 全局状态管理工具
 * 用于在页面间持久化用户状态，特别是当前选中的岗位信息
 */

export interface GlobalUserPosition {
  id: string;
  name: string;
  deptId?: string;
  deptName?: string;
  type?: 'MAIN' | 'SUB';
  isMain?: boolean;
  [key: string]: any;
}

export interface GlobalUserState {
  currentPosition?: GlobalUserPosition;
  allPositions?: GlobalUserPosition[];
  userInfo?: any;
  lastUpdated?: number;
}

class GlobalStateManager {
  private static instance: GlobalStateManager;
  private readonly STORAGE_KEY = 'portal_user_state';
  private readonly POSITION_KEY = 'portal_current_position';
  private listeners: Map<string, Function[]> = new Map();

  private constructor() {
    // 监听 storage 事件，同步多个标签页的状态
    window.addEventListener('storage', this.handleStorageChange.bind(this));
  }

  public static getInstance(): GlobalStateManager {
    if (!GlobalStateManager.instance) {
      GlobalStateManager.instance = new GlobalStateManager();
    }
    return GlobalStateManager.instance;
  }

  /**
   * 处理存储变化事件（多标签页同步）
   */
  private handleStorageChange(event: StorageEvent) {
    if (event.key === this.POSITION_KEY && event.newValue) {
      try {
        const position = JSON.parse(event.newValue);
        this.notifyListeners('positionChanged', position);
      } catch (error) {
        console.error('解析存储的岗位信息失败:', error);
      }
    }
  }

  /**
   * 保存当前岗位信息
   */
  public saveCurrentPosition(position: GlobalUserPosition): void {
    try {
      const positionData = {
        ...position,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(this.POSITION_KEY, JSON.stringify(positionData));
      
      // 触发全局事件
      this.notifyListeners('positionChanged', position);
      
      // 同时触发自定义事件（兼容现有代码）
      const event = new CustomEvent('positionChanged', {
        detail: { position }
      });
      window.dispatchEvent(event);
      
      console.log('全局状态管理: 已保存当前岗位信息:', position);
    } catch (error) {
      console.error('保存岗位信息失败:', error);
    }
  }

  /**
   * 获取当前岗位信息
   */
  public getCurrentPosition(): GlobalUserPosition | null {
    try {
      const stored = localStorage.getItem(this.POSITION_KEY);
      if (stored) {
        const position = JSON.parse(stored);
        
        // 检查数据是否过期（24小时）
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24小时
        
        if (position.lastUpdated && (now - position.lastUpdated) > maxAge) {
          console.log('全局状态管理: 岗位信息已过期，清除缓存');
          this.clearCurrentPosition();
          return null;
        }
        
        console.log('全局状态管理: 获取当前岗位信息:', position);
        return position;
      }
    } catch (error) {
      console.error('获取岗位信息失败:', error);
    }
    return null;
  }

  /**
   * 清除当前岗位信息
   */
  public clearCurrentPosition(): void {
    try {
      localStorage.removeItem(this.POSITION_KEY);
      console.log('全局状态管理: 已清除岗位信息');
    } catch (error) {
      console.error('清除岗位信息失败:', error);
    }
  }

  /**
   * 保存用户完整状态
   */
  public saveUserState(state: GlobalUserState): void {
    try {
      const stateData = {
        ...state,
        lastUpdated: Date.now()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateData));
      console.log('全局状态管理: 已保存用户状态');
    } catch (error) {
      console.error('保存用户状态失败:', error);
    }
  }

  /**
   * 获取用户完整状态
   */
  public getUserState(): GlobalUserState | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const state = JSON.parse(stored);
        
        // 检查数据是否过期（24小时）
        const now = Date.now();
        const maxAge = 24 * 60 * 60 * 1000; // 24小时
        
        if (state.lastUpdated && (now - state.lastUpdated) > maxAge) {
          console.log('全局状态管理: 用户状态已过期，清除缓存');
          this.clearUserState();
          return null;
        }
        
        return state;
      }
    } catch (error) {
      console.error('获取用户状态失败:', error);
    }
    return null;
  }

  /**
   * 清除用户状态
   */
  public clearUserState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      console.log('全局状态管理: 已清除用户状态');
    } catch (error) {
      console.error('清除用户状态失败:', error);
    }
  }

  /**
   * 添加状态变化监听器
   */
  public addListener(event: string, callback: Function): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);
  }

  /**
   * 移除状态变化监听器
   */
  public removeListener(event: string, callback: Function): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * 通知监听器
   */
  private notifyListeners(event: string, data: any): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('通知监听器失败:', error);
        }
      });
    }
  }

  /**
   * 清除所有状态
   */
  public clearAll(): void {
    this.clearCurrentPosition();
    this.clearUserState();
    console.log('全局状态管理: 已清除所有状态');
  }
}

// 导出单例实例
export const globalState = GlobalStateManager.getInstance();

// 便捷方法
export const saveCurrentPosition = (position: GlobalUserPosition) => {
  globalState.saveCurrentPosition(position);
};

export const getCurrentPosition = () => {
  return globalState.getCurrentPosition();
};

export const clearCurrentPosition = () => {
  globalState.clearCurrentPosition();
};

export default globalState; 