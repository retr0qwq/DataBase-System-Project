import React, { useEffect, useState } from 'react';
import './styles/Consumable.css';

interface Consumable {
  consumable_id: string;
  name: string;
  storage?: number;
  min_stock?: number;
  update_date?: string;
}

interface ConsumableStatus {
  consumable_id: string;
  name: string;
  storage: number;
  min_stock: number;
  stock_status: string;
  total_usage_count: number;
}

const ConsumableManage = () => {
  const [consumableList, setConsumableList] = useState<Consumable[]>([]);
  const [statusList, setStatusList] = useState<ConsumableStatus[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [editingConsumable, setEditingConsumable] = useState<Consumable | null>(null);
  const [formData, setFormData] = useState<Partial<Consumable>>({});
  const baseUrl = 'http://localhost:5000/api';

  const fetchConsumables = async () => {
    try {
      const response = await fetch(`${baseUrl}/consumable`);
      const data = await response.json();
      setConsumableList(data.data || []);
    } catch (error) {
      console.error('获取耗材列表失败:', error);
    }
  };

  useEffect(() => {
    fetchConsumables();
  }, []);

const fetchConsumableStatus = async () => {
    try {
      const response = await fetch(`${baseUrl}/consumables/status`);
      const data = await response.json();
      
      if (data.status === 'success') {
        // 确保数据格式正确
        const formattedData = data.data.map((item: any) => ({
          consumable_id: item.consumable_id,
          name: item.name,
          storage: item.storage || 0,
          min_stock: item.min_stock || 0,
          stock_status: item.stock_status || '未知',
          total_usage_count: item.total_usage_count || 0
        }));
        
        setStatusList(formattedData);
        setShowStatusModal(true);
      } else {
        alert('查询失败: ' + data.message);
      }
    } catch (error) {
      console.error('获取耗材状态失败:', error);
      alert('获取耗材状态失败');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddConsumable = () => {
    setEditingConsumable(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEditConsumable = (consumable: Consumable) => {
    setEditingConsumable(consumable);
    setFormData({ ...consumable });
    setIsModalOpen(true);
  };

  const handleDeleteConsumable = async (id: string) => {
    if (!window.confirm('确定删除该耗材吗？')) return;
    try {
      const res = await fetch(`${baseUrl}/consumable/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        fetchConsumables();
      } else {
        alert(data.message || '删除失败');
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNew = !editingConsumable;
    const url = isNew
      ? `${baseUrl}/consumable`
      : `${baseUrl}/consumable/${editingConsumable?.consumable_id}`;
    const method = isNew ? 'POST' : 'PUT';

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setIsModalOpen(false);
        fetchConsumables();
      } else {
        alert(data.message || '保存失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败');
    }
  };

  return (
    <div className="consumable-management">
      <div className="section-header">
        <h2>耗材管理</h2>
        <button className="add-button" onClick={fetchConsumableStatus}>
          查询耗材状态
        </button>
        <button className="add-button" onClick={handleAddConsumable}>
          添加耗材
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>耗材编号</th>
            <th>名称</th>
            <th>库存</th>
            <th>最低库存</th>
            <th>更新日期</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {consumableList.map(item => (
            <tr key={item.consumable_id}>
              <td>{item.consumable_id}</td>
              <td>{item.name}</td>
              <td>{item.storage ?? '-'}</td>
              <td>{item.min_stock ?? '-'}</td>
              <td>{item.update_date ? new Date(item.update_date).toLocaleDateString() : '-'}</td>
              <td>
                <button className="action-button edit" onClick={() => handleEditConsumable(item)}>
                  编辑
                </button>
                <button className="action-button delete" onClick={() => handleDeleteConsumable(item.consumable_id)}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 添加/编辑表单弹窗 */}
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingConsumable ? '编辑耗材' : '添加耗材'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>耗材编号：</label>
                <input
                  type="text"
                  name="consumable_id"
                  value={formData.consumable_id || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingConsumable}
                />
              </div>
              <div className="form-group">
                <label>名称：</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>库存：</label>
                <input
                  type="number"
                  name="storage"
                  value={formData.storage ?? ''}
                  onChange={handleInputChange}
                  min={0}
                />
              </div>
              <div className="form-group">
                <label>最低库存：</label>
                <input
                  type="number"
                  name="min_stock"
                  value={formData.min_stock ?? ''}
                  onChange={handleInputChange}
                  min={0}
                />
              </div>
              <div className="form-group">
                <label>更新日期：</label>
                <input
                  type="date"
                  name="update_date"
                  value={formData.update_date ? formData.update_date.split('T')[0] : ''}
                  onChange={handleInputChange}
                />
              </div>

              <div className="modal-buttons">
                <button type="submit" className="submit-button">保存</button>
                <button type="button" className="cancel-button" onClick={() => setIsModalOpen(false)}>取消</button>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* 更新状态弹窗的渲染部分 */}
      {showStatusModal && (
        <div className="modal">
          <div className="modal-content status-modal">
            <h3>耗材状态及使用情况</h3>
            <table className="status-table">
              <thead>
                <tr>
                  <th>耗材编号</th>
                  <th>耗材名称</th>
                  <th>当前库存</th>
                  <th>最低库存</th>
                  <th>使用次数</th>
                  <th>库存状态</th>
                </tr>
              </thead>
              <tbody>
                {statusList.map(item => (
                  <tr key={item.consumable_id} className={`status-row ${item.stock_status}`}>
                    <td>{item.consumable_id}</td>
                    <td>{item.name}</td>
                    <td>{item.storage}</td>
                    <td>{item.min_stock}</td>
                    <td>{item.total_usage_count}</td>
                    <td>
                      <span className={`status-badge ${item.stock_status}`}>
                        {item.stock_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="modal-buttons">
              <button className="cancel-button" onClick={() => setShowStatusModal(false)}>
                关闭
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumableManage;
