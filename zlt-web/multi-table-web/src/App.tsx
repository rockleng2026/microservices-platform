import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import AppSpaceDetail from './pages/AppSpaceDetail'
import VTableDemo from './pages/VTableDemo'
import HomePage from './pages/HomePage'
import TableManagement from './pages/TableManagement'
import FieldConfig from './pages/FieldConfig'
import FormEditor from './pages/FormEditor'
import FormViewer from './pages/FormViewer'

// 路由守护组件
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = localStorage.getItem('access_token')
  return token ? <>{children}</> : <Navigate to="/login" replace />
}

const App: React.FC = () => {
  return (
    <div className="app">
      <Routes>
        {/* 登录页面 */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* VTable演示页面 */}
        <Route path="/vtable-demo" element={<VTableDemo />} />
        
        {/* 控制台页面 */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* 应用空间主页 */}
        <Route path="/base" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        
        {/* 应用空间详情页 */}
        <Route path="/base/:appSpaceCode" element={
          <ProtectedRoute>
            <AppSpaceDetail />
          </ProtectedRoute>
        } />
        
        {/* 受保护的路由 */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="home" element={<HomePage />} />
          <Route path="tables" element={<TableManagement />} />
          <Route path="tables/:tableId" element={<TableManagement />} />
          <Route path="tables/:tableId/fields" element={<FieldConfig />} />
          <Route path="forms/:formId/edit" element={<FormEditor />} />
          <Route path="forms/:formId/view" element={<FormViewer />} />
        </Route>

        {/* 默认重定向 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </div>
  )
}

export default App 