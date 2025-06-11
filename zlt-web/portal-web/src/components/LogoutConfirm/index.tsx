import React, { useState } from 'react';
import { Modal, message, Button } from 'antd';
import { ExclamationCircleOutlined, LogoutOutlined } from '@ant-design/icons';
import { logout, quickLogout } from '../../services/auth';

const { confirm } = Modal;

interface LogoutConfirmProps {
  /**
   * 触发退出的按钮类型
   */
  buttonType?: 'text' | 'link' | 'default' | 'primary' | 'ghost' | 'dashed';
  /**
   * 按钮文本
   */
  buttonText?: string;
  /**
   * 是否显示图标
   */
  showIcon?: boolean;
  /**
   * 按钮样式类名
   */
  className?: string;
  /**
   * 自定义按钮渲染函数，如果提供此函数，将忽略其他按钮相关props
   */
  renderButton?: (onClick: () => void, loading: boolean) => React.ReactNode;
  /**
   * 退出前的回调函数，返回false可以阻止退出
   */
  beforeLogout?: () => boolean | Promise<boolean>;
  /**
   * 退出成功的回调函数
   */
  onLogoutSuccess?: () => void;
  /**
   * 退出失败的回调函数
   */
  onLogoutError?: (error: any) => void;
}

/**
 * 退出登录确认组件
 * 参考layui-web和react-web的最佳实践
 */
const LogoutConfirm: React.FC<LogoutConfirmProps> = ({
  buttonType = 'text',
  buttonText = '退出',
  showIcon = true,
  className,
  renderButton,
  beforeLogout,
  onLogoutSuccess,
  onLogoutError,
}) => {
  const [loading, setLoading] = useState(false);

  /**
   * 处理退出登录
   */
  const handleLogout = async () => {
    // 执行退出前的回调
    if (beforeLogout) {
      try {
        const canLogout = await beforeLogout();
        if (!canLogout) {
          return;
        }
      } catch (error) {
        console.error('退出前回调执行失败:', error);
        return;
      }
    }

    confirm({
      title: '退出登录',
      icon: <ExclamationCircleOutlined />,
      content: '确定要退出当前登录吗？退出后需要重新登录。',
      okText: '确定退出',
      cancelText: '取消',
      okButtonProps: {
        danger: true,
        loading: loading,
      },
      onOk: async () => {
        try {
          setLoading(true);
          message.loading('正在退出登录...', 0);

          // 调用退出接口
          await logout();

          message.destroy();
          message.success('退出登录成功');

          // 执行成功回调
          if (onLogoutSuccess) {
            onLogoutSuccess();
          }

        } catch (error: any) {
          message.destroy();
          console.error('退出登录失败:', error);

          // 执行失败回调
          if (onLogoutError) {
            onLogoutError(error);
          }

          // 显示错误对话框，提供强制退出选项
          Modal.error({
            title: '退出登录失败',
            content: (
              <div>
                <p>退出接口调用失败：{error.message || '网络异常'}</p>
                <p>您可以选择强制退出登录，这将清除本地缓存并跳转到登录页面。</p>
              </div>
            ),
            okText: '强制退出',
            cancelText: '取消',
            onOk: async () => {
              try {
                message.loading('正在强制退出...', 0);
                await quickLogout();
                message.destroy();
                message.success('已强制退出登录');

                // 执行成功回调
                if (onLogoutSuccess) {
                  onLogoutSuccess();
                }
              } catch (quickError) {
                message.destroy();
                console.error('强制退出失败:', quickError);
                message.error('退出失败，请手动刷新页面');
              }
            },
          });
        } finally {
          setLoading(false);
        }
      },
    });
  };

  // 如果提供了自定义渲染函数，使用它
  if (renderButton) {
    return <>{renderButton(handleLogout, loading)}</>;
  }

  // 默认按钮渲染
  return (
    <Button
      type={buttonType}
      icon={showIcon ? <LogoutOutlined /> : undefined}
      onClick={handleLogout}
      loading={loading}
      className={className}
      title="退出登录"
    >
      {buttonText}
    </Button>
  );
};

export default LogoutConfirm; 