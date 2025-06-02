import React, { useEffect, useState } from 'react';
import './styles/Consume.css';

interface ConsumeRecord {
  personnel_id: string;
  consumable_id: string;
  consumable_name: string;
  amount: number;
  use_time: string;
}

interface NewConsumeForm {
  personnel_id?: string;
  consumable_id?: string;
  amount?: number;
  use_time?: string;
}

const ConsumeManage = () => {
  const baseUrl = 'http://localhost:5000/api';
  const [consumeList, setConsumeList] = useState<ConsumeRecord[]>([]);
  const [formData, setFormData] = useState<NewConsumeForm>({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ConsumeRecord | null>(null);

  const fetchConsumeList = async () => {
    try {
      const response = await fetch(`${baseUrl}/consume`);
      const data = await response.json();
      if (data.status === 'success') {
        setConsumeList(data.data || []);
      }
    } catch (error) {
      console.error('获取消耗记录失败:', error);
    }
  };

  useEffect(() => {
    fetchConsumeList();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let response;

      if (editingRecord) {
        // 更新操作
        const url = `${baseUrl}/consume/${editingRecord.personnel_id}/${editingRecord.consumable_id}`;
        const payload = {
          old_amount: editingRecord.amount,
          new_amount: formData.amount ?? editingRecord.amount
        };
        response = await fetch(url, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      } else {
        // 添加操作
        response = await fetch(`${baseUrl}/consume`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });
      }

      const data = await response.json();
      if (data.status === 'success') {
        alert(editingRecord ? '更新成功' : '添加成功');
        setIsModalOpen(false);
        setFormData({});
        setEditingRecord(null);
        fetchConsumeList();
      } else {
        alert(data.message || (editingRecord ? '更新失败' : '添加失败'));
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败');
    }
  };

  const handleEdit = (record: ConsumeRecord) => {
    setEditingRecord(record);
    setFormData({
      personnel_id: record.personnel_id,
      consumable_id: record.consumable_id,
      amount: record.amount,
      use_time: record.use_time
    });
    setIsModalOpen(true);
  };

  return (
    <div className="consume-management">
      <div className="section-header">
        <h2>耗材使用记录管理</h2>
        <button className="add-button" onClick={() => {
          setEditingRecord(null);
          setFormData({});
          setIsModalOpen(true);
        }}>
          添加记录
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>人员编号</th>
            <th>耗材编号</th>
            <th>耗材名称</th>
            <th>使用数量</th>
            <th>使用时间</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {consumeList.map(record => (
            <tr key={`${record.personnel_id}-${record.consumable_id}-${record.use_time}`}>
              <td>{record.personnel_id}</td>
              <td>{record.consumable_id}</td>
              <td>{record.consumable_name}</td>
              <td>{record.amount}</td>
              <td>{record.use_time}</td>
              <td>
                <button className="action-button edit" onClick={() => handleEdit(record)}>
                  编辑
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingRecord ? '编辑记录' : '添加耗材使用记录'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>人员编号：</label>
                <input
                  type="text"
                  name="personnel_id"
                  value={formData.personnel_id || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingRecord}
                />
              </div>
              <div className="form-group">
                <label>耗材编号：</label>
                <input
                  type="text"
                  name="consumable_id"
                  value={formData.consumable_id || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingRecord}
                />
              </div>
              <div className="form-group">
                <label>使用数量：</label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount || 1}
                  onChange={handleInputChange}
                  min={1}
                  required
                />
              </div>
              <div className="form-group">
                <label>使用时间：</label>
                <input
                  type="datetime-local"
                  name="use_time"
                  value={formData.use_time || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingRecord}
                />
              </div>
              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  保存
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingRecord(null);
                  }}
                >
                  取消
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConsumeManage;
