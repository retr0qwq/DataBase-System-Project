/*==============================================================*/
/* DBMS name:      MySQL 5.0                                    */
/* Created on:     2025/5/29 15:10:47                           */
/*==============================================================*/


drop table if exists College;

drop table if exists Consumable;

drop table if exists Lab;

drop table if exists Personnel;

drop table if exists Risk_Record;

drop table if exists Safety_Officer;

drop table if exists Student;

drop table if exists Teacher;

drop table if exists Use_record;

drop table if exists consume;

drop table if exists equipment;

/*==============================================================*/
/* Table: College                                               */
/*==============================================================*/
create table College
(
   College_id           char(10) not null,
   College_name         varchar(100) not null,
   phone                char(11),
   dean                 varchar(20),
   primary key (College_id)
);

/*==============================================================*/
/* Table: Consumable                                            */
/*==============================================================*/
create table Consumable
(
   consumable_id        char(10) not null,
   name                 varchar(100),
   storage              int,
   min_stock            int,
   update_date          int,
   primary key (consumable_id)
);

/*==============================================================*/
/* Table: Lab                                                   */
/*==============================================================*/
create table Lab
(
   lab_id               char(10) not null,
   College_id           char(10),
   location             varchar(100),
   scale                int,
   primary key (lab_id)
);

/*==============================================================*/
/* Table: Personnel                                             */
/*==============================================================*/
create table Personnel
(
   age                  smallint,
   personnel_id         varchar(20) not null,
   lab_id               char(10),
   entry_date           date,
   training_status      smallint,
   primary key (personnel_id)
);

/*==============================================================*/
/* Table: Risk_Record                                           */
/*==============================================================*/
create table Risk_Record
(
   happen_time          timestamp not null,
   lab_id               char(10),
   risk_level           smallint,
   primary key (happen_time)
);

/*==============================================================*/
/* Table: Safety_Officer                                        */
/*==============================================================*/
create table Safety_Officer
(
   personnel_id         varchar(20) not null,
   emergency_phone      char(11),
   age                  smallint,
   entry_date           date,
   training_status      smallint,
   title                varchar(100),
   research_money       int,
   area                 varchar(100),
   primary key (personnel_id)
);

/*==============================================================*/
/* Table: Student                                               */
/*==============================================================*/
create table Student
(
   personnel_id         varchar(20) not null,
   age                  smallint,
   entry_date           date,
   training_status      smallint,
   Direction            varchar(100),
   primary key (personnel_id)
);

/*==============================================================*/
/* Table: Teacher                                               */
/*==============================================================*/
create table Teacher
(
   personnel_id         varchar(20) not null,
   age                  smallint,
   entry_date           date,
   training_status      smallint,
   title                varchar(100),
   research_money       int,
   area                 varchar(100),
   primary key (personnel_id)
);

/*==============================================================*/
/* Table: Use_record                                            */
/*==============================================================*/
create table Use_record
(
   equip_id             char(10) not null,
   personnel_id         varchar(20) not null,
   start_time           datetime,
   end_time             datetime,
   cost                 double,
   equip_condition      varchar(40),
   if_expired           bool,
   primary key (equip_id, personnel_id)
);

/*==============================================================*/
/* Table: consume                                               */
/*==============================================================*/
create table consume
(
   personnel_id         varchar(20) not null,
   consumable_id        char(10) not null,
   primary key (personnel_id, consumable_id)
);

/*==============================================================*/
/* Table: equipment                                             */
/*==============================================================*/
create table equipment
(
   equip_id             char(10) not null,
   type                 char(10),
   used_age             char(10),
   purchase_date        char(10),
   if_booked            smallint,
   Attribute_17         int,
   primary key (equip_id)
);

alter table Lab add constraint FK_in foreign key (College_id)
      references College (College_id) on delete restrict on update restrict;

alter table Personnel add constraint FK_Relationship_2 foreign key (lab_id)
      references Lab (lab_id) on delete restrict on update restrict;

alter table Risk_Record add constraint FK_make foreign key (lab_id)
      references Lab (lab_id) on delete restrict on update restrict;

alter table Safety_Officer add constraint FK_isa3 foreign key (personnel_id)
      references Teacher (personnel_id) on delete restrict on update restrict;

alter table Student add constraint FK_isa foreign key (personnel_id)
      references Personnel (personnel_id) on delete restrict on update restrict;

alter table Teacher add constraint FK_isa2 foreign key (personnel_id)
      references Personnel (personnel_id) on delete restrict on update restrict;

alter table Use_record add constraint FK_Relationship_10 foreign key (personnel_id)
      references Personnel (personnel_id) on delete restrict on update restrict;

alter table Use_record add constraint FK_Relationship_9 foreign key (equip_id)
      references equipment (equip_id) on delete restrict on update restrict;

alter table consume add constraint FK_use foreign key (personnel_id)
      references Personnel (personnel_id) on delete restrict on update restrict;

alter table consume add constraint FK_use2 foreign key (consumable_id)
      references Consumable (consumable_id) on delete restrict on update restrict;

