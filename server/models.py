from flask_sqlalchemy import SQLAlchemy
from datetime import datetime, timezone

db = SQLAlchemy()
class User(db.Model):
    __tablename__ = 'User'
    username = db.Column(db.String(20), primary_key=True)
    password_hash = db.Column(db.String(2048), nullable=False)
    
# ------------------------ 学院表 ------------------------
class College(db.Model):
    __tablename__ = 'College'
    College_id = db.Column(db.String(10), primary_key=True)
    College_name = db.Column(db.String(100), nullable=False)
    phone = db.Column(db.String(11))
    dean = db.Column(db.String(20))
    
    # 定义与Lab表的一对多关系
    labs = db.relationship('Lab', backref='college', lazy=True)

# ------------------------ 实验室表 ------------------------
class Lab(db.Model):
    __tablename__ = 'Lab'
    lab_id = db.Column(db.String(10), primary_key=True)
    College_id = db.Column(db.String(10), db.ForeignKey('College.College_id'), nullable=False)
    location = db.Column(db.String(100))
    scale = db.Column(db.Integer)
    
    # 定义与Personnel、Risk_Record的一对多关系
    personnel = db.relationship('Personnel', backref='lab', lazy=True)
    risk_records = db.relationship('Risk_Record', backref='lab', lazy=True)

# ------------------------ 人员表 ------------------------
class Personnel(db.Model):
    __tablename__ = 'Personnel'
    personnel_id = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    lab_id = db.Column(db.String(10), db.ForeignKey('Lab.lab_id'))
    age = db.Column(db.SmallInteger)
    entry_date = db.Column(db.Date)
    training_status = db.Column(db.String(20), default='未培训')
    
    # 定义继承关系（教师/学生/安全员）
    teacher = db.relationship('Teacher', backref='personnel', uselist=False)
    student = db.relationship('Student', backref='personnel', uselist=False)
    safety_officer = db.relationship('Safety_Officer', backref='personnel', uselist=False)

# ------------------------ 教师表 ------------------------
class Teacher(db.Model):
    __tablename__ = 'Teacher'
    personnel_id = db.Column(db.String(20), db.ForeignKey('Personnel.personnel_id'), primary_key=True)
    title = db.Column(db.String(100))
    research_money = db.Column(db.Integer)
    area = db.Column(db.String(100))

# ------------------------ 学生表 ------------------------
class Student(db.Model):
    __tablename__ = 'Student'
    personnel_id = db.Column(db.String(20), db.ForeignKey('Personnel.personnel_id'), primary_key=True)
    Direction = db.Column(db.String(100))

# ------------------------ 安全员表 ------------------------
class Safety_Officer(db.Model):
    __tablename__ = 'Safety_Officer'
    personnel_id = db.Column(db.String(20), db.ForeignKey('Personnel.personnel_id'), primary_key=True)
    emergency_phone = db.Column(db.String(11))
    title = db.Column(db.String(100))
    research_money = db.Column(db.Integer)
    area = db.Column(db.String(100))

# ------------------------ 耗材表 ------------------------
class Consumable(db.Model):
    __tablename__ = 'Consumable'
    consumable_id = db.Column(db.String(10), primary_key=True)
    name = db.Column(db.String(100))
    storage = db.Column(db.Integer)
    min_stock = db.Column(db.Integer)
    update_date = db.Column(db.Date) 

# ------------------------ 设备表 ------------------------
class Equipment(db.Model):
    __tablename__ = 'equipment'
    equip_id = db.Column(db.String(10), primary_key=True)
    type = db.Column(db.String(10))
    used_age = db.Column(db.Integer)
    purchase_date = db.Column(db.Date) 
    if_booked = db.Column(db.SmallInteger)
    Maintain_cycle = db.Column(db.Integer)

# ------------------------ 使用记录表 ------------------------
class Use_record(db.Model):
    __tablename__ = 'Use_record'
    equip_id = db.Column(db.String(10), db.ForeignKey('equipment.equip_id'), primary_key=True)
    personnel_id = db.Column(db.String(20), db.ForeignKey('Personnel.personnel_id'), primary_key=True)
    start_time = db.Column(db.DateTime)
    end_time = db.Column(db.DateTime)
    cost = db.Column(db.Float)
    equip_condition = db.Column(db.String(40))
    if_expired = db.Column(db.Boolean)

# ------------------------ 耗材消耗表 ------------------------
class Consume(db.Model):
    __tablename__ = 'consume'
    personnel_id = db.Column(db.String(20), db.ForeignKey('Personnel.personnel_id'), primary_key=True)
    consumable_id = db.Column(db.String(10), db.ForeignKey('Consumable.consumable_id'), primary_key=True)
    amount = db.Column(db.Integer, nullable=False, default=1)
    use_time = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
# ------------------------ 风险记录表 ------------------------
class Risk_Record(db.Model):
    __tablename__ = 'Risk_Record'
    happen_time = db.Column(db.DateTime, primary_key=True)
    lab_id = db.Column(db.String(10), db.ForeignKey('Lab.lab_id'))
    risk_level = db.Column(db.SmallInteger)