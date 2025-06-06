import React, { useEffect, useState } from 'react';
import './styles/EquipmentUse.css';

interface EquipmentUsageRecord {
  equip_id: string;
  personnel_id: string;
  start_time: string;
  end_time: string;
  cost: number;
  equip_condition: string;
  if_expired: boolean;
}

const EquipmentUsageManage = () => {
  const baseUrl = 'http://localhost:5000/api';
  const [usageList, setUsageList] = useState<EquipmentUsageRecord[]>([]);
  const [formData, setFormData] = useState<Partial<EquipmentUsageRecord>>({
    start_time: '',
    end_time: '',
    cost: 0,
    equip_condition: '正常',
    if_expired: false
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState({
    table: false,
    form: false,
    delete: false
  });
  const [error, setError] = useState<string | null>(null);
  const [recordToDelete, setRecordToDelete] = useState<{equip_id: string, personnel_id: string} | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const resetForm = () => {
    setFormData({
      start_time: '',
      end_time: '',
      cost: 0,
      equip_condition: '正常',
      if_expired: false
    });
  };

  const formatToSQLDateTime = (localDateTime: string) => {
    if (!localDateTime) return '';
    const date = new Date(localDateTime);
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  };

  const fetchUsageList = async () => {
    setIsLoading(prev => ({...prev, table: true}));
    setError(null);
    try {
      const response = await fetch(`${baseUrl}/equipment/usage`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.status === 'success') {
        setUsageList(data.data || []);
      } else {
        setError(data.message || '获取数据失败');
      }
    } catch (error) {
      console.error('获取仪器使用记录失败:', error);
      setError('无法获取仪器使用记录，请稍后重试');
    } finally {
      setIsLoading(prev => ({...prev, table: false}));
    }
  };

  useEffect(() => {
    fetchUsageList();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: checked
    }));
  };

  const handleDateTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.equip_id || !formData.personnel_id) {
      return '仪器编号和人员编号不能为空';
    }
    if (!formData.start_time || !formData.end_time) {
      return '请填写完整的时间范围';
    }
    if (new Date(formData.start_time) >= new Date(formData.end_time)) {
      return '结束时间必须晚于开始时间';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsLoading(prev => ({...prev, form: true}));
    setError(null);

    try {
      const payload = {
        equip_id: formData.equip_id,
        personnel_id: formData.personnel_id,
        start_time: formatToSQLDateTime(formData.start_time!),
        end_time: formatToSQLDateTime(formData.end_time!),
        condition: formData.equip_condition || '正常'
      };

      const response = await fetch(`${baseUrl}/equipment/usage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        alert('使用记录添加成功');
        closeModal();
        fetchUsageList();
      } else {
        setError(data.message || '添加记录失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      setError('提交失败，请检查网络连接');
    } finally {
      setIsLoading(prev => ({...prev, form: false}));
    }
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
    setError(null);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
    setError(null);
  };

  const handleDeleteClick = (equip_id: string, personnel_id: string) => {
    setRecordToDelete({equip_id, personnel_id});
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!recordToDelete) return;
    
    setIsLoading(prev => ({...prev, delete: true}));
    try {
      const { equip_id, personnel_id } = recordToDelete;
      const response = await fetch(
        `${baseUrl}/equipment/usage/${equip_id}/${personnel_id}`, 
        { method: 'DELETE' }
      );

      const data = await response.json();
      
      if (data.status === 'success') {
        setUsageList(prev => 
          prev.filter(record => 
            !(record.equip_id === equip_id && record.personnel_id === personnel_id)
          )
        );
      } else {
        setError(data.message || '删除记录失败');
      }
    } catch (error) {
      console.error('删除失败:', error);
      setError('删除失败，请检查网络连接');
    } finally {
      setIsLoading(prev => ({...prev, delete: false}));
      setRecordToDelete(null);
      setShowDeleteConfirm(false);
    }
  };

  const cancelDelete = () => {
    setRecordToDelete(null);
    setShowDeleteConfirm(false);
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="equipmentuse-management">
      <div className="section-header">
        <h2>仪器使用记录管理</h2>
        <button 
          className="add-button" 
          onClick={openModal}
          disabled={isLoading.table}
        >
          {isLoading.table ? '加载中...' : '添加记录'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {isLoading.table && !usageList.length ? (
        <div className="loading">加载中...</div>
      ) : usageList.length === 0 ? (
        <div className="empty-state">暂无使用记录</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>仪器编号</th>
                <th>人员编号</th>
                <th>开始时间</th>
                <th>结束时间</th>
                <th>使用费用</th>
                <th>仪器状态</th>
                <th>是否过期</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {usageList.map(record => (
                <tr key={`${record.equip_id}-${record.personnel_id}-${record.start_time}`}>
                  <td>{record.equip_id}</td>
                  <td>{record.personnel_id}</td>
                  <td>{formatDateTime(record.start_time)}</td>
                  <td>{formatDateTime(record.end_time)}</td>
                  <td>{record.cost.toFixed(2)}</td>
                  <td>{record.equip_condition}</td>
                  <td>{record.if_expired ? '是' : '否'}</td>
                  <td>
                    <button 
                      className="action-button delete" 
                      onClick={() => handleDeleteClick(record.equip_id, record.personnel_id)}
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

      {/* 添加记录模态框 */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>添加仪器使用记录</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>仪器编号：</label>
                <input
                  type="text"
                  name="equip_id"
                  value={formData.equip_id ?? ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!isLoading.form}
                />
              </div>

              <div className="form-group">
                <label>人员编号：</label>
                <input
                  type="text"
                  name="personnel_id"
                  value={formData.personnel_id ?? ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!isLoading.form}
                />
              </div>

              <div className="form-group">
                <label>开始时间：</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time ?? ''}
                  onChange={handleDateTimeChange}
                  required
                  disabled={!!isLoading.form}
                />
              </div>

              <div className="form-group">
                <label>结束时间：</label>
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time ?? ''}
                  onChange={handleDateTimeChange}
                  required
                  disabled={!!isLoading.form}
                />
              </div>

              <div className="form-group">
                <label>仪器状态：</label>
                <select
                  name="equip_condition"
                  value={formData.equip_condition ?? '正常'}
                  onChange={handleInputChange}
                  required
                  disabled={!!isLoading.form}
                >
                  <option value="正常">正常</option>
                  <option value="即将需要维护">即将需要维护</option>
                  <option value="需要维修">需要维修</option>
                  <option value="停用">停用</option>
                </select>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="if_expired"
                    checked={!!formData.if_expired}
                    onChange={handleCheckboxChange}
                    disabled={!!isLoading.form}
                    className="checkbox-input"
                  />
                  是否过期
                </label>
              </div>

              {error && <div className="form-error">{error}</div>}

              <div className="modal-buttons">
                <button
                  type="submit"
                  className="submit-button"
                  disabled={!!isLoading.form}
                >
                  {isLoading.form ? '处理中...' : '保存'}
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={closeModal}
                  disabled={!!isLoading.form}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 删除确认模态框 */}
      {showDeleteConfirm && (
        <div className="modal">
          <div className="modal-content">
            <h3>确认删除</h3>
            <p>确定要删除这条使用记录吗？</p>
            <div className="modal-buttons">
              <button 
                className="submit-button delete-confirm"
                onClick={confirmDelete}
                disabled={isLoading.delete}
              >
                {isLoading.delete ? '删除中...' : '确认删除'}
              </button>
              <button 
                className="cancel-button"
                onClick={cancelDelete}
                disabled={isLoading.delete}
              >
                取消
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentUsageManage;