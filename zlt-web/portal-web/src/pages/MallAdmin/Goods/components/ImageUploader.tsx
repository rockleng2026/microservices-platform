/**
 * 多图上传组件 - ADMIN-02-08
 * 支持最多5张图片上传和拖拽排序
 */
import React, { useState } from 'react';
import { Upload, Image, Button, message } from 'antd';
import { DeleteOutlined, UploadOutlined, HolderOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd/lib/upload/interface';

// Max number of images allowed
const MAX_FILES = 5;

interface ImageUploaderProps {
  value?: string[];                    // Initial image URLs
  onChange?: (urls: string[]) => void; // Called when images change
  maxFiles?: number;                   // Max files (default: 5)
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  value = [],
  onChange,
  maxFiles = MAX_FILES,
}) => {
  // Internal state
  const [imageUrls, setImageUrls] = useState<string[]>(value);
  const [uploading, setUploading] = useState(false);

  // Update internal state and notify parent
  const updateUrls = (newUrls: string[]) => {
    setImageUrls(newUrls);
    onChange?.(newUrls);
  };

  // Handle file upload
  const handleUpload = async (file: File): Promise<void> => {
    if (imageUrls.length >= maxFiles) {
      message.warning(`最多只能上传 ${maxFiles} 张图片`);
      return;
    }

    setUploading(true);
    try {
      // Build form data - file-center uses /files-anon endpoint (public)
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:5000/files-anon', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      // file-center returns FileInfo directly with 'url' field (not wrapped)
      // URL is like "/files/local/xxx" - need to prepend file-center base URL
      const FILE_CENTER_BASE = 'http://localhost:5000';
      if (result.url) {
        const fullUrl = result.url.startsWith('http') ? result.url : FILE_CENTER_BASE + result.url;
        const newUrls = [...imageUrls, fullUrl];
        updateUrls(newUrls);
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
  };

  // Upload props
  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    showUploadList: false,
    beforeUpload: (file) => {
      // Check file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        message.error('只能上传图片文件');
        return false;
      }

      // Check file size (5MB)
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error('图片大小不能超过 5MB');
        return false;
      }

      // Handle upload
      handleUpload(file);
      return false; // Prevent default upload
    },
  };

  // Remove image
  const handleRemove = (index: number) => {
    const newUrls = imageUrls.filter((_, i) => i !== index);
    updateUrls(newUrls);
  };

  // Move image (drag and drop reorder)
  const handleMove = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= imageUrls.length) return;
    const newUrls = [...imageUrls];
    const [moved] = newUrls.splice(fromIndex, 1);
    newUrls.splice(toIndex, 0, moved);
    updateUrls(newUrls);
  };

  // Render single image item
  const renderImageItem = (url: string, index: number) => (
    <div
      key={url}
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
          src={url}
          width={80}
          height={80}
          style={{ objectFit: 'cover' }}
          preview={{ mask: <span>预览</span> }}
        />

        {/* Drag handle */}
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

        {/* Delete button */}
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

      {/* Move buttons */}
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
      {/* Image list */}
      <div style={{ marginBottom: 8 }}>
        {imageUrls.map((url, index) => renderImageItem(url, index))}
      </div>

      {/* Upload button */}
      {imageUrls.length < maxFiles && (
        <Upload {...uploadProps}>
          <Button icon={<UploadOutlined />} loading={uploading}>
            上传图片
          </Button>
        </Upload>
      )}

      {/* Hint text */}
      <div style={{ marginTop: 8, color: '#888', fontSize: 12 }}>
        {imageUrls.length}/{maxFiles} 张图片
        {imageUrls.length < maxFiles && `（还能上传 ${maxFiles - imageUrls.length} 张）`}
      </div>
    </div>
  );
};

export default ImageUploader;