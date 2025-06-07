/*
 Navicat Premium Dump SQL

 Source Server         : lab_manage
 Source Server Type    : MySQL
 Source Server Version : 90200 (9.2.0)
 Source Host           : localhost:3306
 Source Schema         : lab_management

 Target Server Type    : MySQL
 Target Server Version : 90200 (9.2.0)
 File Encoding         : 65001

 Date: 07/06/2025 09:35:40
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for college
-- ----------------------------
DROP TABLE IF EXISTS `college`;
CREATE TABLE `college`  (
  `College_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `College_name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `dean` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`College_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of college
-- ----------------------------
INSERT INTO `college` VALUES ('0001', '化学院', '12345678', '朱教授');
INSERT INTO `college` VALUES ('0002', '生命科学学院', '12345679', '李教授');
INSERT INTO `college` VALUES ('0003', '材料学院', '22345678', '王教授');
INSERT INTO `college` VALUES ('0004', '环境学院', '88888888', '祝教授');
INSERT INTO `college` VALUES ('0005', '药学院', '99999999', '刘教授');

-- ----------------------------
-- Table structure for consumable
-- ----------------------------
DROP TABLE IF EXISTS `consumable`;
CREATE TABLE `consumable`  (
  `consumable_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `storage` int NULL DEFAULT NULL,
  `min_stock` int NULL DEFAULT NULL,
  `update_date` date NULL DEFAULT NULL,
  PRIMARY KEY (`consumable_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of consumable
-- ----------------------------
INSERT INTO `consumable` VALUES ('001', '口罩', 98998, 10, '2025-06-06');
INSERT INTO `consumable` VALUES ('002', '手套', 1, 20, '2025-06-02');
INSERT INTO `consumable` VALUES ('004', '实验用纸', 20, 100, '2025-06-02');
INSERT INTO `consumable` VALUES ('005', '甲醇', 997, 5, '2025-06-02');
INSERT INTO `consumable` VALUES ('006', '乙醇', 0, 10, '2025-06-02');

-- ----------------------------
-- Table structure for consume
-- ----------------------------
DROP TABLE IF EXISTS `consume`;
CREATE TABLE `consume`  (
  `personnel_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `consumable_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `amount` int NOT NULL,
  `use_time` datetime NULL DEFAULT NULL,
  PRIMARY KEY (`personnel_id`, `consumable_id`) USING BTREE,
  INDEX `consumable_id`(`consumable_id` ASC) USING BTREE,
  CONSTRAINT `consume_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnel` (`personnel_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `consume_ibfk_2` FOREIGN KEY (`consumable_id`) REFERENCES `consumable` (`consumable_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of consume
-- ----------------------------
INSERT INTO `consume` VALUES ('010001', '005', 2, '2025-06-02 20:09:18');
INSERT INTO `consume` VALUES ('2200001', '002', 500, '2025-06-02 19:15:00');
INSERT INTO `consume` VALUES ('2200001', '005', 1, '2025-06-02 19:43:16');
INSERT INTO `consume` VALUES ('2211290', '001', 2, '2025-06-07 01:00:37');
INSERT INTO `consume` VALUES ('2211312', '001', 1000, '2025-06-07 00:59:26');

-- ----------------------------
-- Table structure for equipment
-- ----------------------------
DROP TABLE IF EXISTS `equipment`;
CREATE TABLE `equipment`  (
  `equip_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `type` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `used_age` int NULL DEFAULT NULL,
  `purchase_date` date NULL DEFAULT NULL,
  `if_booked` smallint NULL DEFAULT NULL,
  `Maintain_cycle` int NULL DEFAULT NULL,
  PRIMARY KEY (`equip_id`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of equipment
-- ----------------------------
INSERT INTO `equipment` VALUES ('A-1001', '大型仪器', 20001, '2025-03-05', 1, 20000);
INSERT INTO `equipment` VALUES ('B-1001', '大型仪器', 48, '2025-06-03', 1, 5000);
INSERT INTO `equipment` VALUES ('C-1001', '小型仪器', 124, '2025-03-07', NULL, 10000);

-- ----------------------------
-- Table structure for lab
-- ----------------------------
DROP TABLE IF EXISTS `lab`;
CREATE TABLE `lab`  (
  `lab_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `College_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `location` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `scale` int NULL DEFAULT NULL,
  PRIMARY KEY (`lab_id`) USING BTREE,
  INDEX `College_id`(`College_id` ASC) USING BTREE,
  CONSTRAINT `lab_ibfk_1` FOREIGN KEY (`College_id`) REFERENCES `college` (`College_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of lab
-- ----------------------------
INSERT INTO `lab` VALUES ('1-101', '0001', '化学院楼A101', 100);
INSERT INTO `lab` VALUES ('1-102', '0001', '化学院楼A102', 50);
INSERT INTO `lab` VALUES ('2-102', '0002', '生科院楼507', 138);
INSERT INTO `lab` VALUES ('4-101', '0004', '环境学院A101', 125);

-- ----------------------------
-- Table structure for personnel
-- ----------------------------
DROP TABLE IF EXISTS `personnel`;
CREATE TABLE `personnel`  (
  `personnel_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `lab_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `age` smallint NULL DEFAULT NULL,
  `entry_date` date NULL DEFAULT NULL,
  `training_status` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`personnel_id`) USING BTREE,
  INDEX `lab_id`(`lab_id` ASC) USING BTREE,
  CONSTRAINT `personnel_ibfk_1` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`lab_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of personnel
-- ----------------------------
INSERT INTO `personnel` VALUES ('010001', '李四', '1-102', 45, '2022-02-02', '已培训');
INSERT INTO `personnel` VALUES ('2200001', '张三', '1-101', 19, '2025-06-04', '已培训');
INSERT INTO `personnel` VALUES ('2211290', 'Kate', '4-101', 21, '2024-05-08', '未培训');
INSERT INTO `personnel` VALUES ('2211312', 'Retro', '4-101', 18, '2025-06-06', '已培训');

-- ----------------------------
-- Table structure for risk_record
-- ----------------------------
DROP TABLE IF EXISTS `risk_record`;
CREATE TABLE `risk_record`  (
  `happen_time` datetime NOT NULL,
  `lab_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `risk_level` smallint NULL DEFAULT NULL,
  PRIMARY KEY (`happen_time`) USING BTREE,
  INDEX `lab_id`(`lab_id` ASC) USING BTREE,
  CONSTRAINT `risk_record_ibfk_1` FOREIGN KEY (`lab_id`) REFERENCES `lab` (`lab_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of risk_record
-- ----------------------------
INSERT INTO `risk_record` VALUES ('2025-03-06 16:04:00', '1-101', 3);
INSERT INTO `risk_record` VALUES ('2025-04-17 16:04:00', '1-101', 3);
INSERT INTO `risk_record` VALUES ('2025-05-30 16:03:00', '1-101', 2);
INSERT INTO `risk_record` VALUES ('2025-06-03 16:07:00', '1-101', 3);
INSERT INTO `risk_record` VALUES ('2025-06-04 16:02:00', '1-101', 1);
INSERT INTO `risk_record` VALUES ('2025-06-04 16:03:00', '1-102', 2);
INSERT INTO `risk_record` VALUES ('2025-06-04 16:06:00', '1-101', 3);
INSERT INTO `risk_record` VALUES ('2025-06-04 16:09:00', '1-101', 3);

-- ----------------------------
-- Table structure for safety_officer
-- ----------------------------
DROP TABLE IF EXISTS `safety_officer`;
CREATE TABLE `safety_officer`  (
  `personnel_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `emergency_phone` varchar(11) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `research_money` int NULL DEFAULT NULL,
  `area` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`personnel_id`) USING BTREE,
  CONSTRAINT `safety_officer_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnel` (`personnel_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of safety_officer
-- ----------------------------

-- ----------------------------
-- Table structure for student
-- ----------------------------
DROP TABLE IF EXISTS `student`;
CREATE TABLE `student`  (
  `personnel_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `Direction` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`personnel_id`) USING BTREE,
  CONSTRAINT `student_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnel` (`personnel_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of student
-- ----------------------------
INSERT INTO `student` VALUES ('2200001', '纳米催化材料');
INSERT INTO `student` VALUES ('2211290', '定量分析');
INSERT INTO `student` VALUES ('2211312', '环境催化');

-- ----------------------------
-- Table structure for teacher
-- ----------------------------
DROP TABLE IF EXISTS `teacher`;
CREATE TABLE `teacher`  (
  `personnel_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `research_money` int NULL DEFAULT NULL,
  `area` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  PRIMARY KEY (`personnel_id`) USING BTREE,
  CONSTRAINT `teacher_ibfk_1` FOREIGN KEY (`personnel_id`) REFERENCES `personnel` (`personnel_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of teacher
-- ----------------------------
INSERT INTO `teacher` VALUES ('010001', '教授', 10000000, '水环境催化');

-- ----------------------------
-- Table structure for use_record
-- ----------------------------
DROP TABLE IF EXISTS `use_record`;
CREATE TABLE `use_record`  (
  `equip_id` varchar(10) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `personnel_id` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `start_time` datetime NULL DEFAULT NULL,
  `end_time` datetime NULL DEFAULT NULL,
  `cost` float NULL DEFAULT NULL,
  `equip_condition` varchar(40) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NULL DEFAULT NULL,
  `if_expired` tinyint(1) NULL DEFAULT NULL,
  PRIMARY KEY (`equip_id`, `personnel_id`) USING BTREE,
  INDEX `personnel_id`(`personnel_id` ASC) USING BTREE,
  CONSTRAINT `use_record_ibfk_1` FOREIGN KEY (`equip_id`) REFERENCES `equipment` (`equip_id`) ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT `use_record_ibfk_2` FOREIGN KEY (`personnel_id`) REFERENCES `personnel` (`personnel_id`) ON DELETE RESTRICT ON UPDATE RESTRICT
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of use_record
-- ----------------------------
INSERT INTO `use_record` VALUES ('B-1001', '2211312', '2025-06-05 15:04:00', '2025-06-07 15:04:00', NULL, '正常', 0);
INSERT INTO `use_record` VALUES ('C-1001', '2211312', '2025-06-07 00:13:00', '2025-06-08 00:13:00', NULL, '正常', 0);

-- ----------------------------
-- Table structure for user
-- ----------------------------
DROP TABLE IF EXISTS `user`;
CREATE TABLE `user`  (
  `username` varchar(20) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `password_hash` varchar(2048) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  PRIMARY KEY (`username`) USING BTREE
) ENGINE = InnoDB CHARACTER SET = utf8mb4 COLLATE = utf8mb4_0900_ai_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of user
-- ----------------------------
INSERT INTO `user` VALUES ('1', 'pbkdf2:sha256:1000000$XgPRDc8lb2idRYxE$d8948606e81b1b55dc150d7549ee166deb4859453e38a0d0475315facee68de1');
INSERT INTO `user` VALUES ('admin', 'pbkdf2:sha256:1000000$4nZ5JkaYJK9Kqs7M$7752b5ea87833ef23ee7d38cc116f32fde44299164859560fce7cb2401c17146');
INSERT INTO `user` VALUES ('user', 'pbkdf2:sha256:1000000$fZHyZqPS8WgGIdZr$16f7d048decca26860306e06a7dfbcf162a9c77d057d66e4aca9bfd0c2eecf43');

-- ----------------------------
-- View structure for v_consumable_status
-- ----------------------------
DROP VIEW IF EXISTS `v_consumable_status`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_consumable_status` AS select `c`.`consumable_id` AS `consumable_id`,`c`.`name` AS `name`,`c`.`storage` AS `storage`,`c`.`min_stock` AS `min_stock`,(case when (`c`.`storage` = 0) then '缺货' when (`c`.`storage` < `c`.`min_stock`) then '库存不足' else '正常' end) AS `stock_status`,(select count(0) from `consume` `co` where ((`co`.`consumable_id` = `c`.`consumable_id`) and (`co`.`personnel_id` is not null) and (`co`.`amount` > 0) and (`co`.`use_time` >= (curdate() - interval 30 day)) and exists(select 1 from `personnel` `p` where (`p`.`personnel_id` = `co`.`personnel_id`)) and (`co`.`consumable_id` = `c`.`consumable_id`))) AS `total_usage_count` from `consumable` `c`;

-- ----------------------------
-- View structure for v_high_risk_labs
-- ----------------------------
DROP VIEW IF EXISTS `v_high_risk_labs`;
CREATE ALGORITHM = UNDEFINED SQL SECURITY DEFINER VIEW `v_high_risk_labs` AS select `l`.`lab_id` AS `lab_id`,`l`.`location` AS `lab_name`,sum(`r`.`risk_level`) AS `total_risk_level`,`so`.`personnel_id` AS `officer_id`,`p`.`name` AS `officer_name` from (((`lab` `l` join `risk_record` `r` on((`l`.`lab_id` = `r`.`lab_id`))) left join (select `p`.`personnel_id` AS `personnel_id`,`p`.`name` AS `name`,`p`.`lab_id` AS `lab_id`,`p`.`age` AS `age`,`p`.`entry_date` AS `entry_date`,`p`.`training_status` AS `training_status` from (`personnel` `p` join `safety_officer` `so` on((`so`.`personnel_id` = `p`.`personnel_id`)))) `p` on((`p`.`lab_id` = `l`.`lab_id`))) left join `safety_officer` `so` on((`so`.`personnel_id` = `p`.`personnel_id`))) group by `l`.`lab_id`,`so`.`personnel_id`,`p`.`name` having (`total_risk_level` > 12);

-- ----------------------------
-- Procedure structure for add_consumption
-- ----------------------------
DROP PROCEDURE IF EXISTS `add_consumption`;
delimiter ;;
CREATE PROCEDURE `add_consumption`(IN p_personnel_id VARCHAR(20),
    IN p_consumable_id VARCHAR(10),
    IN p_amount INT,
    OUT p_result VARCHAR(100))
BEGIN
    DECLARE v_current_stock INT;
    DECLARE v_min_stock INT;
    DECLARE v_error_msg TEXT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
        ROLLBACK;
        SET p_result = CONCAT('Error: ', v_error_msg);
    END;
    
    START TRANSACTION;
    
    -- 获取当前库存信息
    SELECT storage, min_stock INTO v_current_stock, v_min_stock
    FROM Consumable 
    WHERE consumable_id = p_consumable_id FOR UPDATE;
    
    IF v_current_stock IS NULL THEN
        SET p_result = 'Error: 耗材不存在';
        ROLLBACK;
    ELSEIF v_current_stock - p_amount < v_min_stock THEN
        SET p_result = 'Error: 库存不足，不能消耗';
        ROLLBACK;
    ELSE
        -- 更新库存
        UPDATE Consumable 
        SET storage = storage - p_amount
        WHERE consumable_id = p_consumable_id;
        
        -- 添加消耗记录
        INSERT INTO Consume (personnel_id, consumable_id, amount)
        VALUES (p_personnel_id, p_consumable_id, p_amount);
        
        COMMIT;
        SET p_result = '耗材消耗记录插入成功';
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for add_usage_record
-- ----------------------------
DROP PROCEDURE IF EXISTS `add_usage_record`;
delimiter ;;
CREATE PROCEDURE `add_usage_record`(IN p_equip_id VARCHAR(10),
    IN p_personnel_id VARCHAR(20),
    IN p_start_time DATETIME,
    IN p_end_time DATETIME,
    IN p_condition VARCHAR(40),
    OUT p_result VARCHAR(100))
BEGIN
    DECLARE v_used_hours DECIMAL(10,2);
    DECLARE v_maintain_cycle INT;
    DECLARE v_current_used INT;
    DECLARE v_error_msg TEXT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
        ROLLBACK;
        SET p_result = CONCAT('Error: ', v_error_msg);
    END;
    
    START TRANSACTION;
    
    -- 检查设备是否存在
    SELECT used_age, maintain_cycle INTO v_current_used, v_maintain_cycle
    FROM Equipment WHERE equip_id = p_equip_id FOR UPDATE;
    
    IF v_maintain_cycle IS NULL THEN
        SET p_result = 'Error: 设备不存在';
        ROLLBACK;
    ELSE
        -- 计算使用时长（小时）
        SET v_used_hours = TIMESTAMPDIFF(SECOND, p_start_time, p_end_time) / 3600.0;
        
        -- 检查维护周期
        IF v_current_used + v_used_hours > v_maintain_cycle THEN
            SET p_result = 'Error: 超出设备维护周期';
            ROLLBACK;
        ELSE
            -- 检查时间冲突
            IF EXISTS (
                SELECT 1 FROM Use_record 
                WHERE equip_id = p_equip_id 
                AND (
                    (start_time BETWEEN p_start_time AND p_end_time) OR
                    (end_time BETWEEN p_start_time AND p_end_time) OR
                    (p_start_time BETWEEN start_time AND end_time)
                )
            ) THEN
                SET p_result = 'Error: 时间冲突';
                ROLLBACK;
            ELSE
                -- 更新设备使用时间
                UPDATE Equipment 
                SET used_age = used_age + v_used_hours
                WHERE equip_id = p_equip_id;
                
                -- 添加记录
                INSERT INTO Use_record (
                    equip_id, personnel_id, 
                    start_time, end_time, 
                    equip_condition
                ) VALUES (
                    p_equip_id, p_personnel_id,
                    p_start_time, p_end_time,
                    p_condition
                );
                
                SET p_result = 'Success: 使用记录已添加';
                COMMIT;
            END IF;
        END IF;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for update_consumption
-- ----------------------------
DROP PROCEDURE IF EXISTS `update_consumption`;
delimiter ;;
CREATE PROCEDURE `update_consumption`(IN p_personnel_id VARCHAR(20),
    IN p_consumable_id VARCHAR(10),
    IN p_old_amount INT,
    IN p_new_amount INT,
    OUT p_result VARCHAR(100))
BEGIN
    DECLARE v_current_stock INT;
    DECLARE v_error_msg TEXT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1 v_error_msg = MESSAGE_TEXT;
        ROLLBACK;
        SET p_result = CONCAT('Error: ', v_error_msg);
    END;
    
    START TRANSACTION;
    
    -- 1. 检查原记录是否存在
    IF NOT EXISTS (
        SELECT 1 FROM Consume 
        WHERE personnel_id = p_personnel_id 
        AND consumable_id = p_consumable_id
        AND amount = p_old_amount
    ) THEN
        SET p_result = 'Error: 原消耗记录不存在';
        ROLLBACK;
    ELSE
        -- 2. 获取当前库存
        SELECT storage INTO v_current_stock
        FROM Consumable 
        WHERE consumable_id = p_consumable_id FOR UPDATE;
        
        -- 3. 计算库存差值
        IF v_current_stock + p_old_amount - p_new_amount < 0 THEN
            SET p_result = 'Error: 库存不足';
            ROLLBACK;
        ELSE
            -- 4. 更新库存
            UPDATE Consumable 
            SET storage = storage + p_old_amount - p_new_amount
            WHERE consumable_id = p_consumable_id;
            
            -- 5. 更新消耗记录
            UPDATE Consume 
            SET amount = p_new_amount
            WHERE personnel_id = p_personnel_id 
            AND consumable_id = p_consumable_id;
            
            SET p_result = 'Success: 消耗记录和库存已同步更新';
            COMMIT;
        END IF;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Procedure structure for update_training_status_by_risk
-- ----------------------------
DROP PROCEDURE IF EXISTS `update_training_status_by_risk`;
delimiter ;;
CREATE PROCEDURE `update_training_status_by_risk`()
BEGIN
    UPDATE Personnel
    SET training_status = '未培训'
    WHERE lab_id IN (
        SELECT lab_id
        FROM Risk_Record
        GROUP BY lab_id
        HAVING SUM(risk_level) > 12
    );
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table consume
-- ----------------------------
DROP TRIGGER IF EXISTS `before_consume_insert`;
delimiter ;;
CREATE TRIGGER `before_consume_insert` BEFORE INSERT ON `consume` FOR EACH ROW BEGIN
    DECLARE v_current_stock INT;
    DECLARE v_min_stock INT;
    
    -- 获取当前库存信息
    SELECT storage, min_stock INTO v_current_stock, v_min_stock
    FROM Consumable 
    WHERE consumable_id = NEW.consumable_id FOR UPDATE;
    
    IF v_current_stock IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: 耗材不存在';
    ELSEIF v_current_stock - NEW.amount < v_min_stock THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Error: 库存不足，不能消耗';
    ELSE
        -- 更新库存
        UPDATE Consumable 
        SET storage = storage - NEW.amount
        WHERE consumable_id = NEW.consumable_id;
        
        -- 设置使用时间为当前时间（如果未提供）
        IF NEW.use_time IS NULL THEN
            SET NEW.use_time = NOW();
        END IF;
    END IF;
END
;;
delimiter ;

-- ----------------------------
-- Triggers structure for table use_record
-- ----------------------------
DROP TRIGGER IF EXISTS `before_usage_record_insert`;
delimiter ;;
CREATE TRIGGER `before_usage_record_insert` BEFORE INSERT ON `use_record` FOR EACH ROW BEGIN
    DECLARE v_maintain_cycle INT;
    DECLARE v_current_used DECIMAL(10,2);
    DECLARE v_used_hours DECIMAL(10,2);
    
    -- 1. 检查设备是否存在并获取维护信息
    SELECT maintain_cycle, used_age INTO v_maintain_cycle, v_current_used
    FROM Equipment 
    WHERE equip_id = NEW.equip_id
    FOR UPDATE; -- 加锁防止并发问题
    
    IF v_maintain_cycle IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '设备不存在';
    END IF;
    
    -- 2. 计算使用时长（小时）
    SET v_used_hours = TIMESTAMPDIFF(SECOND, NEW.start_time, NEW.end_time) / 3600.0;
    
    -- 3. 检查维护周期
    IF v_current_used + v_used_hours > v_maintain_cycle THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '超出设备维护周期';
    END IF;
    
    -- 4. 检查时间冲突
    IF EXISTS (
        SELECT 1 FROM Use_record 
        WHERE equip_id = NEW.equip_id 
        AND (
            (start_time BETWEEN NEW.start_time AND NEW.end_time) OR
            (end_time BETWEEN NEW.start_time AND NEW.end_time) OR
            (NEW.start_time BETWEEN start_time AND end_time)
        )
    ) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '时间冲突：该时间段已有使用记录';
    END IF;
    
    -- 5. 直接在插入前更新设备使用时间
    UPDATE Equipment 
    SET used_age = used_age + v_used_hours
    WHERE equip_id = NEW.equip_id;
    
    -- 6. 可以在这里设置记录的cost等计算字段（如果需要）
    -- SET NEW.cost = v_used_hours * hourly_rate;
    
    -- 7. 检查是否需要维护通知（可选）
    IF v_current_used + v_used_hours > v_maintain_cycle * 0.9 THEN
        SET NEW.equip_condition = '即将需要维护';
    END IF;
END
;;
delimiter ;

SET FOREIGN_KEY_CHECKS = 1;
