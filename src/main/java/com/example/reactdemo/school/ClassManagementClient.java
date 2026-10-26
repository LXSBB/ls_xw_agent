package com.example.reactdemo.school;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.util.UriBuilder;
import tools.jackson.databind.JsonNode;

/** Social 班级 API 适配：统一鉴权和业务码，仅向工具返回必要的班级字段。 */
@Service
@EnableConfigurationProperties(ClassManagementProperties.class)
public class ClassManagementClient {

    private static final int PAGE_SIZE = 20;
    private final ClassManagementProperties properties;
    private final RestClient client;
    private final AtomicLong serial = new AtomicLong();

    public ClassManagementClient(ClassManagementProperties properties, RestClient.Builder builder) {
        this.properties = properties;
        var factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(15000);
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

    public enum Scope { MINE, ALL }

    public record Result<T>(String status, String code, String message, T data) {
        public boolean successful() { return "SUCCESS".equals(status); }
    }

    public record Course(String id, String title) { }

    public record ClassInfo(String id, String title, String studentCount, String studentMaxCount,
                            String managerId, String managerName, List<Course> courses) { }

    public record ClassPage(Scope scope, int page, int pageSize, boolean mayHaveMore, List<ClassInfo> groups) { }

    public record CreatedClass(String groupId, String title, boolean verified, ClassInfo group) { }

    public Result<ClassPage> findClasses(Scope scope, String keyword, int page) {
        if (page < 1 || page > Integer.MAX_VALUE / PAGE_SIZE) {
            return failure("INVALID_ARGUMENT", "", "页码必须是有效的正整数。");
        }
        try {
            requireSession();
            int start = (page - 1) * PAGE_SIZE;
            var body = client.get().uri(uri -> {
                uri.path(scope == Scope.ALL ? "/group/Groups/Classes/V2" : "/group/Groups/Mine/V2")
                        .queryParam("startPos", start).queryParam("endPos", start + PAGE_SIZE - 1);
                if (StringUtils.hasText(keyword)) uri.queryParam("search", "{keyword}");
                return StringUtils.hasText(keyword) ? withSerial(uri).build(keyword.trim()) : withSerial(uri).build();
            }).header("RequestUniqueId", UUID.randomUUID().toString()).retrieve().body(JsonNode.class);
            checkResponse(body);
            var groups = readGroups(body);
            return success("查询成功；返回数量仅代表当前页。",
                    new ClassPage(scope, page, PAGE_SIZE, groups.size() == PAGE_SIZE, groups));
        } catch (ApiFailure e) {
            return failure(e.status, e.code, e.getMessage());
        } catch (RestClientResponseException e) {
            return httpFailure(e, false);
        } catch (RestClientException e) {
            return failure("QUERY_FAILED", "", "班级查询未取得有效响应，不能据此判断没有班级。");
        }
    }

    public Result<ClassInfo> getClassInfo(String groupId) {
        if (!StringUtils.hasText(groupId)) return failure("INVALID_ARGUMENT", "", "班级 ID 不能为空。");
        try {
            requireSession();
            var body = client.get().uri(uri -> withSerial(uri.pathSegment("group", "{id}", "info"))
                    .build(groupId.trim())).header("RequestUniqueId", UUID.randomUUID().toString())
                    .retrieve().body(JsonNode.class);
            checkResponse(body);
            var groups = readGroups(body);
            var group = groups.stream().filter(item -> groupId.trim().equals(item.id())).findFirst();
            return group.map(item -> success("班级详情查询成功。", item))
                    .orElseGet(() -> failure("NOT_FOUND", "", "接口成功，但没有返回该班级的基本信息。"));
        } catch (ApiFailure e) {
            return failure(e.status, e.code, e.getMessage());
        } catch (RestClientResponseException e) {
            return httpFailure(e, false);
        } catch (RestClientException e) {
            return failure("QUERY_FAILED", "", "班级详情查询未取得有效响应。");
        }
    }

    /** 创建只发一次 POST；业务成功后查回，不把查回失败误报为创建失败。 */
    public Result<CreatedClass> createClass(String title) {
        if (!StringUtils.hasText(title)) return failure("INVALID_ARGUMENT", "", "请提供班级名称。");
        String name = title.trim();
        if (name.codePointCount(0, name.length()) > 30) {
            return failure("INVALID_ARGUMENT", "", "班级名称最多 30 个字符。");
        }
        JsonNode body;
        try {
            requireSession();
            if (!StringUtils.hasText(properties.instCode()) || !StringUtils.hasText(properties.userId())) {
                return failure("NOT_CONFIGURED", "", "创建缺少机构编码或当前用户 ID，请在本地服务配置中补齐。");
            }
            var argument = Map.of("code", properties.instCode(), "title", name, "photoUrl", "",
                    "courseIds", List.of(), "managerId", properties.userId());
            body = client.post().uri(uri -> withSerial(uri.path("/group/V3")).build())
                    .header("RequestUniqueId", UUID.randomUUID().toString())
                    .body(Map.of("GroupArguV2", argument)).retrieve().body(JsonNode.class);
            checkResponse(body);
        } catch (ApiFailure e) {
            if ("INVALID_RESPONSE".equals(e.status)) return uncertainCreation();
            return failure(e.status, e.code, e.getMessage());
        } catch (RestClientResponseException e) {
            return httpFailure(e, true);
        } catch (RestClientException e) {
            return uncertainCreation();
        }
        String groupId = text(body, "groupId");
        if (groupId.isBlank()) {
            return new Result<>("CREATED_UNVERIFIED", text(body, "code"),
                    "服务端报告创建成功，但没有返回班级 ID。请查询班级列表核实，不要重复创建。",
                    new CreatedClass("", name, false, null));
        }
        var detail = getClassInfo(groupId);
        if (!detail.successful()) {
            return new Result<>("CREATED_UNVERIFIED", text(body, "code"),
                    "班级“" + name + "”创建成功，ID：" + groupId + "。详情查回未成功，请稍后按 ID 查询，不要重复创建。",
                    new CreatedClass(groupId, name, false, null));
        }
        return success("已创建班级“" + detail.data().title() + "”，ID：" + groupId
                        + "，并已按 ID 查回确认。班主任为当前账号，未关联课程或添加学员。",
                new CreatedClass(groupId, detail.data().title(), true, detail.data()));
    }

    private UriBuilder withSerial(UriBuilder uri) {
        return uri.queryParam("serino", serial.incrementAndGet());
    }

    private void requireSession() {
        if (!StringUtils.hasText(properties.token()) || !StringUtils.hasText(properties.instId())
                || !StringUtils.hasText(properties.serverId())) {
            throw new ApiFailure("NOT_CONFIGURED", "", "本地服务尚未配置班级接口的登录凭证和机构上下文。");
        }
    }

    private void checkResponse(JsonNode body) {
        if (body == null || !body.isObject() || text(body, "code").isBlank()) {
            throw new ApiFailure("INVALID_RESPONSE", "", "接口响应缺少业务状态码。");
        }
        String code = text(body, "code");
        if ("0".equals(code) || "200".equals(code)) return;
        if ("-1001".equals(code) || "-5104".equals(code)
                || ("-2".equals(code) && "无效Token".equalsIgnoreCase(text(body, "message")))) {
            throw new ApiFailure("AUTH_REQUIRED", code, "登录凭证失效或账号已过期，请更新本地登录配置。");
        }
        // 只返回业务提示，避免把完整原始响应及请求凭证交给模型。
        String message = text(body, "message").replace(properties.token(), "[凭证已隐藏]");
        throw new ApiFailure("BUSINESS_ERROR", code, "班级接口返回业务错误（" + code + "）：" + message);
    }

    private List<ClassInfo> readGroups(JsonNode body) {
        var groups = body.path("groups");
        if (groups.isMissingNode() || groups.isNull()) return List.of();
        if (!groups.isArray()) throw new ApiFailure("INVALID_RESPONSE", "", "接口的 groups 不是班级数组。");
        var result = new ArrayList<ClassInfo>();
        for (var group : groups) {
            if (!group.isObject() || text(group, "id").isBlank()) {
                throw new ApiFailure("INVALID_RESPONSE", "", "接口返回的班级缺少 ID。");
            }
            var courses = new ArrayList<Course>();
            if (group.path("courses").isArray()) {
                for (var course : group.path("courses")) courses.add(new Course(text(course, "id"), text(course, "title")));
            }
            result.add(new ClassInfo(text(group, "id"), text(group, "title"), text(group, "studentCount"),
                    text(group, "studentMaxCount"), text(group, "managerId"),
                    text(group.path("manager"), "nickname"), List.copyOf(courses)));
        }
        return List.copyOf(result);
    }

    private static String text(JsonNode node, String field) {
        return node.path(field).asText("");
    }

    private static <T> Result<T> success(String message, T data) {
        return new Result<>("SUCCESS", "0", message, data);
    }

    private static <T> Result<T> failure(String status, String code, String message) {
        return new Result<>(status, code, message, null);
    }

    private static <T> Result<T> uncertainCreation() {
        return failure("CREATE_UNKNOWN", "", "创建请求未取得明确结果，班级可能已经创建。请先查询核实，不要直接重试创建。");
    }

    private static <T> Result<T> httpFailure(RestClientResponseException e, boolean creating) {
        if (e.getStatusCode().value() == 401 || e.getStatusCode().value() == 403) {
            return failure("ACCESS_DENIED", String.valueOf(e.getStatusCode().value()), "登录无效或没有此班级操作权限。");
        }
        if (creating) return uncertainCreation();
        return failure("HTTP_ERROR", String.valueOf(e.getStatusCode().value()), "班级接口 HTTP 请求失败，不能据此判断没有班级。");
    }

    private static final class ApiFailure extends RuntimeException {
        private final String status;
        private final String code;

        private ApiFailure(String status, String code, String message) {
            super(message);
            this.status = status;
            this.code = code;
        }
    }
}
