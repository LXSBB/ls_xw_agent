package com.example.reactdemo.school;

import java.math.BigDecimal;
import java.util.List;

/** 查询返回白名单：只保留回答所需字段，不传递联系方式、地址、凭证和完整业务对象。 */
public final class SchoolQueryModels {
    private SchoolQueryModels() { }

    public enum TimetableScope { MINE, TEACHER, CLASS, CAMPUS }
    public enum TaskKind { ALL, PLAN, SERIAL }

    public record Page<T>(int page, int pageSize, boolean mayHaveMore, Long total, String scope, List<T> items) { }
    public record Person(String id, String name, String account, String role) { }
    public record Group(String id, String name) { }
    public record Period(String courseId, String courseName, String unit, BigDecimal quantity) { }
    public record StudentHours(Person student, List<Group> groups, List<Period> purchased,
                               List<Period> consumed, List<Period> remaining, List<Period> exceeded) { }
    public record Lesson(String id, String date, String startTime, String endTime, String title,
                         String courseId, String courseName, String groupId, String groupName,
                         Person teacher, String status, BigDecimal periods) { }
    public record Timetable(TimetableScope scope, String startDate, String endDate, Long reportedLessonTotal,
                            Page<Lesson> lessons) { }
    public record Consumption(String id, String dateTime, String studentId, String studentName,
                              String courseId, String courseName, String teacherName, String source,
                              String type, String unit, BigDecimal quantity, BigDecimal classPeriods,
                              BigDecimal days) { }
    public record Recipient(String kind, String id, String name, String groupId, String groupName) { }
    public record Completion(String basis, String scope, BigDecimal completed, BigDecimal total,
                             BigDecimal percent) { }
    public record Task(String id, String title, String kind, String status, String startDate, String endDate,
                       List<Recipient> recipients, Completion peopleCompletion, boolean needsClassProgress) { }
    public record StudentProgress(String studentId, String name, String status, Completion completion) { }
    public record TaskProgress(String shareId, String groupId, String date, Completion completion,
                               Page<StudentProgress> students) { }
}
