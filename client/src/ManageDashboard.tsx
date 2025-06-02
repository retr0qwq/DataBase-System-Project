import React, { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Link, useLocation } from 'react-router-dom';
import './styles/ManageDashboard.css';
import CollegeManage from './College';
import PersonnelManagement from './Personnel';
import LabManage from './Lab';
import ConsumableManage from './Consumable';
import ConsumeManage from './Consume';
interface User {
  username: string;
}

interface DashboardStats {
  totalCollege: number;
  totalLab: number;
  totalPersonnel: number;
  totalConsumable: number;
  totalConsume: number;
  totalEquipment: number;
  totalUseRecord: number;
  totalRiskRecord: number;
}

const ManageDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}') as User;
  const [stats, setStats] = useState<DashboardStats>({ totalCollege:0,totalLab: 0,totalPersonnel: 0, totalConsumable: 0, totalConsume: 0, totalEquipment: 0, totalUseRecord: 0, totalRiskRecord: 0 });

  useEffect(() => {
    const fetchStats = async () => {
  try {
    const response = await fetch('http://localhost:5000/api/dashboard/stats');
    const data = await response.json();

    const mappedStats: DashboardStats = {
      totalCollege: data.college_count,
      totalLab: data.lab_count,
      totalPersonnel: data.personnel_count,
      totalConsumable: data.consumable_count,
      totalConsume: data.consumption_count,
      totalEquipment: data.equipment_count,
      totalUseRecord: data.use_record_count,
      totalRiskRecord: data.risk_record_count,
    };

    setStats(mappedStats);
  } catch (error) {
    console.error('获取统计数据失败:', error);
  }
};


    fetchStats();
  }, []);

  // 添加海洋光点效果
  useEffect(() => {
    const createParticle = () => {
      const particle = document.createElement('div');
      particle.className = 'particle';
      
      // 随机大小
      const size = Math.random() * 4 + 2;
      particle.style.width = `${size}px`;
      particle.style.height = `${size}px`;
      
      // 随机位置
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.bottom = '0';
      
      document.querySelector('.ocean-particles')?.appendChild(particle);
      
      // 动画结束后移除粒子
      setTimeout(() => {
        particle.remove();
      }, 8000);
    };

    // 定期创建粒子
    const interval = setInterval(createParticle, 300);

    return () => {
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const DashboardContent = () => (
    <>
      <div className="content-header">
        <h2>总体后台</h2>
      </div>
      <div className="content-body">
        <div className="stats-container">
          <div className="stat-card">
            <h3>学院总数</h3>
            <div className="stat-value">{stats.totalCollege}</div>
            <div className="stat-description">学院总数</div>
          </div>
          <div className="stat-card">
            <h3>实验室总数</h3>
            <div className="stat-value">{stats.totalLab|| '暂无数据'}</div>
            <div className="stat-description">实验室总数</div>
          </div>
          <div className="stat-card">
            <h3>人员总数</h3>
            <div className="stat-value">{stats.totalPersonnel|| '暂无数据'}</div>
            <div className="stat-description">人员总数</div>
          </div>
          <div className="stat-card">
            <h3>耗材种类</h3>
            <div className="stat-value">{stats.totalConsumable|| '暂无数据'}</div>
            <div className="stat-description">耗材种类</div>
          </div>
          <div className="stat-card">
            <h3>耗材使用人次</h3>
            <div className="stat-value">{stats.totalConsume|| '暂无数据'}</div>
            <div className="stat-description">耗材使用人次</div>
          </div>
          <div className="stat-card">
            <h3>总设备数</h3>
            <div className="stat-value">{stats.totalEquipment|| '暂无数据'}</div>
            <div className="stat-description">总设备数</div>
          </div>
          <div className="stat-card">
            <h3>总使用记录数</h3>
            <div className="stat-value">{stats.totalUseRecord|| '暂无数据'}</div>
            <div className="stat-description">总使用记录数</div>
          </div>
          <div className="stat-card">
            <h3>总风险记录数</h3>
            <div className="stat-value">{stats.totalRiskRecord|| '暂无数据'}</div>
            <div className="stat-description">系统总风险记录数</div>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="manage-dashboard">
      <div className="wave"></div>
      <div className="ocean-particles"></div>
      <header className="manage-header">
        <div className="header-content">
          <h1>i-Lab实验室管理系统 - 后台管理</h1>
          <div className="user-info">
            <span>管理员: {user.username}</span>
            <button onClick={handleLogout} className="logout-button">退出</button>
          </div>
        </div>
      </header>

      <main className="manage-main">
        <div className="manage-sidebar">
          <nav className="manage-nav">
            <Link 
              to="/manage" 
              className={`nav-item ${location.pathname === '/manage' ? 'active' : ''}`}
            >
              总体后台
            </Link>
            <Link 
              to="/manage/college" 
              className={`nav-item ${location.pathname === '/manage/college' ? 'active' : ''}`}
            >
              学院管理
            </Link>
            <Link 
              to="/manage/lab" 
              className={`nav-item ${location.pathname === '/manage/lab' ? 'active' : ''}`}
            >
              实验室管理
            </Link>
            <Link 
              to="/manage/personnel" 
              className={`nav-item ${location.pathname === '/manage/personnel' ? 'active' : ''}`}
            >
              人员管理
            </Link>
            <Link 
              to="/manage/consumable" 
              className={`nav-item ${location.pathname === '/manage/consumable' ? 'active' : ''}`}
            >
              耗材管理
            </Link>
            <Link 
              to="/manage/consume" 
              className={`nav-item ${location.pathname === '/manage/consume' ? 'active' : ''}`}
            >
              耗材使用记录
            </Link>
          </nav>
        </div>

        <div className="manage-content">
          <Routes>
            <Route path="/" element={<DashboardContent />} />
            <Route path="/college" element={<CollegeManage />} />
            <Route path="/personnel" element={<PersonnelManagement />} />
            <Route path="/lab" element={<LabManage />} />
            <Route path="/consumable" element={<ConsumableManage />} />
            <Route path="/consume" element={<ConsumeManage />} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

export default ManageDashboard; 