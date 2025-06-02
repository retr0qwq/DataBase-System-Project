import React, { useEffect, useState } from 'react';
import './styles/Lab.css';

interface Lab {
  lab_id: string;
  College_id: string;
  location?: string;
  scale?: number;
}

interface College {
  College_id: string;
  College_name: string;
}

const LabManage = () => {
  const baseUrl = 'http://localhost:5000/api';

  const [labList, setLabList] = useState<Lab[]>([]);
  const [collegeList, setCollegeList] = useState<College[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLab, setEditingLab] = useState<Lab | null>(null);
  const [formData, setFormData] = useState<Partial<Lab>>({});

  // 获取实验室列表
  const fetchLabs = async () => {
    try {
      const response = await fetch(`${baseUrl}/lab`);
      const data = await response.json();
      setLabList(data.data || []);
    } catch (error) {
      console.error('获取实验室列表失败:', error);
    }
  };

  // 获取学院列表，用于下拉选择
  const fetchColleges = async () => {
    try {
      const response = await fetch(`${baseUrl}/college`);
      const data = await response.json();
      setCollegeList(data.data || []);
    } catch (error) {
      console.error('获取学院列表失败:', error);
    }
  };

  useEffect(() => {
    fetchLabs();
    fetchColleges();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'scale' ? Number(value) : value,
    }));
  };

  const handleAddLab = () => {
    setEditingLab(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEditLab = (lab: Lab) => {
    setEditingLab(lab);
    setFormData({ ...lab });
    setIsModalOpen(true);
  };

  const handleDeleteLab = async (id: string) => {
    if (!window.confirm('确定删除该实验室吗？')) return;
    try {
      const res = await fetch(`${baseUrl}/lab/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        fetchLabs();
      } else {
        alert(data.message || '删除失败');
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNew = !editingLab;
    const url = isNew
      ? `${baseUrl}/lab`
      : `${baseUrl}/lab/${editingLab?.lab_id}`;
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
        fetchLabs();
      } else {
        alert(data.message || '保存失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败');
    }
  };

  return (
    <div className="lab-management">
      <div className="section-header">
        <h2>实验室管理</h2>
        <button className="add-button" onClick={handleAddLab}>
          添加实验室
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>实验室编号</th>
            <th>所属学院</th>
            <th>位置</th>
            <th>规模（m²）</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {labList.map(lab => {
            const college = collegeList.find(c => c.College_id === lab.College_id);
            return (
              <tr key={lab.lab_id}>
                <td>{lab.lab_id}</td>
                <td>{college ? college.College_name : lab.College_id}</td>
                <td>{lab.location}</td>
                <td>{lab.scale}</td>
                <td>
                  <button
                    className="action-button edit"
                    onClick={() => handleEditLab(lab)}
                  >
                    编辑
                  </button>
                  <button
                    className="action-button delete"
                    onClick={() => handleDeleteLab(lab.lab_id)}
                  >
                    删除
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h3>{editingLab ? '编辑实验室' : '添加实验室'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>实验室编号：</label>
                <input
                  type="text"
                  name="lab_id"
                  value={formData.lab_id || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingLab}
                />
              </div>
              <div className="form-group">
                <label>所属学院：</label>
                <select
                  name="College_id"
                  value={formData.College_id || ''}
                  onChange={handleInputChange}
                  required
                >
                  <option value="" disabled>请选择学院</option>
                  {collegeList.map(college => (
                    <option key={college.College_id} value={college.College_id}>
                      {college.College_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>位置：</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>规模（m²）：</label>
                <input
                  type="number"
                  name="scale"
                  value={formData.scale ?? ''}
                  onChange={handleInputChange}
                  min={0}
                />
              </div>

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

export default LabManage;
