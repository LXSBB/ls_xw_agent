package com.example.reactdemo.school;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;
import java.util.function.Supplier;

import com.example.reactdemo.school.ClassManagementClient.Result;
import com.example.reactdemo.school.SchoolQueryModels.*;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;

/** 当前机构的只读校务适配；固定服务端身份，边界校验、分页、数字计算和字段裁剪均在代码中完成。 */
@Service
public class SchoolQueryClient {
    private static final int PAGE_SIZE = 20;
    private final ClassManagementProperties properties;
    private final RestClient client;

    public SchoolQueryClient(ClassManagementProperties properties, RestClient.Builder builder) {
        this.properties = properties;
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(20000);
        this.client = builder.baseUrl(properties.socialBaseUrl()).requestFactory(factory)
                .defaultHeaders(headers -> {
                    properties.headers().forEach((key, value) -> {
                        if (StringUtils.hasText(value)) headers.set(key, value);
                    });
                    headers.set("token", properties.token());
                    headers.set("InstId", properties.instId());
                    headers.set("serverId", properties.serverId());
                    headers.setContentType(MediaType.APPLICATION_JSON);
                }).build();
    }

    public Result<Page<Person>> findTeachers(String keyword, int page) {
        return query(() -> {
            var params = pageParams(page);
            params.put("search", keyword(keyword));
            params.put("activeType", "all");
            var institution = request("/institution/Id/" + id(properties.instId()), Map.of(), null).path("institution");
            String groupId = id(text(institution, "groupId"));
            var body = request("/group/GetUsers/" + groupId + "/noSaleAndStudent", params, null);
            var people = new ArrayList<Person>();
            for (var user : array(body, "users", true)) people.add(person(user));
            return page(page, people, count(body, "total"), "当前机构账号可见的教师及教务人员");
        });
    }

    public Result<Page<StudentHours>> findStudentHours(String keyword, int page) {
        return query(() -> {
            var args = pageParams(page);
            args.put("search", keyword(keyword));
            args.put("distributionClass", "allInClass");
            args.put("userType", "official");
            args.put("queryAccountType", "all");
            args.put("courseGoodsType", "all");
            var body = request("/user/student/record/list", Map.of(), Map.of("StudentsSearchArgu", args));
            var students = new ArrayList<StudentHours>();
            for (var user : array(body, "users", true)) {
                var groups = new ArrayList<Group>();
                for (var group : array(user.path("userGroup"), "groups", false)) {
                    groups.add(new Group(text(group, "id"), text(group, "title")));
                }
                students.add(new StudentHours(person(user), List.copyOf(groups), periods(user, "totalNumberList"),
                        periods(user, "consumeNumberList"), periods(user, "residueNumberList"),
                        periods(user, "exceedNumberList")));
            }
            return page(page, students, count(body, "total"), "当前机构可见的正式学员；课时与天数分别列示");
        });
    }

