import React, { useEffect, useState } from 'react';
import './styles/College.css';

interface College {
  College_id: string;
  College_name: string;
  phone?: string;
  dean?: string;
}

const CollegeManage = () => {
  const [collegeList, setCollegeList] = useState<College[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCollege, setEditingCollege] = useState<College | null>(null);
  const [formData, setFormData] = useState<Partial<College>>({});
  const baseUrl = 'http://localhost:5000/api';

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
    fetchColleges();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddCollege = () => {
    setEditingCollege(null);
    setFormData({});
    setIsModalOpen(true);
  };

  const handleEditCollege = (college: College) => {
    setEditingCollege(college);
    setFormData({ ...college });
    setIsModalOpen(true);
  };

  const handleDeleteCollege = async (id: string) => {
    if (!window.confirm('确定删除该学院吗？')) return;
    try {
      const res = await fetch(`${baseUrl}/college/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.status === 'success') {
        fetchColleges();
      } else {
        alert(data.message || '删除失败');
      }
    } catch (err) {
      alert('删除失败');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isNew = !editingCollege;
    const url = isNew
      ? `${baseUrl}/college`
      : `${baseUrl}/college/${editingCollege?.College_id}`;
    const method = isNew ? 'POST' : 'PUT';

    console.log('提交内容:', formData);
    console.log('请求地址:', url);
    console.log('请求方法:', method);

    try {
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setIsModalOpen(false);
        fetchColleges();
      } else {
        alert(data.message || '保存失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败');
    }
  };

  return (
    <div className="college-management">
      <div className="section-header">
        <h2>学院管理</h2>
        <button className="add-button" onClick={handleAddCollege}>
          添加学院
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>学院编号</th>
            <th>学院名称</th>
            <th>电话</th>
            <th>院长</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {collegeList.map(college => (
            <tr key={college.College_id}>
              <td>{college.College_id}</td>
              <td>{college.College_name}</td>
              <td>{college.phone}</td>
              <td>{college.dean}</td>
              <td>
                <button
                  className="action-button edit"
                  onClick={() => handleEditCollege(college)}
                >
                  编辑
                </button>
                <button
                  className="action-button delete"
                  onClick={() => handleDeleteCollege(college.College_id)}
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
            <h3>{editingCollege ? '编辑学院' : '添加学院'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>学院编号：</label>
                <input
                  type="text"
                  name="College_id"
                  value={formData.College_id || ''}
                  onChange={handleInputChange}
                  required
                  disabled={!!editingCollege}
                />
              </div>
              <div className="form-group">
                <label>学院名称：</label>
                <input
                  type="text"
                  name="College_name"
                  value={formData.College_name || ''}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>联系电话：</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group">
                <label>院长：</label>
                <input
                  type="text"
                  name="dean"
                  value={formData.dean || ''}
                  onChange={handleInputChange}
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

export default CollegeManage;
