import React, { useEffect, useState } from 'react';
import './styles/RiskRecord.css';

interface RiskRecord {
  happen_time: string;
  lab_id: string;
  risk_level: number;
}

interface ViewStatus {
  lab_id: string;
  lab_name: string;
  total_risk_level: number;
  officer_id: string | null;
  officer_name: string | null;
}

const RiskRecordManage = () => {
  const baseUrl = 'http://localhost:5000/api'; // 根据实际 API 修改
  const [records, setRecords] = useState<RiskRecord[]>([]);
  const [formData, setFormData] = useState<Partial<RiskRecord>>({
    happen_time: '',
    lab_id: '',
    risk_level: 1
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState({
    table: false,
    form: false,
    delete: false,
    view: false
  });
  const [error, setError] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  // 新增状态用于视图数据和弹窗控制
  const [viewStatusList, setViewStatusList] = useState<ViewStatus[]>([]);
  const [showViewModal, setShowViewModal] = useState(false);

  const fetchRecords = async () => {
    setIsLoading(prev => ({ ...prev, table: true }));
    try {
      const response = await fetch(`${baseUrl}/risk`);
      const data = await response.json();
      if (data.status === 'success') {
        setRecords(data.data || []);
      } else {
        setError(data.message || '获取数据失败');
      }
    } catch (err) {
      setError('无法获取风险记录，请稍后重试');
    } finally {
      setIsLoading(prev => ({ ...prev, table: false }));
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const openModal = (index?: number) => {
    setError(null);
    if (typeof index === 'number') {
      setFormData(records[index]);
      setEditingIndex(index);
    } else {
      setFormData({
        happen_time: '',
        lab_id: '',
        risk_level: 1
      });
      setEditingIndex(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setFormData({ happen_time: '', lab_id: '', risk_level: 1 });
    setEditingIndex(null);
    setError(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'risk_level' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(prev => ({ ...prev, form: true }));
    setError(null);

    const formattedData = {
      ...formData,
      happen_time: formData.happen_time?.replace('T', ' ') + ':00'
    };

    const method = editingIndex !== null ? 'PUT' : 'POST';
    const url =
      editingIndex !== null
        ? `${baseUrl}/risk/${records[editingIndex].happen_time}`
        : `${baseUrl}/risk`;

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });
      const data = await response.json();

      if (data.status === 'success') {
        fetchRecords();
        closeModal();
      } else {
        setError(data.message || '提交失败');
      }
    } catch (err) {
      setError('提交失败，请检查网络');
    } finally {
      setIsLoading(prev => ({ ...prev, form: false }));
    }
  };

  const handleDeleteClick = (happen_time: string) => {
    setRecordToDelete(happen_time);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    setIsLoading(prev => ({ ...prev, delete: true }));

    try {
      const response = await fetch(`${baseUrl}/risk/${recordToDelete}`, {
        method: 'DELETE'
      });
      const data = await response.json();

      if (data.status === 'success') {
        fetchRecords();
      } else {
        setError(data.message || '删除失败');
      }
    } catch (err) {
      setError('删除失败，请检查网络');
    } finally {
      setIsLoading(prev => ({ ...prev, delete: false }));
      setRecordToDelete(null);
    }
  };

  // 新增函数：获取视图状态
  const fetchViewStatus = async () => {
    setIsLoading(prev => ({ ...prev, view: true }));
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/risk/view_status`); // 修改为你的视图接口路径
      const data = await response.json();

      if (data.status === 'success') {
        setViewStatusList(data.data || []);
        setShowViewModal(true);
      } else {
        setError(data.message || '查询视图状态失败');
      }
    } catch (err) {
      setError('查询视图状态失败，请检查网络');
    } finally {
      setIsLoading(prev => ({ ...prev, view: false }));
    }
  };

  return (
    <div className="risk-management">
      <div className="section-header">
        <h2>风险记录管理</h2>

        <button onClick={fetchViewStatus} className="add-button" disabled={isLoading.view}>
          查询高风险实验室
        </button>
         <button onClick={() => openModal()} className="add-button" disabled={isLoading.table || isLoading.view}>
          添加记录
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading.table ? (
        <div className="loading">加载中...</div>
      ) : records.length === 0 ? (
        <div className="empty-state">暂无记录</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>发生时间</th>
                <th>实验室编号</th>
                <th>风险等级</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record, index) => (
                <tr key={record.happen_time}>
                  <td>{new Date(record.happen_time).toLocaleString()}</td>
                  <td>{record.lab_id}</td>
                  <td>{record.risk_level}</td>
                  <td>
                    <button className="action-button" onClick={() => openModal(index)}>
                      编辑
                    </button>
                    <button
                      className="action-button delete"
                      onClick={() => handleDeleteClick(record.happen_time)}
                      disabled={isLoading.delete}
                    >
                      删除
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingIndex !== null ? '编辑风险记录' : '添加风险记录'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>发生时间：</label>
                <input
                  type="datetime-local"
                  name="happen_time"
                  value={formData.happen_time ?? ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!isLoading.form || editingIndex !== null}
                />
              </div>

              <div className="form-group">
                <label>实验室编号：</label>
                <input
                  type="text"
                  name="lab_id"
                  value={formData.lab_id ?? ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!isLoading.form}
                />
              </div>

              <div className="form-group">
                <label>风险等级：</label>
                <select
                  name="risk_level"
                  value={formData.risk_level ?? 1}
                  onChange={handleInputChange}
                  disabled={!!isLoading.form}
                >
                  <option value={1}>低</option>
                  <option value={2}>中</option>
                  <option value={3}>高</option>
                </select>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="modal-buttons">
                <button type="submit" className="submit-button" disabled={!!isLoading.form}>
                  {isLoading.form ? '处理中...' : '保存'}
                </button>
                <button type="button" className="cancel-button" onClick={closeModal} disabled={!!isLoading.form}>
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {recordToDelete && (
        <div className="confirm-dialog">
          <div className="confirm-content">
            <p>确认删除该记录？</p>
            <button className="confirm-button" onClick={confirmDelete}>
              确认
            </button>
            <button className="cancel-button" onClick={() => setRecordToDelete(null)}>
              取消
            </button>
          </div>
        </div>
      )}

      {/* 视图查询弹窗 */}
      {showViewModal && (
  <div className="modal">
    <div className="modal-content status-modal">
      <h3>视图查询结果</h3>
      {viewStatusList.length === 0 ? (
        <div>暂无数据</div>
      ) : (
        <table className="status-table">
          <thead>
            <tr>
              <th>实验室编号</th>
              <th>实验室名称</th>
              <th>风险总等级</th>
              <th>安全负责人ID</th>
              <th>安全负责人姓名</th>
            </tr>
          </thead>
          <tbody>
            {viewStatusList.map((item, idx) => (
              <tr key={idx}>
                <td>{item.lab_id}</td>
                <td>{item.lab_name}</td>
                <td>{item.total_risk_level}</td>
                <td>{item.officer_id ?? '无'}</td>
                <td>{item.officer_name ?? '无'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      <div className="modal-buttons">
        <button className="cancel-button" onClick={() => setShowViewModal(false)}>
          关闭
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default RiskRecordManage;