    public Result<Timetable> getTimetable(TimetableScope scope, String teacherId, String classId,
                                         String startDate, String endDate, int page) {
        return query(() -> {
            int offset = offset(page);
            dates(startDate, endDate);
            if (scope == null) throw invalid("请明确查询自己的、指定教师的、班级的或当前校区可见的课表。");
            String teacher = switch (scope) {
                case MINE -> id(properties.userId());
                case TEACHER -> id(teacherId);
                default -> "";
            };
            String group = scope == TimetableScope.CLASS ? id(classId) : "";
            if (scope != TimetableScope.TEACHER && StringUtils.hasText(teacherId)
                    || scope != TimetableScope.CLASS && StringUtils.hasText(classId)) {
                throw invalid("课表范围与教师或班级筛选不一致，请分别查询。");
            }
            var args = new LinkedHashMap<String, Object>();
            args.put("courseId", ""); args.put("lectureType", "all");
            args.put("classId", group); args.put("globalClassroomId", ""); args.put("teacherId", teacher);
            args.put("tabType", "time"); args.put("dateType", "day");
            args.put("startDate", startDate); args.put("endDate", endDate);
            // 与 App 日课表一致，0/0 查询日期范围；按课节在本地分页，避免日期分组被误当作课节分页。
            args.put("startPos", 0); args.put("endPos", 0); args.put("searchCourseSourceType", "all");
            var body = request("/course/lecture/list", Map.of(), Map.of("LectureListArgu", args));
            var lessons = new ArrayList<Lesson>();
            for (var day : array(body, "dateLists", true)) {
                for (var lesson : array(day, "list", true)) {
                    String instId = text(lesson, "instId");
                    if (!instId.isEmpty() && !instId.equals(properties.instId())) {
                        throw new QueryFailure("SCOPE_MISMATCH", "", "课表返回了当前机构以外的数据，已停止展示。");
                    }
                    lessons.add(new Lesson(text(lesson, "id"), text(day, "date"), text(lesson, "startTime"),
                            text(lesson, "endTime"), text(lesson, "title"), text(lesson, "courseId"),
                            text(lesson, "courseTitle"), text(lesson, "groupId"), text(lesson, "groupName"),
                            optionalPerson(lesson.path("teacher")), text(lesson, "lectureStatus"), number(lesson, "classPeriod")));
                }
            }
            lessons.sort(java.util.Comparator.comparing(Lesson::date).thenComparing(Lesson::startTime));
            var items = List.copyOf(lessons.subList(Math.min(offset, lessons.size()), Math.min(offset + PAGE_SIZE, lessons.size())));
            var result = new Page<>(page, PAGE_SIZE, offset + items.size() < lessons.size(), (long) lessons.size(),
                    "当前机构、当前账号可见范围；未授权范围不在结果内", items);
            return new Timetable(scope, startDate, endDate, count(body, "lessonTotal"), result);
        });
    }

    public Result<Page<Consumption>> getConsumption(String studentId, String courseId,
                                                   String startDate, String endDate, int page) {
        return query(() -> {
            var params = pageParams(page);
            params.put("userId", id(studentId));
            dates(startDate, endDate);
            params.put("consumeStartDate", startDate); params.put("consumeEndDate", endDate);
            if (StringUtils.hasText(courseId)) params.put("courseId", id(courseId));
            var body = request("/course/consume", params, null);
            var records = new ArrayList<Consumption>();
            for (var item : array(body, "courseConsumptionList", true)) {
                records.add(new Consumption(text(item, "recordId"), text(item, "consumeDateTime"),
                        text(item, "userId"), text(item, "nickname"), text(item, "courseId"), text(item, "courseName"),
                        text(item, "teacherName"), text(item, "consumeSourceType"), text(item, "consumeType"),
                        unit(text(item, "consumeType")), number(item, "consumeNum"),
                        number(item, "classPeriod"), number(item, "duration")));
            }
            return page(page, records, count(body, "totalRecord"), "指定学员的课消明细；本页不代表全部，课时与天数不混加");
        });
    }

    public Result<Page<Task>> findTasks(String keyword, String groupId, TaskKind kind,
                                        String startDate, String endDate, int page) {
        return query(() -> {
            var params = pageParams(page);
            params.put("searchKey", keyword(keyword));
            params.put("workcellDoneStatus", "all"); params.put("queryScope", "sameClass");
            // 当前接口不接受 workcellType=all；不传类型才查询全部。
            if (kind != null && kind != TaskKind.ALL) params.put("workcellType", kind.name().toLowerCase(Locale.ROOT));
            String group = StringUtils.hasText(groupId) ? id(groupId) : "";
            if (!group.isEmpty()) params.put("groupId", group);
            if (StringUtils.hasText(startDate) || StringUtils.hasText(endDate)) {
                dates(startDate, endDate);
                params.put("taskStartDate", startDate); params.put("taskEndDate", endDate);
            }
            var body = request("/share/PublishedAssignmentsV2/Inst/User/" + id(properties.userId()), params, null);
            var tasks = new ArrayList<Task>();
            for (var task : array(body, "shares", true)) {
                var targets = recipients(task);
                boolean singleClass = !group.isEmpty() && !targets.isEmpty()
                        && targets.stream().allMatch(target -> "CLASS".equals(target.kind()) && group.equals(target.id()));
                boolean needsClassProgress = !group.isEmpty() && !singleClass;
                BigDecimal done = number(task, "completedNum"), undone = number(task, "undoneNum");
                Completion completion = needsClassProgress ? null : completion("人数", singleClass ? "该班级的任务接收者" : "该任务全部接收者",
                        done, done == null || undone == null ? null : done.add(undone));
                tasks.add(new Task(text(task, "id"), text(task, "title"), text(task, "workcellType"),
                        text(task, "workcellStatus"), text(task, "startDateTime"), text(task, "endDateTime"),
                        targets, completion, needsClassProgress));
            }
            return page(page, tasks, null, group.isEmpty() ? "当前账号及关联班级发布的任务，不代表全校所有任务"
                    : "指定班级任务；needsClassProgress=true 时须查询该班级的任务项进度，不能使用全任务人数");
        });
    }

