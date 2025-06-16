import React from 'react'

interface HeaderProps {}

const Header: React.FC<HeaderProps> = () => {
  return (
    <header className="header">
      <h1>多维表格系统</h1>
    </header>
  )
}

export default Header 