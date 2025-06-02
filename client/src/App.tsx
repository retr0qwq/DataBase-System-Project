import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import AuthPage from './AuthPage';
import ManageDashboard from './ManageDashboard';
import './styles/App.css';


interface User {
  username: string;
  role: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <Router>
      <Routes>
        <Route path="/auth" element={!user ? <AuthPage /> : <Navigate to="/manage" />} />
        <Route path="/manage/*" element={user ? <ManageDashboard /> : <Navigate to="/auth" />} />
        <Route
          path="/*"
          element={
            <div className="App">
              <header className="App-header">
                <div className="title-container">
                  <h1>i-Lab实验室管理系统</h1>
                  <p className="header-subtitle">i-Lab Lab Management System</p>
                </div>
                <div className="auth-buttons">
                  {user ? (
                    <>
                      <span className="welcome-text">欢迎, {(user as User).username}</span>
                      <button onClick={handleLogout} className="logout-button">退出</button>
                    </>
                  ) : (
                    <Link to="/auth" className="login-button">登录/注册</Link>
                  )}
                </div>
              </header>
              <main>
                <div className="welcome-container">
                  <div className="welcome-content">
                    <h2 className="welcome-title">智慧实验室管理平台</h2>
                    <p className="welcome-text">
                      基于React + TypeScript（前端）与Flask + MySQL（后端），实现高校实验室的
                      <span className="highlight">人员管理</span>、
                      <span className="highlight">耗材监测</span>和
                      <span className="highlight">仪器预约</span>等功能
                    </p>
                  </div>
                </div>
                <div className="feature-grid">
                  <div className="feature-card">
                    <div className="card-header">
                      <h3>人员信息管理</h3>
                    </div>
                    <p>对实验室中各角色人员进行分类管理</p>
                    <div className="card-footer">
                      <span className="tag">人员信息</span>
                      <span className="tag">实时更改</span>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="card-header">
                      <h3>仪器耗材使用</h3>
                    </div>
                    <p>记录仪器耗材使用情况，便于耗材和仪器的统筹使用</p>
                    <div className="card-footer">
                      <span className="tag">耗材监测</span>
                      <span className="tag">使用记录</span>
                      <span className="tag">仪器预约</span>
                    </div>
                  </div>
                  <div className="feature-card">
                    <div className="card-header">
                      <h3>实验风险记录</h3>
                    </div>
                    <p>记录实验过程中的各种风险事件，保障实验室安全</p>
                    <div className="card-footer">
                      <span className="tag">风险记录</span>
                      <span className="tag">定期核查</span>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;