    public Result<TaskProgress> getTaskProgress(String shareId, String groupId, String date, int page) {
        return query(() -> {
            String share = id(shareId);
            String group = StringUtils.hasText(groupId) ? id(groupId) : "";
            if (StringUtils.hasText(date)) dates(date, date);
            var params = pageParams(page);
            var students = new ArrayList<StudentProgress>();
            JsonNode body;
            Completion total;
            Long studentCount;
            if (!group.isEmpty()) {
                params.put("teamId", group); params.put("teamType", "group");
                if (StringUtils.hasText(date)) params.put("date", date);
                body = request("/assignment/ShareV2/" + share, params, null);
                studentCount = count(body, "total");
                var assignments = array(body, "assignments", true);
                for (var item : assignments) {
                    var user = item.path("toUser");
                    students.add(new StudentProgress(text(user, "userId"), name(user), text(item, "taskStatus"),
                            completion("任务项", "该学员", number(item, "done"), number(item, "total"))));
                }
                // 实际接口的汇总字段可能为0而明细非0；以已核对的学员 done/total 计算。
                // 最多读取100名接收者，超过时明确只返回本页进度，避免无上限拉取。
                var all = new ArrayList<>(assignments);
                boolean complete = studentCount != null && studentCount <= 100;
                if (complete) {
                    int pages = (int) ((studentCount + PAGE_SIZE - 1) / PAGE_SIZE);
                    for (int next = 1; next <= pages; next++) {
                        if (next == page) continue;
                        params.putAll(pageParams(next));
                        var other = request("/assignment/ShareV2/" + share, params, null);
                        if (!studentCount.equals(count(other, "total"))) {
                            throw malformed("查询期间任务接收人数发生变化，请重新查询");
                        }
                        all.addAll(array(other, "assignments", true));
                    }
                    complete = all.size() == studentCount;
                    if (complete && all.stream().map(item -> text(item.path("toUser"), "userId"))
                            .filter(StringUtils::hasText).distinct().count() != all.size()) {
                        throw malformed("任务接收者明细存在重复或缺少用户ID");
                    }
                }
                List<JsonNode> source = complete ? all : assignments;
                BigDecimal done = BigDecimal.ZERO, expected = BigDecimal.ZERO;
                for (var item : source) {
                    BigDecimal itemDone = number(item, "done"), itemTotal = number(item, "total");
                    if (itemDone == null || itemTotal == null) { done = null; expected = null; break; }
                    done = done.add(itemDone); expected = expected.add(itemTotal);
                }
                total = completion("任务项", complete ? "指定班级的全部任务接收者"
                        : "仅当前页学员，未覆盖全班；不得描述为班级整体完成率", done, expected);
            } else {
                if (StringUtils.hasText(date)) { params.put("startDate", date); params.put("endDate", date); }
                body = request("/assignment/Inst/Share/assignmentReport/" + share + "/report", params, null);
                total = completion("子任务", "该任务全部接收者", number(body, "shareTotalSubTaskDoneCount"),
                        number(body, "shareTotalSubTaskCount"));
                studentCount = count(body, "userAssignmentReportSize");
                for (var user : array(body, "userAssignmentReports", true)) {
                    students.add(new StudentProgress(text(user, "userId"), name(user), "",
                            completion("子任务", "该学员", number(user, "userTotalSubTaskDoneCount"),
                                    number(user, "userTotalSubTaskCount"))));
                }
            }
            return new TaskProgress(share, group, date == null ? "" : date, total,
                    page(page, students, studentCount, group.isEmpty() ? "全部任务接收者" : "指定班级的任务接收者"));
        });
    }

