package com.example.reactdemo.agent;

import com.example.reactdemo.school.ClassManagementClient;
import com.example.reactdemo.school.ClassManagementClient.ClassInfo;
import com.example.reactdemo.school.ClassManagementClient.ClassPage;
import com.example.reactdemo.school.ClassManagementClient.CreatedClass;
import com.example.reactdemo.school.ClassManagementClient.Result;
import com.example.reactdemo.school.ClassManagementClient.Scope;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.ai.tool.annotation.ToolParam;
import org.springframework.stereotype.Component;

/** 工具适配层：描述暴露给模型，方法只负责参数边界校验并调用业务服务。 */
@Component
public class EducationTools {

    private final ClassManagementClient schoolService;

    public EducationTools(ClassManagementClient schoolService) {
        this.schoolService = schoolService;
    }

    @Tool(description = "查询当前登录账号可见的真实班级，支持我的班级、所有班级、关键词和分页。"
            + "每页20条，mayHaveMore仅表示可能还有下一页；当前页条数不是总数。失败状态不等于空列表。")
    public Result<ClassPage> findClasses(
            @ToolParam(description = "MINE=我的班级，ALL=所有班级；未指定默认MINE", required = false) Scope scope,
            @ToolParam(description = "搜索关键词，不筛选时省略", required = false) String keyword,
            @ToolParam(description = "页码，从1开始，默认1", required = false) Integer page) {
        return schoolService.findClasses(scope == null ? Scope.MINE : scope, keyword, page == null ? 1 : page);
    }

    @Tool(description = "按真实班级 ID 查询基本信息，不包含课表和学员名单。")
    public Result<ClassInfo> getClassInfo(
            @ToolParam(description = "用户提供或班级查询/创建结果中的 ID，不可编造") String groupId) {
        return schoolService.getClassInfo(groupId);
    }

    @Tool(description = "真实创建一个班级，仅在用户明确要求创建且提供名称时调用。"
            + "当前机构、当前账号为班主任，不绑定课程、不添加学员。只支持一个名称，不能实现指定其他老师或课程。"
            + "必须独立调用，不能与其他工具放在同一轮。工具会查询详情核实并直接返回结果，不要重复调用。",
            returnDirect = true)
    public Result<CreatedClass> createClass(
            @ToolParam(description = "用户明确指定的班级名称，1至30个字符") String title) {
        return schoolService.createClass(title);
    }
}
