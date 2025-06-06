from flask import Flask, request, jsonify, Response
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from flask_cors import CORS
from dotenv import load_dotenv
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash
from models import db,User,College, Lab, Personnel, Risk_Record,Teacher, Student, Safety_Officer,Consume,Consumable,Equipment,Use_record
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

# 从环境变量读取配置，默认值仅用于开发环境
app.config["SQLALCHEMY_DATABASE_URI"] = (
    f"mysql+pymysql://{os.getenv('DB_USER', 'root')}:"
    f"{os.getenv('DB_PASSWORD', '123456')}@"
    f"{os.getenv('DB_HOST', '127.0.0.1')}:"
    f"{os.getenv('DB_PORT', '3306')}/"
    f"{os.getenv('DB_NAME', 'lab_management')}"
)
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False 
db.init_app(app)
# ------------------------ 登录验证 -------------------------
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    user: User = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify(
            {
                "message": "Login successful",
                "username": user.username,
            }
        )
    else:
        return jsonify({"message": "Invalid username or password"}), 401
# ------------------------ 注册新用户 -------------------------
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data["username"]
    password = data["password"]
    
    # Check if username already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({"message": "用户名已存在"}), 409

    new_user = User(
        username=username, password_hash=generate_password_hash(password, method='pbkdf2:sha256')
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify(
        {
            "message": "Registration successful",
            "username": new_user.username,
        }
    )
# ------------------------ 获取统计信息 -------------------------
@app.route('/api/dashboard/stats', methods=['GET'])
def get_summary_stats():
    summary = {
        "college_count": College.query.count(),
        "lab_count": Lab.query.count(),
        "personnel_count": Personnel.query.count(),
        "consumable_count": Consumable.query.count(),
        "consumption_count": Consume.query.count(),
        "equipment_count": Equipment.query.count(),
        "use_record_count": Use_record.query.count(),
        "risk_record_count": Risk_Record.query.count()
    }
    return jsonify(summary)

# ------------------------ 获取所有人员 ------------------------
@app.route('/api/personnel', methods=['GET'])
def get_all_personnel():
    try:
        personnel_list = Personnel.query.all()
        result = []
        for p in personnel_list:
            role = None
            extra = {}

            if p.teacher:
                role = '教师'
                extra = {
                    'title': p.teacher.title,
                    'research_money': p.teacher.research_money,
                    'area': p.teacher.area
                }
            elif p.student:
                role = '学生'
                extra = {
                    'direction': p.student.Direction
                }
            elif p.safety_officer:
                role = '安全员'
                extra = {
                    'emergency_phone': p.safety_officer.emergency_phone,
                    'title': p.safety_officer.title,
                    'research_money': p.safety_officer.research_money,
                    'area': p.safety_officer.area
                }

            result.append({
                'personnel_id': p.personnel_id,
                'name': p.name,
                'age': p.age,
                'entry_date': p.entry_date.strftime('%Y-%m-%d') if p.entry_date else None,
                'training_status': p.training_status,
                'lab_id': p.lab_id,
                'role': role,
                **extra
            })
        return jsonify({'status': 'success', 'data': result})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ------------------------ 添加人员（含角色） ------------------------
@app.route('/api/personnel', methods=['POST'])
def create_personnel():
    try:
        data = request.get_json()
        personnel = Personnel(
            personnel_id=data['personnel_id'],
            name=data['name'],
            age=data.get('age'),
            lab_id=data['lab_id'],
            entry_date=datetime.strptime(data['entry_date'], '%Y-%m-%d'),
            training_status=data.get('training_status', '未培训')
        )
        db.session.add(personnel)

        role = data.get('role')
        if role == '教师':
            db.session.add(Teacher(
                personnel_id=data['personnel_id'],
                title=data['title'],
                research_money=data['research_money'],
                area=data['area']
            ))
        elif role == '学生':
            db.session.add(Student(
                personnel_id=data['personnel_id'],
                Direction=data['direction']
            ))
        elif role == '安全员':
            db.session.add(Safety_Officer(
                personnel_id=data['personnel_id'],
                emergency_phone=data['emergency_phone'],
                title=data['title'],
                research_money=data['research_money'],
                area=data['area']
            ))

        db.session.commit()
        return jsonify({'status': 'success', 'message': '人员创建成功'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
# ------------------------ 更新人员信息 -------------------------
@app.route('/api/personnel/<personnel_id>', methods=['PUT'])
def update_personnel(personnel_id):
    try:
        data = request.get_json()
        personnel = Personnel.query.get(personnel_id)
        if not personnel:
            return jsonify({'status': 'error', 'message': '人员不存在'}), 404

        # 更新 Personnel 表基本信息
        personnel.name = data.get('name', personnel.name)
        personnel.age = data.get('age', personnel.age)
        personnel.lab_id = data.get('lab_id', personnel.lab_id)
        if 'entry_date' in data:
            personnel.entry_date = datetime.strptime(data['entry_date'], '%Y-%m-%d')
        personnel.training_status = data.get('training_status', personnel.training_status)

        # 更新角色信息
        role = data.get('role')
        if role == '教师':
            if not personnel.teacher:
                personnel.teacher = Teacher(personnel_id=personnel_id)
            personnel.teacher.title = data.get('title', personnel.teacher.title)
            personnel.teacher.research_money = data.get('research_money', personnel.teacher.research_money)
            personnel.teacher.area = data.get('area', personnel.teacher.area)

        elif role == '学生':
            if not personnel.student:
                personnel.student = Student(personnel_id=personnel_id)
            personnel.student.Direction = data.get('direction', personnel.student.Direction)

        elif role == '安全员':
            if not personnel.safety_officer:
                personnel.safety_officer = Safety_Officer(personnel_id=personnel_id)
            personnel.safety_officer.title = data.get('title', personnel.safety_officer.title)
            personnel.safety_officer.research_money = data.get('research_money', personnel.safety_officer.research_money)
            personnel.safety_officer.area = data.get('area', personnel.safety_officer.area)
            personnel.safety_officer.emergency_phone = data.get('emergency_phone', personnel.safety_officer.emergency_phone)

        db.session.commit()
        return jsonify({'status': 'success', 'message': '人员信息已更新'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
# ------------------------ 获取学院信息 -------------------------
@app.route('/api/college', methods=['GET'])
def get_colleges():
    try:
        colleges = College.query.all()
        data = [college.to_dict() if hasattr(college, 'to_dict') else {
            'College_id': college.College_id,
            'College_name': college.College_name,
            'phone': college.phone,
            'dean': college.dean,
        } for college in colleges]
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
# ------------------------ 添加学院 -------------------------
@app.route('/api/college', methods=['POST'])
def add_college():
    try:
        data = request.get_json()
        college = College(
            College_id=data.get('College_id'),
            College_name=data.get('College_name'),
            phone=data.get('phone'),
            dean=data.get('dean')
        )
        db.session.add(college)
        db.session.commit()
        return jsonify({'status': 'success', 'message': '学院添加成功'})
    except Exception as e:
        db.session.rollback()
        print('错误:', e)  # 错误日志
        return jsonify({'status': 'error', 'message': str(e)}), 500
# ------------------------ 更新学院信息 -------------------------
@app.route('/api/college/<college_id>', methods=['PUT'])
def update_college(college_id):
    try:
        data = request.get_json()
        college = College.query.filter_by(College_id=college_id).first()
        if not college:
            return jsonify({'status': 'error', 'message': '学院不存在'}), 404
        college.College_name = data.get('College_name', college.College_name)
        college.phone = data.get('phone', college.phone)
        college.dean = data.get('dean', college.dean)
        db.session.commit()
        return jsonify({'status': 'success', 'message': '学院信息已更新'})
    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 400
# ------------------------ 获取实验室信息 -------------------------
@app.route('/api/lab', methods=['GET'])
def get_labs():
    labs = Lab.query.all()
    lab_list = []
    for lab in labs:
        lab_list.append({
            'lab_id': lab.lab_id,
            'College_id': lab.College_id,
            'location': lab.location,
            'scale': lab.scale
        })
    return jsonify({"status": "success", "data": lab_list})

# ------------------------ 添加实验室 -------------------------
@app.route('/api/lab', methods=['POST'])
def add_lab():
    data = request.get_json()
    lab_id = data.get('lab_id')
    if Lab.query.get(lab_id):
        return jsonify({"status": "fail", "message": "实验室编号已存在"}), 400

    new_lab = Lab(
        lab_id=lab_id,
        College_id=data.get('College_id'),
        location=data.get('location'),
        scale=data.get('scale')
    )
    db.session.add(new_lab)
    try:
        db.session.commit()
        return jsonify({"status": "success", "message": "添加成功"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "fail", "message": f"添加失败: {str(e)}"}), 500

# ------------------------ 更新实验室信息 -------------------------
@app.route('/api/lab/<lab_id>', methods=['PUT'])
def update_lab(lab_id):
    lab = Lab.query.get(lab_id)
    if not lab:
        return jsonify({"status": "fail", "message": "实验室不存在"}), 404

    data = request.get_json()
    lab.College_id = data.get('College_id', lab.College_id)
    lab.location = data.get('location', lab.location)
    lab.scale = data.get('scale', lab.scale)

    try:
        db.session.commit()
        return jsonify({"status": "success", "message": "更新成功"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "fail", "message": f"更新失败: {str(e)}"}), 500
# ------------------------ 获取耗材列表 -------------------------
@app.route('/api/consumable', methods=['GET'])
def get_consumables():
    try:
        consumables = Consumable.query.all()
        data = []
        for c in consumables:
            data.append({
                'consumable_id': c.consumable_id,
                'name': c.name,
                'storage': c.storage,
                'min_stock': c.min_stock,
                'update_date': c.update_date.isoformat() if c.update_date else None,
            })
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ------------------------ 添加耗材 -------------------------
@app.route('/api/consumable', methods=['POST'])
def add_consumable():
    try:
        data = request.get_json()
        new_c = Consumable(
            consumable_id=data['consumable_id'],
            name=data.get('name'),
            storage=data.get('storage'),
            min_stock=data.get('min_stock'),
            update_date=data.get('update_date')  # 需要前端传入 YYYY-MM-DD 格式字符串，数据库是 Date 类型
        )
        db.session.add(new_c)
        db.session.commit()
        return jsonify({"status": "success", "message": "添加成功"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ------------------------ 更新耗材信息 -------------------------
@app.route('/api/consumable/<consumable_id>', methods=['PUT'])
def update_consumable(consumable_id):
    try:
        data = request.get_json()
        consumable = Consumable.query.get(consumable_id)
        if not consumable:
            return jsonify({"status": "error", "message": "耗材不存在"}), 404

        consumable.name = data.get('name', consumable.name)
        consumable.storage = data.get('storage', consumable.storage)
        consumable.min_stock = data.get('min_stock', consumable.min_stock)
        consumable.update_date = data.get('update_date', consumable.update_date)

        db.session.commit()
        return jsonify({"status": "success", "message": "更新成功"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# ------------------------ 获取仪器列表 -------------------------
@app.route('/api/equipment', methods=['GET'])
def get_equipment_list():
    try:
        equipment = Equipment.query.all()
        data = []
        for e in equipment:
            data.append({
                'equip_id': e.equip_id,
                'type': e.type,
                'used_age': e.used_age,
                'purchase_date': e.purchase_date.isoformat() if e.purchase_date else None,
                'if_booked': e.if_booked,
                'Maintain_cycle': e.Maintain_cycle
            })
        return jsonify({"status": "success", "data": data})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500


# ------------------------ 添加仪器 -------------------------
@app.route('/api/equipment', methods=['POST'])
def add_equipment():
    try:
        data = request.get_json()
        new_e = Equipment(
            equip_id=data['equip_id'],
            type=data.get('type'),
            used_age=data.get('used_age'),
            purchase_date=datetime.strptime(data['purchase_date'], '%Y-%m-%d').date() if data.get('purchase_date') else None,
            if_booked=data.get('if_booked'),
            Maintain_cycle=data.get('Maintain_cycle')
        )
        db.session.add(new_e)
        db.session.commit()
        return jsonify({"status": "success", "message": "添加成功"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500


# ------------------------ 更新仪器 -------------------------
@app.route('/api/equipment/<equip_id>', methods=['PUT'])
def update_equipment(equip_id):
    try:
        data = request.get_json()
        e = Equipment.query.get(equip_id)
        if not e:
            return jsonify({"status": "error", "message": "未找到该设备"}), 404

        e.type = data.get('type', e.type)
        e.used_age = data.get('used_age', e.used_age)
        e.purchase_date = datetime.strptime(data['purchase_date'], '%Y-%m-%d').date() if data.get('purchase_date') else e.purchase_date
        e.if_booked = data.get('if_booked', e.if_booked)
        e.Maintain_cycle = data.get('Maintain_cycle', e.Maintain_cycle)

        db.session.commit()
        return jsonify({"status": "success", "message": "更新成功"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
# ------------------------ 删除人员 -------------------------
@app.route('/api/personnel/<personnel_id>', methods=['DELETE'])
def delete_personnel(personnel_id):
    try:
        db.session.begin()  
        Teacher.query.filter_by(personnel_id=personnel_id).delete()
        Student.query.filter_by(personnel_id=personnel_id).delete()
        Safety_Officer.query.filter_by(personnel_id=personnel_id).delete()
        Use_record.query.filter_by(personnel_id=personnel_id).delete()
        Consume.query.filter_by(personnel_id=personnel_id).delete()
        Personnel.query.filter_by(personnel_id=personnel_id).delete()
        
        db.session.commit()
        return jsonify({"message": "Personnel and all roles deleted"})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
# ------------------------ 删除耗材及其相关数据 ------------------------
@app.route('/api/consumable/<consumable_id>', methods=['DELETE'])
def delete_consumable(consumable_id):
    try:
        db.session.begin()
        
        Consume.query.filter_by(consumable_id=consumable_id).delete()
        Consumable.query.filter_by(consumable_id=consumable_id).delete()
        
        db.session.commit()
        return jsonify({"message": "Consumable and consumption records deleted"})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
# ------------------------ 删除设备及其相关数据 ------------------------
@app.route('/api/equipment/<equip_id>', methods=['DELETE'])
def delete_equipment(equip_id):
    try:
        db.session.begin()
        
        Use_record.query.filter_by(equip_id=equip_id).delete()
        Equipment.query.filter_by(equip_id=equip_id).delete()
        
        db.session.commit()
        return jsonify({"message": "Equipment and usage records deleted"})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
# ------------------------ 删除实验室及其相关数据 ------------------------
@app.route('/api/lab/<lab_id>', methods=['DELETE'])
def delete_lab(lab_id):
    try:
        db.session.begin()

        personnel_ids = [
            p.personnel_id for p in 
            Personnel.query.filter_by(lab_id=lab_id).all()
        ]
        Use_record.query.filter(Use_record.personnel_id.in_(personnel_ids)).delete()
        Consume.query.filter(Consume.personnel_id.in_(personnel_ids)).delete()
        Teacher.query.filter(Teacher.personnel_id.in_(personnel_ids)).delete()
        Student.query.filter(Student.personnel_id.in_(personnel_ids)).delete()
        Safety_Officer.query.filter(Safety_Officer.personnel_id.in_(personnel_ids)).delete()
        Personnel.query.filter_by(lab_id=lab_id).delete()
        Risk_Record.query.filter_by(lab_id=lab_id).delete()
        Lab.query.filter_by(lab_id=lab_id).delete()

        db.session.commit()
        return jsonify({"message": "Lab and ALL related data deleted"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
# ------------------------ 删除学院及其相关数据 ------------------------
@app.route('/api/college/<college_id>', methods=['DELETE'])
def delete_college(college_id):
    try:
        db.session.begin()
        labs = Lab.query.filter_by(College_id=college_id).all()
        lab_ids = [lab.lab_id for lab in labs]
        
        personnel_ids = [
            p.personnel_id for p in 
            Personnel.query.filter(Personnel.lab_id.in_(lab_ids)).all()
        ]
        Use_record.query.filter(Use_record.personnel_id.in_(personnel_ids)).delete()
        Consume.query.filter(Consume.personnel_id.in_(personnel_ids)).delete()
        Teacher.query.filter(Teacher.personnel_id.in_(personnel_ids)).delete()
        Student.query.filter(Student.personnel_id.in_(personnel_ids)).delete()
        Safety_Officer.query.filter(Safety_Officer.personnel_id.in_(personnel_ids)).delete()
        Personnel.query.filter(Personnel.lab_id.in_(lab_ids)).delete()
        Risk_Record.query.filter(Risk_Record.lab_id.in_(lab_ids)).delete()
        Lab.query.filter_by(College_id=college_id).delete()
        College.query.filter_by(College_id=college_id).delete()
        db.session.commit()
        return jsonify({"message": "College and ALL related data deleted"})

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

from sqlalchemy import text
from sqlalchemy import text
# ------------------------添加设备使用记录------------------------
@app.route('/api/equipment/usage', methods=['POST'])
def record_equipment_usage():
    try:
        data = request.get_json()
        
        # 1. 基础验证
        required_fields = ['equip_id', 'personnel_id', 'start_time', 'end_time']
        if not all(field in data for field in required_fields):
            return jsonify({'status': 'error', 'message': '缺少必要字段'}), 400

        # 2. 时间格式验证
        try:
            start_time = datetime.strptime(data['start_time'], '%Y-%m-%d %H:%M:%S')
            end_time = datetime.strptime(data['end_time'], '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return jsonify({'status': 'error', 'message': '时间格式错误，请使用 YYYY-MM-DD HH:MM:SS 格式'}), 400

        # 3. 时间逻辑验证
        if start_time >= end_time:
            return jsonify({'status': 'error', 'message': '结束时间必须晚于开始时间'}), 400

        # 4. 使用事务执行插入操作
        with db.session.begin_nested():  # 使用嵌套事务以便捕获触发器错误
            new_record = Use_record(
                equip_id=data['equip_id'],
                personnel_id=data['personnel_id'],
                start_time=start_time,
                end_time=end_time,
                equip_condition=data.get('condition', '正常'),
                if_expired=False  # 默认值
            )
            db.session.add(new_record)
        db.session.commit()
        # 5. 如果执行到这里说明触发器验证通过
        return jsonify({
            'status': 'success',
            'message': '设备使用记录添加成功',
            'record_id': f"{data['equip_id']}-{data['personnel_id']}"
        }), 201

    except Exception as e:
        # 6. 捕获触发器抛出的错误
        error_msg = str(e)
        if "超出设备维护周期" in error_msg:
            return jsonify({'status': 'error', 'message': '错误：'+error_msg}), 400
        elif "时间冲突" in error_msg:
            return jsonify({'status': 'error', 'message': '错误：'+error_msg}), 409
        elif "设备不存在" in error_msg:
            return jsonify({'status': 'error', 'message': '错误：'+error_msg}), 404
        else:
            return jsonify({'status': 'error', 'message': '服务器错误：'+error_msg}), 500
# ------------------------ 查询设备使用记录 ------------------------
@app.route('/api/equipment/usage', methods=['GET'])
def get_equipment_usage():
    try:
        # 支持按设备ID、人员ID或时间范围查询
        equip_id = request.args.get('equip_id')
        personnel_id = request.args.get('personnel_id')
        start_date = request.args.get('start_date')
        end_date = request.args.get('end_date')

        query = Use_record.query

        # 构建查询条件
        if equip_id:
            query = query.filter(Use_record.equip_id == equip_id)
        if personnel_id:
            query = query.filter(Use_record.personnel_id == personnel_id)
        if start_date:
            try:
                start_date = datetime.strptime(start_date, '%Y-%m-%d')
                query = query.filter(Use_record.start_time >= start_date)
            except ValueError:
                return jsonify({'status': 'error', 'message': '开始日期格式错误'}), 400
        if end_date:
            try:
                end_date = datetime.strptime(end_date, '%Y-%m-%d')
                query = query.filter(Use_record.end_time <= end_date)
            except ValueError:
                return jsonify({'status': 'error', 'message': '结束日期格式错误'}), 400

        # 执行查询
        records = query.order_by(Use_record.start_time.desc()).all()

        # 格式化返回数据
        result = []
        for record in records:
            result.append({
                'equip_id': record.equip_id,
                'personnel_id': record.personnel_id,
                'start_time': record.start_time.strftime('%Y-%m-%d %H:%M:%S'),
                'end_time': record.end_time.strftime('%Y-%m-%d %H:%M:%S'),
                'cost': float(record.cost) if record.cost else 0.0,
                'equip_condition': record.equip_condition,
                'if_expired': bool(record.if_expired)
            })

        return jsonify({
            'status': 'success',
            'data': result,
            'count': len(result)
        })

    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': f'查询失败: {str(e)}'
        }), 500

# ------------------------ 删除设备使用记录 ------------------------
@app.route('/api/equipment/usage/<equip_id>/<personnel_id>', methods=['DELETE'])
def delete_equipment_usage(equip_id, personnel_id):
    try:
        # 首先尝试获取记录
        record = Use_record.query.filter_by(
            equip_id=equip_id,
            personnel_id=personnel_id
        ).first()

        if not record:
            return jsonify({
                'status': 'error',
                'message': '未找到指定的使用记录'
            }), 404

        # 检查时间是否已过（可选业务逻辑）
        if record.end_time < datetime.now():
            return jsonify({
                'status': 'error',
                'message': '不能删除已结束的使用记录'
            }), 400

        # 执行删除
        db.session.delete(record)
        db.session.commit()

        return jsonify({
            'status': 'success',
            'message': '使用记录删除成功'
        })

    except Exception as e:
        db.session.rollback()
        return jsonify({
            'status': 'error',
            'message': f'删除失败: {str(e)}'
        }), 500
# ------------------------ 获取耗材使用记录 ------------------------
@app.route('/api/consume', methods=['GET'])
def get_consumption_records():
    try:
        records = db.session.query(
            Consume.personnel_id,
            Consume.consumable_id,
            Consume.amount,
            Consume.use_time,
            Consumable.name.label('consumable_name')
        ).join(Consumable, Consume.consumable_id == Consumable.consumable_id).all()

        data = [
            {
                'personnel_id': r.personnel_id,
                'consumable_id': r.consumable_id,
                'consumable_name': r.consumable_name,
                'amount': r.amount,
                'use_time': r.use_time.strftime('%Y-%m-%d %H:%M:%S')
            }
            for r in records
        ]

        return jsonify({'status': 'success', 'data': data})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500


# ------------------------ 更新耗材使用记录 ------------------------
@app.route('/api/consume/<personnel_id>/<consumable_id>', methods=['PUT'])
def update_consumption(personnel_id, consumable_id):
    try:
        data = request.get_json()
        old_amount = data.get('old_amount', 0)
        new_amount = data.get('new_amount', 0)

        with db.engine.begin() as conn:
            conn.execute(text("SET @result = ''"))
            conn.execute(
                text("""
                    CALL update_consumption(
                        :personnel_id, :consumable_id,
                        :old_amount, :new_amount, @result
                    )
                """),
                {
                    'personnel_id': personnel_id,
                    'consumable_id': consumable_id,
                    'old_amount': old_amount,
                    'new_amount': new_amount
                }
            )
            result = conn.execute(text("SELECT @result")).scalar()

        if result and result.startswith('Error'):
            return jsonify({'status': 'error', 'message': result[7:]}), 400
        else:
            return jsonify({'status': 'success', 'message': result[9:] if result else '更新成功'}), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

# ------------------------ 获取耗材状态及使用人次 -------------------------
@app.route('/api/consumables/status', methods=['GET'])
def get_consumable_status():
    try:
        sql = text("SELECT * FROM v_consumable_status")
        result = db.session.execute(sql).mappings().all()
        data = [dict(row) for row in result]
        return jsonify({'status': 'success', 'data': data})
    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
# ------------------------ 获取风险记录 -------------------------
@app.route('/api/risk', methods=['GET'])
def get_risk_records():
    try:
        records = Risk_Record.query.order_by(Risk_Record.happen_time.desc()).all()
        result = [{
            'happen_time': record.happen_time.strftime('%Y-%m-%d %H:%M:%S'),
            'lab_id': record.lab_id,
            'risk_level': record.risk_level
        } for record in records]

        return jsonify({'status': 'success', 'data': result}), 200

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500
# ------------------------ 添加风险记录 -------------------------
@app.route('/api/risk', methods=['POST'])
def add_risk_record():
    try:
        data = request.get_json()

        required_fields = ['happen_time', 'lab_id', 'risk_level']
        if not all(field in data for field in required_fields):
            return jsonify({'status': 'error', 'message': '缺少必要字段'}), 400

        try:
            happen_time = datetime.strptime(data['happen_time'], '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return jsonify({'status': 'error', 'message': '时间格式错误，应为 YYYY-MM-DD HH:MM:SS'}), 400

        new_record = Risk_Record(
            happen_time=happen_time,
            lab_id=data['lab_id'],
            risk_level=int(data['risk_level'])
        )
        db.session.add(new_record)
        db.session.commit()

        return jsonify({'status': 'success', 'message': '风险记录添加成功'}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'status': 'error', 'message': str(e)}), 500
# ------------------------ 删除风险记录 -------------------------
@app.route('/api/risk/<happen_time>', methods=['DELETE'])
def delete_risk_record(happen_time):
    try:
        try:
            happen_time_dt = datetime.strptime(happen_time, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return jsonify({"status": "error", "message": "时间格式错误，应为 YYYY-MM-DD HH:MM:SS"}), 400

        record = Risk_Record.query.get(happen_time_dt)
        if not record:
            return jsonify({"status": "error", "message": "未找到对应的风险记录"}), 404

        db.session.delete(record)
        db.session.commit()
        return jsonify({"status": "success", "message": "删除成功"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500
# ------------------------ 更新风险记录 -------------------------
@app.route('/api/risk/<happen_time>', methods=['PUT'])
def update_risk_record(happen_time):
    try:
        data = request.get_json()

        try:
            happen_time_dt = datetime.strptime(happen_time, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            return jsonify({"status": "error", "message": "时间格式错误，应为 YYYY-MM-DD HH:MM:SS"}), 400

        record = Risk_Record.query.get(happen_time_dt)
        if not record:
            return jsonify({"status": "error", "message": "未找到对应的风险记录"}), 404

        record.lab_id = data.get('lab_id', record.lab_id)
        record.risk_level = data.get('risk_level', record.risk_level)

        db.session.commit()
        return jsonify({"status": "success", "message": "更新成功"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

# ------------------------ 查询高风险实验室 -------------------------
@app.route('/api/risk/view_status', methods=['GET'])
def get_high_risk_labs_and_update_training():
    try:
        with db.engine.connect() as conn:
            # 调用存储过程，更新 training_status
            conn.execute(text("CALL update_training_status_by_risk()"))
            # 提交事务
            conn.commit()
            # 查询视图返回高风险实验室信息
            result = conn.execute(text("SELECT * FROM v_high_risk_labs")).mappings().all()
            data = [dict(row) for row in result]
                
        return jsonify({'status': 'success', 'data': data})

    except Exception as e:
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    with app.app_context():
        #db.drop_all()  # 清空所有表
        db.create_all()
        print("数据库表已初始化")
    app.run(debug=True)