    private JsonNode request(String path, Map<String, Object> params, Object payload) {
        if (!StringUtils.hasText(properties.token()) || !StringUtils.hasText(properties.instId())
                || !StringUtils.hasText(properties.serverId())) {
            throw new QueryFailure("NOT_CONFIGURED", "", "请在本机配置登录凭证和机构上下文。");
        }
        var spec = payload == null ? client.get() : client.post();
        var request = spec.uri(uri -> {
            uri.path(path);
            var variables = new LinkedHashMap<String, Object>();
            params.forEach((key, value) -> { uri.queryParam(key, "{" + key + "}"); variables.put(key, value); });
            return uri.build(variables);
        }).header("RequestUniqueId", UUID.randomUUID().toString());
        JsonNode body = payload == null ? request.retrieve().body(JsonNode.class)
                : ((RestClient.RequestBodySpec) request).body(payload).retrieve().body(JsonNode.class);
        if (body == null || !body.isObject() || text(body, "code").isEmpty()) throw malformed("接口缺少业务状态码");
        String code = text(body, "code");
        if ("0".equals(code) || "200".equals(code)) return body;
        if ("-1001".equals(code) || "-5104".equals(code)
                || "-2".equals(code) && "无效Token".equalsIgnoreCase(text(body, "message"))) {
            throw new QueryFailure("AUTH_REQUIRED", code, "登录失效，请更新本机登录配置后重启服务。");
        }
        throw new QueryFailure("BUSINESS_ERROR", code, "查询接口返回业务错误，不能据此判断没有数据。");
    }

    private static <T> Result<T> query(Supplier<T> work) {
        try {
            return new Result<>("SUCCESS", "0", "查询成功。请按返回范围、单位和分页信息回答；缺失数字不等于零。", work.get());
        } catch (QueryFailure e) {
            return new Result<>(e.status, e.code, e.getMessage(), null);
        } catch (RestClientResponseException e) {
            int code = e.getStatusCode().value();
            return new Result<>(code == 401 || code == 403 ? "ACCESS_DENIED" : "HTTP_ERROR", String.valueOf(code),
                    "查询未成功，请核对登录状态及接口权限；不能解释为没有数据。", null);
        } catch (RestClientException e) {
            return new Result<>("QUERY_FAILED", "", "查询未取得有效响应，不能解释为没有数据。", null);
        }
    }

    private static Map<String, Object> pageParams(int page) {
        int start = offset(page);
        var params = new LinkedHashMap<String, Object>();
        params.put("startPos", start); params.put("endPos", start + PAGE_SIZE - 1);
        return params;
    }

    private static int offset(int page) {
        if (page < 1 || page > Integer.MAX_VALUE / PAGE_SIZE) throw invalid("页码必须是有效正整数。");
        return (page - 1) * PAGE_SIZE;
    }

    private static <T> Page<T> page(int page, List<T> items, Long total, String scope) {
        boolean more = total == null ? items.size() == PAGE_SIZE : (long) offset(page) + items.size() < total;
        return new Page<>(page, PAGE_SIZE, more, total, scope, List.copyOf(items));
    }

    private static String id(String value) {
        if (value == null || !value.matches("[0-9]{1,20}") || value.chars().allMatch(c -> c == '0')) {
            throw invalid("请先查询并选择真实的对象 ID，不能用名称或猜测的 ID 调用接口。");
        }
        return value;
    }

    private static String keyword(String value) {
        String result = value == null ? "" : value.trim();
        if (result.length() > 100) throw invalid("搜索关键词最多 100 个字符。");
        return result;
    }

