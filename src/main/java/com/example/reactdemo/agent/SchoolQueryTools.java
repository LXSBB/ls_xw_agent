package com.example.reactdemo.agent;

import com.example.reactdemo.school.ClassManagementClient.Result;
import com.example.reactdemo.school.SchoolQueryClient;
import com.example.reactdemo.school.SchoolQueryModels.*;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

/** 课表、课时和任务只读工具；所有查询固定使用本机当前账号与机构，没有跨校区参数。 */
@Component
public class SchoolQueryTools {
    private final SchoolQueryClient client;

    public SchoolQueryTools(SchoolQueryClient client) { this.client = client; }

    @Tool(description = "按姓名或账号查找当前机构可见的教师/教务人员，取得真实教师ID。重名需让用户选择；不能猜测ID。")
    public Result<Page<Person>> findTeachers(
            @ToolParam(description = "教师姓名或账号关键词；不筛选可省略", required = false) String keyword,
            @ToolParam(description = "页码，从1开始，默认1", required = false) Integer page) {
        return client.findTeachers(keyword, page == null ? 1 : page);
    }

    @Tool(description = "按姓名或账号查询当前机构正式学员及剩余、已购、已消耗、超上课时，同时取得真实学员ID。"
            + "重名时先选择。单位课时与天分开；缺失字段为未知，空列表才是无记录；每页20人，不得将当前页人数当总数。")
    public Result<Page<StudentHours>> findStudentHours(
            @ToolParam(description = "学员姓名或账号关键词", required = false) String keyword,
            @ToolParam(description = "页码，从1开始，默认1", required = false) Integer page) {
        return client.findStudentHours(keyword, page == null ? 1 : page);
    }

    @Tool(description = "查询当前机构课表。支持本人、指定教师、指定班级、当前校区账号可见课表。"
            + "先用findTeachers或findClasses解析名称，重名先澄清。按课节每页20条，日期范围最多31天。跨校区暂不支持。")
    public Result<Timetable> getTimetable(
            @ToolParam(description = "MINE=本人，TEACHER=指定教师，CLASS=指定班级，CAMPUS=当前校区可见课表") TimetableScope scope,
            @ToolParam(description = "仅TEACHER填写真实教师ID；其他范围省略", required = false) String teacherId,
            @ToolParam(description = "仅CLASS填写真实班级ID；其他范围省略", required = false) String classId,
            @ToolParam(description = "开始日期yyyy-MM-dd；用户未说日期时使用当前日期，并在回答说明") String startDate,
            @ToolParam(description = "结束日期yyyy-MM-dd，包含当天") String endDate,
            @ToolParam(description = "页码，默认1", required = false) Integer page) {
        return client.getTimetable(scope, teacherId, classId, startDate, endDate, page == null ? 1 : page);
    }

    @Tool(description = "查询指定学员的课时消耗明细。先用findStudentHours确定学员ID；起止日期最多31天。"
            + "返回分页，不得把本页相加当总消耗。结课记录可能同时含classPeriods和days，应分别展示，不能与quantity重复累加。")
    public Result<Page<Consumption>> getConsumption(
            @ToolParam(description = "真实学员ID") String studentId,
            @ToolParam(description = "真实课程ID；不限定课程可省略", required = false) String courseId,
            @ToolParam(description = "开始日期yyyy-MM-dd；未指定时先询问查询期间") String startDate,
            @ToolParam(description = "结束日期yyyy-MM-dd，包含当天") String endDate,
            @ToolParam(description = "页码，默认1", required = false) Integer page) {
        return client.getConsumption(studentId, courseId, startDate, endDate, page == null ? 1 : page);
    }

    @Tool(description = "查询当前账号及关联班级发布的任务，支持名称、班级、类型和日期筛选。返回分发对象和代码计算的人数完成率。"
            + "个人发布对象不能说成向整个班级发布。needsClassProgress=true时人数完成率不适用该班级，应调用getTaskProgress。"
            + "同名任务需按ID和日期选择；分页结果不代表全部，不得平均各任务完成率。")
    public Result<Page<Task>> findTasks(
            @ToolParam(description = "任务名称关键词", required = false) String keyword,
            @ToolParam(description = "班级ID，先通过findClasses查询；不筛选可省略", required = false) String groupId,
            @ToolParam(description = "ALL全部、PLAN课堂、SERIAL打卡；默认ALL", required = false) TaskKind kind,
            @ToolParam(description = "任务开始日期筛选yyyy-MM-dd，与endDate同时给出；不限定可省略", required = false) String startDate,
            @ToolParam(description = "任务结束日期筛选yyyy-MM-dd；日期范围最多31天", required = false) String endDate,
            @ToolParam(description = "页码，默认1", required = false) Integer page) {
        return client.findTasks(keyword, groupId, kind, startDate, endDate, page == null ? 1 : page);
    }

    @Tool(description = "查询任务完成明细。shareId取findTasks返回的id，不是模板workcellId。"
            + "指定groupId时查询该班级的任务项进度；省略时查询整个任务的子任务进度。"
            + "students是分页明细；班级最多汇总100人，超出或未完整取得时completion仅表示当前页，必须保留scope。"
            + "人数、任务项、子任务完成率不同，必须说明basis与scope。"
            + "percent=null表示无法计算，不得说成0%。")
    public Result<TaskProgress> getTaskProgress(
            @ToolParam(description = "真实已发布任务ID，即shareId") String shareId,
            @ToolParam(description = "指定班级ID；查询整个任务时省略", required = false) String groupId,
            @ToolParam(description = "只查某一天时填yyyy-MM-dd；查询整个任务期间时省略", required = false) String date,
            @ToolParam(description = "学员明细页码，默认1", required = false) Integer page) {
        return client.getTaskProgress(shareId, groupId, date, page == null ? 1 : page);
    }
}
