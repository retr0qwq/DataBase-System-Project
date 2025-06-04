import React, { useEffect, useState } from 'react';
import './styles/Equipment.css'; 

interface Equipment {
  equip_id: string;
  type: string;
  used_age: number;
  purchase_date: string;
  if_booked: number;
  Maintain_cycle: number;
}

const EquipmentManage = () => {
  const baseUrl = 'http://localhost:5000/api';
  const [equipmentList, setEquipmentList] = useState<Equipment[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);
  const [formData, setFormData] = useState<Partial<Equipment>>({});

  const fetchEquipment = async () => {
    try {
      const response = await fetch(`${baseUrl}/equipment`);
      const data = await response.json();
      if (data.status === 'success') {
        setEquipmentList(data.data || []);
      }
    } catch (error) {
      console.error('获取仪器列表失败:', error);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['used_age', 'Maintain_cycle', 'if_booked'].includes(name)
        ? parseInt(value)
        : value
    }));
  };

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setFormData({ ...equipment });
    setIsModalOpen(true);
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!window.confirm('确定删除该仪器吗？')) return;
    try {
      const res = await fetch(`${baseUrl}/equipment/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        fetchEquipment();
      } else {
        alert(data.message || '删除失败');
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isNew = !editingEquipment;
    const url = isNew
      ? `${baseUrl}/equipment`
      : `${baseUrl}/equipment/${editingEquipment?.equip_id}`;
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
        fetchEquipment();
      } else {
        alert(data.message || '保存失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败');
    }
  };

  return (
    <div className="equipment-management">
      <div className="section-header">
        <h2>仪器管理</h2>
        <button className="add-button" onClick={handleAddEquipment}>
          添加仪器
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>仪器编号</th>
            <th>类型</th>
            <th>已运行小时数</th>
            <th>购买日期</th>
            <th>是否已预约</th>
            <th>保养周期（小时）</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {equipmentList.map(item => (
            <tr key={item.equip_id}>
              <td>{item.equip_id}</td>
              <td>{item.type}</td>
              <td>{item.used_age}</td>
              <td>{item.purchase_date}</td>
              <td>{item.if_booked ? '是' : '否'}</td>
              <td>{item.Maintain_cycle}</td>
              <td>
                <button className="action-button edit" onClick={() => handleEditEquipment(item)}>
                  编辑
                </button>
                <button className="action-button delete" onClick={() => handleDeleteEquipment(item.equip_id)}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingEquipment ? '编辑仪器' : '添加仪器'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>仪器编号：</label>
                <input
                  type="text"
                  name="equip_id"
                  value={formData.equip_id || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingEquipment}
                />
              </div>
              <div className="form-group">
                <label>类型：</label>
                <input
                  type="text"
                  name="type"
                  value={formData.type || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>已运行小时数：</label>
                <input
                  type="number"
                  name="used_age"
                  value={formData.used_age ?? ''}
                  onChange={handleInputChange}
                  min={0}
                  required
                />
              </div>
              <div className="form-group">
                <label>购买日期：</label>
                <input
                  type="date"
                  name="purchase_date"
                  value={formData.purchase_date || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingEquipment}
                />
              </div>
              <div className="form-group">
                <label>是否已预约：</label>
                <select
                  name="if_booked"
                  value={formData.if_booked ?? 0}
                  onChange={handleInputChange}
                >
                  <option value={0}>否</option>
                  <option value={1}>是</option>
                </select>
              </div>
              <div className="form-group">
                <label>保养周期（小时）：</label>
                <input
                  type="number"
                  name="Maintain_cycle"
                  value={formData.Maintain_cycle ?? ''}
                  onChange={handleInputChange}
                  min={1}
                  required
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
    </div>
  );
};

export default EquipmentManage;