    private static void dates(String start, String end) {
        if (start == null || end == null || !start.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}")
                || !end.matches("[0-9]{4}-[0-9]{2}-[0-9]{2}")) throw invalid("请提供 yyyy-MM-dd 格式的起止日期。");
        try {
            long days = ChronoUnit.DAYS.between(LocalDate.parse(start), LocalDate.parse(end));
            if (days < 0 || days > 30) throw invalid("日期范围必须顺序正确，且一次最多查询 31 天。");
        } catch (java.time.format.DateTimeParseException | NullPointerException e) {
            throw invalid("请提供 yyyy-MM-dd 格式的起止日期。");
        }
    }

    private static List<JsonNode> array(JsonNode node, String field, boolean required) {
        var value = node.path(field);
        if (value.isMissingNode() || value.isNull()) {
            if (required) throw malformed("接口缺少 " + field + " 列表");
            return List.of();
        }
        if (!value.isArray()) throw malformed(field + " 不是列表");
        var items = new ArrayList<JsonNode>();
        for (var item : value) {
            if (!item.isObject()) throw malformed(field + " 包含无效对象");
            items.add(item);
        }
        return items;
    }

    private static BigDecimal number(JsonNode node, String field) {
        String value = text(node, field);
        if (value.isBlank()) return null;
        try { return new BigDecimal(value); }
        catch (NumberFormatException e) { throw malformed(field + " 不是有效数字"); }
    }

    private static Long count(JsonNode node, String field) {
        BigDecimal value = number(node, field);
        if (value == null) return null;
        try {
            long count = value.longValueExact();
            if (count < 0) throw malformed(field + " 不能为负数");
            return count;
        } catch (ArithmeticException e) { throw malformed(field + " 不是有效计数"); }
    }

    private static Completion completion(String basis, String scope, BigDecimal done, BigDecimal total) {
        if (done == null || total == null) return new Completion(basis, scope, done, total, null);
        if (done.signum() < 0 || total.signum() < 0 || done.compareTo(total) > 0) throw malformed("完成数量与总量不一致");
        BigDecimal percent = total.signum() == 0 ? null
                : done.multiply(BigDecimal.valueOf(100)).divide(total, 2, RoundingMode.HALF_UP);
        // 不让四舍五入把未全部完成显示成100%，或把已有完成显示成0%。
        if (percent != null && done.signum() > 0 && done.compareTo(total) < 0) {
            percent = percent.max(new BigDecimal("0.01")).min(new BigDecimal("99.99"));
        }
        return new Completion(basis, scope, done, total, percent);
    }

    private static Person person(JsonNode user) {
        if (text(user, "userId").isEmpty()) throw malformed("用户缺少 ID");
        return new Person(text(user, "userId"), name(user), text(user, "username"), text(user, "role"));
    }

    private static Person optionalPerson(JsonNode node) { return node.isObject() ? person(node) : null; }

    private static String name(JsonNode node) {
        for (String field : List.of("nicknameNote", "nickname", "username", "userName")) {
            if (!text(node, field).isBlank()) return text(node, field);
        }
        return "";
    }

    private static List<Period> periods(JsonNode user, String field) {
        // 列表缺失意味着未知；空列表才表示接口明确没有该类记录。
        if (user.path(field).isMissingNode() || user.path(field).isNull()) return null;
        return array(user, field, true).stream().map(item -> new Period(text(item, "courseId"),
                text(item, "courseTitle"), unit(text(item, "periodType")), number(item, "periodNumber"))).toList();
    }

    private static String unit(String type) {
        return switch (type) { case "ordinary" -> "课时"; case "day" -> "天"; default -> "未知单位"; };
    }

    private static List<Recipient> recipients(JsonNode task) {
        var recipients = new ArrayList<Recipient>();
        for (var item : array(task, "workcellShareUsers", false)) {
            String group = "group".equals(text(item, "teamType")) ? text(item, "teamId") : "";
            if ("personal".equals(text(item, "personalType"))) {
                recipients.add(new Recipient("STUDENT", text(item, "userId"), name(item.path("user")),
                        group, group.isEmpty() ? "" : text(item, "teamName")));
            } else if ("nonPersonal".equals(text(item, "personalType"))) {
                recipients.add(new Recipient(group.isEmpty() ? "DEPARTMENT" : "CLASS", text(item, "teamId"),
                        text(item, "teamName"), group, group.isEmpty() ? "" : text(item, "teamName")));
            } else {
                recipients.add(new Recipient("UNKNOWN", text(item, "teamId"), text(item, "teamName"), group, ""));
            }
        }
        return List.copyOf(recipients);
    }

    private static String text(JsonNode node, String field) { return node.path(field).asText(""); }
    private static QueryFailure invalid(String message) { return new QueryFailure("INVALID_ARGUMENT", "", message); }
    private static QueryFailure malformed(String message) { return new QueryFailure("INVALID_RESPONSE", "", message + "，不能当作空数据。"); }

    private static final class QueryFailure extends RuntimeException {
        private final String status;
        private final String code;
        private QueryFailure(String status, String code, String message) {
            super(message); this.status = status; this.code = code;
        }
    }
}
