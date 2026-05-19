/**
 * 多图上传组件 - ADMIN-02-08
 * 支持最多5张图片上传和拖拽排序
 */
import React, { useState, useRef, useCallback } from 'react';
import { Upload, Image, Button, message } from 'antd';
import { DeleteOutlined, UploadOutlined, HolderOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd/lib/upload/interface';
import { request } from '@/utils/request';

// Max number of images allowed
const MAX_FILES = 5;

interface ImageUploaderProps {
  value?: string[];                    // Initial image URLs
  onChange?: (urls: string[]) => void; // Called when images change
  maxFiles?: number;                   // Max files (default: 5)
}

/** 给图片URL追加access_token，用于< img >标签认证 */
const appendToken = (url: string): string => {
  if (!url || !url.includes('api-file/files/local')) return url;
  const token = localStorage.getItem('access_token');
  if (!token) return url;  // 无token则不附加，避免 ?access_token=null
  return url + (url.includes('?') ? '&' : '?') + 'access_token=' + token;
};

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxFiles = MAX_FILES,
}) => {
  // Track images locally for session
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  // Track the last known value to detect changes
  const lastValueRef = useRef<string[]>([]);

  // Sync with parent value only when it actually changes
  // Use a ref to track changes without causing re-renders
  if (value !== lastValueRef.current && JSON.stringify(value) !== JSON.stringify(lastValueRef.current)) {
    lastValueRef.current = value;
    setImageUrls(value);
  }

  // Upload handler
  const handleUpload = useCallback(async (file: File) => {
    if (imageUrls.length >= maxFiles) {
      message.warning(`最多只能上传 ${maxFiles} 张图片`);
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const result = await request<{ url?: string; resp_msg?: string; message?: string; error?: string }>(
        '/api-file/files-anon',
        { method: 'POST', data: formData }
      );

      if (result.url) {
        const newUrls = [...imageUrls, result.url];
        setImageUrls(newUrls);
        lastValueRef.current = newUrls;
        onChange?.(newUrls);
        message.success('上传成功');
      } else {
        message.error(result.resp_msg || result.message || result.error || JSON.stringify(result) || '上传失败');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      message.error('上传失败: ' + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUploading(false);
    }
  }, [imageUrls, maxFiles, onChange]);

  // Remove handler
  const handleRemove = useCallback((index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    setImageUrls(newUrls);
    lastValueRef.current = newUrls;
    onChange?.(newUrls);
  }, [imageUrls, onChange]);

  // Move handler
  const handleMove = useCallback((fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imageUrls.length) return;
    const newUrls = [...imageUrls];
    const [moved] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, moved);
    setImageUrls(newUrls);
    lastValueRef.current = newUrls;
    onChange?.(newUrls);
  }, [imageUrls, onChange]);

  // Upload props
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB');
        return false;
      }
      handleUpload(file);
      return false;
    },
  };

  // Render single image item
  const renderImageItem = (url: string, index: number) => (
    <div
      key={url + '-' + index}
      style={{
        display: 'inline-block',
        margin: '0 8px 8px 0',
        position: 'relative',
        verticalAlign: 'top',
      }}
    >
      <div
        style={{
          width: 80,
          height: 80,
          border: '1px dashed #d9d9d9',
          borderRadius: 8,
          overflow: 'hidden',
          position: 'relative',
          background: '#fafafa',
        }}
      >
        <Image
          src={appendToken(url)}
          width={80}
          height={80}
          style={{ objectFit: 'cover' }}
          preview={{ mask: <span>预览</span> }}
        />
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: 2,
            width: 20,
            height: 20,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'move',
            color: '#fff',
            fontSize: 12,
          }}
          title="拖拽排序"
        >
          <HolderOutlined />
        </div>
        <Button
          type="text"
          danger
          size="small"
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(index)}
          style={{
            position: 'absolute',
            top: 2,
            right: 2,
            width: 20,
            height: 20,
            minWidth: 20,
            padding: 0,
            background: 'rgba(255,255,255,0.8)',
          }}
        />
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 4 }}>
        <Button
          size="small"
          disabled={index === 0}
          onClick={() => handleMove(index, index - 1)}
          style={{ marginRight: 2 }}
        >
          上
        </Button>
        <Button
          size="small"
          disabled={index === imageUrls.length - 1}
          onClick={() => handleMove(index, index + 1)}
        >
          下
        </Button>
      </div>
    </div>
  );

  return (
    <div style={{ display: 'block' }}>
      <div style={{ marginBottom: 8 }}>
        {imageUrls.map((url, index) => renderImageItem(url, index))}
      </div>
      {imageUrls.length < maxFiles && (
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} loading={uploading}>
            上传图片
          </Button>
        </Upload>
      )}
      <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
        {imageUrls.length}/{maxFiles} 张图片
        {imageUrls.length < maxFiles && `（还能上传 ${maxFiles - imageUrls.length} 张）`}
      </div>
    </div>
  );
};

export default ImageUploader;