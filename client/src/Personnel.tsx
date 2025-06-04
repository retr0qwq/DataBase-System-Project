import React, { useEffect, useState } from 'react';
import './styles/Personnel.css'; 

interface Personnel {
  personnel_id: string;
  name: string;
  lab_id: string;
  age: number;
  entry_date: string;
  training_status: string;
  role: string;
  title?: string;
  research_money?: number;
  area?: string;
  direction?: string;
  emergency_phone?: string;
}

const PersonnelManagement = () => {
  const [personnelList, setPersonnelList] = useState<Personnel[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPersonnel, setEditingPersonnel] = useState<Personnel | null>(null);
  const [formData, setFormData] = useState<Partial<Personnel>>({
    role: '学生',
    training_status: '未培训',
  });

  const baseUrl = 'http://localhost:5000/api';

  const fetchPersonnel = async () => {
    try {
      const response = await fetch(`${baseUrl}/personnel`);
      const data = await response.json();
      setPersonnelList(data.data || []);
    } catch (error) {
      console.error('获取人员列表失败:', error);
    }
  };

  React.useEffect(() => {
    fetchPersonnel();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPersonnel = () => {
    setEditingPersonnel(null);
    setFormData({ role: '学生', training_status: '未培训' });
    setIsModalOpen(true);
  };

  const handleEditPersonnel = (person: Personnel) => {
    setEditingPersonnel(person);
    setFormData({ ...person });
    setIsModalOpen(true);
  };

  const handleDeletePersonnel = async (id: string) => {
    if (!window.confirm('确定删除该人员吗？')) return;
    try {
      const res = await fetch(`${baseUrl}/personnel/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        fetchPersonnel();
      } else {
        alert(data.message || '删除失败');
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNew = !editingPersonnel;
    const url = isNew
      ? `${baseUrl}/personnel`
      : `${baseUrl}/personnel/${editingPersonnel?.personnel_id}`;
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
        fetchPersonnel();
      } else {
        alert(data.message || '保存失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败');
    }
  };

  return (
    <div className="user-management">
      <div className="section-header">
        <h2>人员管理</h2>
        <button className="add-button" onClick={handleAddPersonnel}>
          添加人员
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>编号</th>
            <th>姓名</th>
            <th>实验室</th>
            <th>年龄</th>
            <th>入职时间</th>
            <th>角色</th>
            <th>培训状态</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {personnelList.map(person => (
            <tr key={person.personnel_id}>
              <td>{person.personnel_id}</td>
              <td>{person.name}</td>
              <td>{person.lab_id}</td>
              <td>{person.age}</td>
              <td>{person.entry_date}</td>
              <td>{person.role}</td>
              <td className={person.training_status === '未培训' ? 'status-untrained' : ''}>
                  {person.training_status}
              </td>
              <td>
                <button
                  className="action-button edit"
                  onClick={() => handleEditPersonnel(person)}
                >
                  编辑
                </button>
                <button
                  className="action-button delete"
                  onClick={() => handleDeletePersonnel(person.personnel_id)}
                >
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
            <h3>{editingPersonnel ? '编辑人员' : '添加人员'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>编号：</label>
                <input
                  type="text"
                  name="personnel_id"
                  value={formData.personnel_id || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingPersonnel}
                />
              </div>
              <div className="form-group">
                <label>姓名：</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>实验室ID：</label>
                <input
                  type="text"
                  name="lab_id"
                  value={formData.lab_id || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>年龄：</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>入职时间：</label>
                <input
                  type="date"
                  name="entry_date"
                  value={formData.entry_date || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>培训状态：</label>
                <select
                  name="training_status"
                  value={formData.training_status || ''}
                  onChange={handleInputChange}
                >
                  <option value="未培训">未培训</option>
                  <option value="已培训">已培训</option>
                </select>
              </div>
              <div className="form-group">
                <label>角色：</label>
                <select
                  name="role"
                  value={formData.role || ''}
                  onChange={handleInputChange}
                >
                  <option value="教师">教师</option>
                  <option value="学生">学生</option>
                  <option value="安全员">安全员</option>
                </select>
              </div>

              {/* 动态角色字段 */}
              {formData.role === '教师' || formData.role === '安全员' ? (
                <>
                  <div className="form-group">
                    <label>职称：</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>科研经费：</label>
                    <input
                      type="number"
                      name="research_money"
                      value={formData.research_money || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>研究方向：</label>
                    <input
                      type="text"
                      name="area"
                      value={formData.area || ''}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              ) : null}

              {formData.role === '学生' && (
                <div className="form-group">
                  <label>研究方向：</label>
                  <input
                    type="text"
                    name="direction"
                    value={formData.direction || ''}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              {formData.role === '安全员' && (
                <div className="form-group">
                  <label>紧急电话：</label>
                  <input
                    type="text"
                    name="emergency_phone"
                    value={formData.emergency_phone || ''}
                    onChange={handleInputChange}
                  />
                </div>
              )}

              <div className="modal-buttons">
                <button type="submit" className="submit-button">
                  保存
                </button>
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setIsModalOpen(false)}
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

export default PersonnelManagement;
