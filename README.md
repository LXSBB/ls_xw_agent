# Spring AI ReAct Agent Demo

基于 Spring AI 的 Java 服务和本地聊天页面，通过领视 Social API 查询当前机构的课表、学员课时、教学任务及班级，并支持创建普通班级。查询使用 ReAct 循环：模型选择工具、应用执行、返回结果、模型汇总；创建完成后直接返回确定的执行结果。

页面地址：[http://127.0.0.1:8080](http://127.0.0.1:8080)。项目目录：`/Users/lixiao/spring-ai-react-demo`。

示例需求：**“查当前校区本周课表”**、**“查张三的剩余课时”**、**“查春季班已发布的任务和完成情况”**、**“查询我的班级”**、**“创建一个班级，名称是……”**。

班级工具：`findClasses` 查询我的/所有班级，`getClassInfo` 查询基本信息，`createClass` 创建班级并按 ID 查回。创建会写入当前机构，默认当前账号为班主任，不关联课程或添加学员。

校务查询工具：`findTeachers` 查找教师，`findStudentHours` 查找学员并返回课时余额，`getTimetable` 查课表，`getConsumption` 查课消，`findTasks` 查任务及发布对象，`getTaskProgress` 查任务完成情况。只读工具不会排课、扣课时、发布任务或切换校区。

## 环境与依赖

| 项目 | 版本 / 要求 |
| --- | --- |
| Java | 21 |
| Spring Boot | 4.1.1 |
| Spring AI | 2.0.1，通过 BOM 管理 |
| Maven | 3.6.3+；本次使用 3.9.16 构建 |
| 模型 | DeepSeek-V4.1-Flash-1017，官方 API 名称 `deepseek-flash` |
| 外部配置 | 模型 API Key、服务地址、模型名称、MySQL 连接配置 |
| 会话存储 | MySQL 8.4，数据库 `agent_memory` |

运行本示例需要 MySQL 8.4 保存会话，不需要 Redis、Docker 或 GPU。源码包含基本中文注释，没有新增测试用例。会话表、自动读写和恢复方案见 [Agent 会话记忆方案](docs/conversation-memory.md)。

## 启动

本机 `.env` 已配置，启动时直接加载即可。新副本首次使用时，在项目根目录复制配置模板；`-n` 避免覆盖已有 Key：

```bash
cp -n .env.example .env
```

新副本用编辑器打开 `.env`，替换 `LLM_API_KEY`。默认使用 DeepSeek 官方接口：

```dotenv
LLM_API_KEY=在本地填入真实Key
LLM_BASE_URL=https://api.deepseek.com
LLM_MODEL=deepseek-flash
SERVER_PORT=8080
AGENT_MEMORY_DB_URL='jdbc:mysql://127.0.0.1:3306/agent_memory?connectionTimeZone=Asia/Shanghai'
AGENT_MEMORY_DB_USERNAME=agent_memory
AGENT_MEMORY_DB_PASSWORD=本机数据库专用账号密码

LINGSHI_SOCIAL_BASE_URL=https://esastage2.51tyty.com/social/services/rest
LINGSHI_TOKEN=当前登录凭证
LINGSHI_INST_ID=当前机构ID
LINGSHI_SERVER_ID=1201
LINGSHI_USER_ID=当前用户ID
LINGSHI_INST_CODE=当前机构编码
LINGSHI_USERNAME=当前登录账号
```

Base URL **不包含** `/chat/completions`，由 SDK 追加。不要把 Key 写入 Java、YAML 或提交到 Git。`.env` 已加入忽略规则，本机文件权限为 `0600`，源码压缩包不包含该文件。

`LINGSHI_INST_CODE` 是机构信息中的 `institution.code`，与机构 ID 和登录响应的业务 `code` 不同。可由 `GET {SOCIAL_BASE_URL}/institution/Id/{instId}` 核实；对应客户端 `InstitutionService.getInstitutionInfo`。其他公共请求头按 `.env.example` 的可选字段配置。修改 `.env` 后需要重启服务。

本机 MySQL 已通过 Homebrew 服务运行；可用 `brew services start mysql@8.4` 启动。新环境先创建数据库和专用账号，权限见[会话记忆方案](docs/conversation-memory.md)。应用启动时自动创建记忆表，连接或建表失败会阻止启动。

Spring Boot 不会自动加载 `.env`，在 macOS / Linux 终端导出后启动：

```bash
cd /Users/lixiao/spring-ai-react-demo
set -a
source .env
set +a

mvn spring-boot:run
```

也可以构建为可执行 JAR：

```bash
mvn package
java -jar target/spring-ai-react-demo-0.0.1-SNAPSHOT.jar
```

本机项目目录的 `target/` 已生成 JAR，配置环境变量后可以直接运行它。源码压缩包不含 `target/`，解压后需先执行 `mvn package`。IDE 启动时，在运行配置中设置相同的环境变量，运行 `ReActDemoApplication`。

默认只监听 `127.0.0.1:8080`。这个学习示例没有登录鉴权，不应直接暴露到公网。

## 聊天页面

启动后打开 [本地聊天页面](http://127.0.0.1:8080)：

- 在输入框提问，点击“发送”或按 Enter；Shift + Enter 换行，输入法选字不会发送。
- “查课表”“查任务”“我的班级”和“所有班级”直接发起查询；“查课时”“创建班级”只填写输入框，补齐名称后发送才执行。
- 可以继续追问“查看刚才那个班级”或“下一页”；指定其他老师、课程或学员的创建暂不支持。
- 每次请求先识别校务意图。非校务问题统一提示“目前无法回答非校务相关问题”，不调用业务工具；需求不明确时提示补充。包含独立非校务问题的混合请求也会整体拦截。
- 回答下面的“查看执行过程”展示实际工具名称、参数和返回值。
- 会话自动保存到 MySQL，刷新页面或重启服务后自动恢复。顶部列表可以切换最近 50 个会话。
- “新对话”保留旧记录；“清空会话”删除当前会话及数据库中的全部轮次，再打开空会话。
- 模型参考最近 6 轮已完成对话，页面显示最近 50 轮，完整记录保留在数据库。浏览器只保存当前会话 ID。
- “刷新记录”只读取已保存的结果；进行中的请求会自动轮询状态，不重新执行业务操作。
- 页面显示的是应用连接状态；模型请求是否成功以实际回答或错误提示为准。

页面使用原生 HTML、CSS、JavaScript，由 Spring Boot 的 `static/` 目录提供，无需额外的 Node 前端构建服务。浏览器只调用本机接口，不接触模型 Key。

## 调用

健康检查只代表应用启动，不会请求模型：

```bash
curl http://127.0.0.1:8080/actuator/health
```

发起查询：

```bash
curl http://127.0.0.1:8080/api/agent/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"查询我的班级"}'
```

响应字段：

| 字段 | 含义 |
| --- | --- |
| `conversationId` | 服务端会话 UUID，追问时传回 |
| `requestId` | 本轮 UUID，同一请求重复提交时复用 |
| `answer` | 中文答案：模型汇总、固定范围提示或创建结果 |
| `modelCalls` | 本次请求的模型调用轮数，包含前置意图识别和最终回答 |
| `steps[].round` | 该工具请求来自第几轮模型调用 |
| `steps[].toolCallId` | 模型工具调用 ID，用于对应返回结果 |
| `steps[].tool` | 实际执行的工具名称 |
| `steps[].arguments` | 模型给出的 JSON 参数字符串 |
| `steps[].observation` | 工具实际返回的 JSON 字符串 |

查询通常调用一次业务工具，再由模型汇总；具体轮数随问题变化。`steps` 只呈现实际工具参数和精简的业务结果，不展示模型内部推理或登录凭证。创建工具使用 `returnDirect=true`，直接显示创建及查回结果，不再请求模型生成最终答案。

接口仍兼容仅传 `message` 的请求，会自动新建会话。连续追问时传回服务端返回的 `conversationId`；调用方为每轮生成 `requestId`，同一轮重复提交时保持不变：

```json
{
  "conversationId": "替换为服务端返回的 UUID",
  "requestId": "替换为本轮生成的 UUID",
  "message": "查看这个班级的基本信息"
}
```

历史由服务端读取，不再接受非空 `history` 数组（返回 400）。页面先创建会话并保存 ID，即使聊天响应丢失，也能读取会话确认结果。完整会话 API、去重和重启恢复规则见[会话记忆方案](docs/conversation-memory.md)。历史只用于理解追问，业务事实仍须本次工具查询。

## 从哪里读代码

源码均位于 `src/main/java/com/example/reactdemo/`：

| 文件 | 职责 |
| --- | --- |
| `ReActDemoApplication.java` | 应用入口 |
| `api/AgentController.java` | HTTP 接口、输入非空和长度校验 |
| `memory/ConversationAgentService.java` | 自动读取历史、执行 Agent、保存本轮结果 |
| `memory/ConversationMemory.java` | 会话 SQL、身份隔离、去重、并发与重启恢复 |
| `agent/ReActAgentService.java` | ReAct 循环、执行预算、工具结果回传 |
| `agent/SchoolIntentClassifier.java` | 结合历史识别当前校务意图，不注册业务工具 |
| `agent/EducationTools.java` | `@Tool` 声明、参数说明、业务服务适配 |
| `agent/SchoolQueryTools.java` | 课表、课时、任务的只读工具定义及参数约束 |
| `school/ClassManagementClient.java` | Social 请求、业务码解析、班级 DTO、创建后查回 |
| `school/SchoolQueryClient.java` | 校务接口、日期范围、分页、完成率计算与字段白名单 |
| `school/SchoolQueryModels.java` | 校务查询结果、单位及统计范围 DTO |
| `school/ClassManagementProperties.java` | 本地服务地址、账号与机构配置 |
| `agent/AgentResponse.java` | 最终答案和工具调用记录 |
| `agent/ChatTurn.java` | 服务端提供的历史文本，以及旧 history 参数的输入校验 |
| `agent/AgentLimitException.java` | 超出执行预算时终止 |
| `api/ApiExceptionHandler.java` | HTTP 错误转换 |

前端在 `src/main/resources/static/`：`index.html` 定义页面，`app.css` 定义桌面与窄屏布局，`app.js` 处理聊天、历史和工具展示。`GET /api/agent/info` 只返回模型名称。

优先阅读 `ReActAgentService.chat()`：先由 `SchoolIntentClassifier` 判断当前请求是否属于校务；通过后进入三个动作：

1. **Reason**：`chatModel.call(prompt)` 请求模型，获取工具请求或最终答案。
2. **Act**：`toolCallingManager.executeToolCalls(...)` 执行本次已注册的工具。
3. **Observe**：把完整 `conversationHistory()` 作为下一轮 Prompt，保留工具调用 ID 与结果的对应关系。

这里使用 Spring AI 2.x 的底层 `ChatModel` 显式编排循环，便于学习和设置轮数上限。`ChatModel` 自身不执行工具。普通应用也可用 `ChatClient`，由 `ToolCallingAdvisor` 自动管理循环。

请求选项从 `chatModel.getOptions().mutate()` 派生，保留供应商所需的具体类型、模型名称和超时等配置；不要直接用通用 options 替换供应商配置。

## 范围与配置

- 最多调用模型 6 轮，由 `demo.agent.max-model-calls` 配置，允许 1–10。第一次用于意图识别，业务流程从第 2 次开始；配置为 1 时仅能完成意图识别。单轮最多执行 4 个工具，最后一轮若仍要求工具，返回 422，不再执行。
- 意图分类依据最新需求，历史只用于理解指代。校务相关但未支持的业务仍进入能力说明；一般知识、编程和学科作业不属于校务。识别会增加一次模型调用，分类仍可能误判，不替代下游权限校验。分类响应异常时返回执行错误，不调用业务工具。
- 单次模型请求超时为 30 秒，关闭 SDK 自动重试。整个 Agent 请求可能包含多轮模型调用。
- `spring.ai.openai.chat.extra-body.thinking.type=disabled` 显式使用 DeepSeek 非思考模式，该模式仍支持工具调用。若切换为思考模式，需要额外处理工具循环中的 `reasoning_content` 回传，不能只改这个开关。
- 查询工具回到模型汇总；创建工具独立执行并直接返回。模型若把创建与其他工具放在同一轮，本轮工具不会执行。
- 班级列表每页 20 条，查询区间为 `0–19`、`20–39`；`mayHaveMore` 依据当前页是否满页，不代表总数。
- 校务查询沿用当前配置身份，工具参数不接受机构、校区、服务器或凭证。跨校区需求提示能力未开放，不自动降为当前校区查询；实际数据授权仍由下游接口校验。
- 教师、学员、班级和任务名称先查询真实对象，同名时澄清。服务端提示词提供上海时区的当前日期；课表未指定日期默认当天，课消未指定期间先询问。
- 课表和课消一次最多查询 31 天。课表沿用 App 的 `startPos=0/endPos=0` 日期查询，在返回的课节中本地分页，每页 20 条；返回的课节数与接口 `lessonTotal` 分开保留。
- 学员课时、教师、任务和课消按接口分页，每页 20 条。剩余课时返回的是当前余额，不支持还原历史某日余额。课时和天数分别列示，不混加，不将当前页课消加总视为全期总量。
- 任务名称、发布记录 ID（`shareId`）与模板 ID（`workcellId`）分开。查询全部任务类型时省略 `workcellType`；实测传 `all` 会返回 HTTP 404。任务可见范围为当前账号及关联班级，不能宣称包含全校全部任务。
- 任务列表人数完成率使用 `completedNum / (completedNum + undoneNum)`。指定班级但发布对象涉及个人或多个班级时，不展示可能属于整个任务的人数完成率，改查该班级任务明细。
- 整个任务的报告使用子任务计数；指定班级的报告按学员明细 `done/total` 计算任务项进度，不能混用两种完成率。班级最多读取 100 名接收者；超过或未完整取得时只给当前页进度，并在 `scope` 明示，不作为全班完成率。学员明细仍按每页 20 人展示。
- 完成率由 Java 使用十进制计算，保留两位小数；未全部完成不会因四舍五入显示 100%。分母为零或计数缺失时 `percent=null`，不是 0%。接口缺失列表返回 `INVALID_RESPONSE`，不能视为空结果。
- 新查询工具只向模型返回姓名、业务 ID、查询结果和必要的统计字段，不传递手机号、地址、头像或完整原始接口响应。连接超时 5 秒、读取超时 20 秒，校务查询不自动重试。
- 响应从根对象读取，兼容字符串/数字业务码 `0`、`200`。登录失效、HTTP 错误、业务错误和空列表分别表达；当前环境的 `-2 / 无效Token` 识别为登录失效。
- 创建名称会去掉首尾空白，并限制为 1–30 个字符。提交使用 `GroupArguV2` 包装，机构编码和班主任 ID 由服务端配置提供。
- Social 请求连接超时 5 秒、读取超时 15 秒；应用不重试创建 POST。创建结果不明返回 `CREATE_UNKNOWN`，应先查询核实；业务成功而查回失败返回 `CREATED_UNVERIFIED`，不能重新创建。浏览器不提供通用重试按钮。
- 同一会话、相同 `requestId` 的已完成请求返回缓存结果，不再次执行。更换请求 ID 再次发送创建指令仍可能创建多个班级，不能把此机制当作业务全局幂等。
- 输入最多 2000 个字符。输入无效返回 400；会话不可见返回 404；请求冲突返回 409；超出执行预算返回 422；数据库不可用返回 503；其他执行错误返回 500。数据库和执行错误携带 `errorId`。
- 日志记录轮次、工具名称及错误编号／异常类型，不主动记录原始对话、Key 或供应商错误正文。排查错误时可用 `errorId` 对应日志，并在本地调试器中查看异常。
- 通过兼容协议接入其他模型时，需要重新确认工具调用能力，以及温度、输出长度等参数是否受支持；DeepSeek 专用的 `thinking` 参数也需要调整或移除。
- 当前仅用于本机单账号联调，所有请求使用 `.env` 的同一身份和机构，真实权限由下游接口判断。多人服务需要逐请求登录鉴权与机构上下文，不能直接共用这组配置。
- 创建的重名规则、其他角色权限及服务端完整必填规则待确认。接口依据：[班级 API 文档](/Users/lixiao/lingshi/lingshi_application/document/class_management_api.md)。

三类查询的接口依据为当前 `lingshi_application_copy` 客户端调用与测试环境返回，路径均相对 `LINGSHI_SOCIAL_BASE_URL`：

| 工具 | 接口与参数 |
| --- | --- |
| `findTeachers` | `GET /institution/Id/{instId}` 获取机构 `groupId`，再查 `GET /group/GetUsers/{groupId}/noSaleAndStudent`，支持 `search` 和分页 |
| `findStudentHours` | `POST /user/student/record/list`，请求体包装为 `StudentsSearchArgu`，返回 `users` 和各类数量列表 |
| `getTimetable` | `POST /course/lecture/list`，请求体包装为 `LectureListArgu`，使用教师/班级、起止日期筛选，解析 `dateLists[].list` |
| `getConsumption` | `GET /course/consume`，传 `userId`、可选 `courseId`、`consumeStartDate`、`consumeEndDate` 和分页 |
| `findTasks` | `GET /share/PublishedAssignmentsV2/Inst/User/{userId}`，支持 `searchKey`、`groupId`、`workcellType`、`taskStartDate/taskEndDate` |
| `getTaskProgress` | 全任务：`GET /assignment/Inst/Share/assignmentReport/{shareId}/report`；指定班级：`GET /assignment/ShareV2/{shareId}?teamType=group&teamId={groupId}` |

实现对应 Flutter 的 `bedrock/dcpserver/lib/src/service/social/course_service.dart`、`group_service.dart`、`share_service.dart`、`assignment_service.dart` 和 `src/service/user/user_service.dart`。不能仅凭客户端参数推断服务端已经完成跨校区权限隔离。

## 已完成的验证

2026-10-24，会话记忆的本轮验证详见[方案验证记录](docs/conversation-memory.md#验证记录)。以下为此前功能的历史验证记录。

2026-10-24，三类只读查询，本机单账号、stage2 的“一去二三里”机构：

- `mvn -q verify` 和 `node --check src/main/resources/static/app.js` 通过。仓库没有现有测试用例，本次结果不代表自动化回归覆盖。
- 经 `/api/agent/chat` 调用真实模型，完成当前校区本周课表查询、指定学员课时余额查询，以及指定日期的课消查询，相关工具均返回 `SUCCESS`。本账号在所查期间没有排课和课消记录，非空课表及非空课消的端到端展示仍待验证。
- 教师关键词匹配到两个账号时先澄清；通过历史追问选择具体教师后，调用 `getTimetable`，教师 ID 和当天日期传递正确。
- 完成班级名称查询 → 按班级查已发布任务，返回 5 条发布记录；区分整班和个人分发对象。查询全部类型时省略 `workcellType` 后成功。
- 同一条任务的全任务报告与指定班级报告均查询成功，实测为已完成 1 / 总量 4、25%。回答分别标注子任务和任务项口径。超过一页及超过 100 名接收者的真实数据场景尚未验证。
- 非校务请求返回固定范围提示，跨校区请求说明未开放，两者均未调用业务工具。课消缺少日期时先询问期间，未调用课消接口。
- 页面六个入口可见；“查课时”只填写输入框。补齐学员并发送后，余额、单位、查询范围和工具执行过程正常展示。

2026-10-23，班级功能的历史验证，本机单账号、stage2 环境：

- Maven 编译和 JAR 打包通过，JavaScript 语法检查通过。
- Social 的我的班级、所有班级及机构信息查询成功，业务码实际为字符串 `"0"`。
- 经 `/api/agent/chat` 调用真实模型，完成我的班级查询、所有班级关键词空结果查询和按 ID 查询基本信息，工具参数与结果一致。
- 空消息和客户端伪造 `system` 历史角色均返回 400。
- 非校务问题、混合请求和绕过分类规则的输入返回固定范围提示，未调用业务工具；问候会引导补充需求。带历史的校务追问通过分类，切换到天气话题仍被拦截；当时尚未接入的课表查询说明能力限制。
- 页面查询成功；“创建班级”入口只填充输入框，不自动提交。
- 无效凭证实测返回 `-2 / 无效Token`，工具映射为 `AUTH_REQUIRED`，模型提示更新本地登录配置，没有误报为空列表。
- 从页面创建“Agent联调班级20261023”，只执行一次 `createClass`；服务端返回 ID `826163696`，详情及名称搜索均查回同一条记录。机构为 `17413`，班主任为 `1112919`，学员数为 0，没有关联课程。
- 当前账号已验证空封面、空课程列表和默认班主任可以创建；尚未验证其他角色权限、服务端重复提交和并发场景。

没有新增测试用例。

## 参考

- [Spring AI 版本兼容说明](https://docs.spring.io/spring-ai/reference/getting-started.html)
- [Spring AI 工具调用](https://docs.spring.io/spring-ai/reference/api/tools.html)
- [ChatModel 显式工具循环](https://docs.spring.io/spring-ai/reference/api/tools/chatmodel-tool-calling.html)
- [DeepSeek 官方接口和模型名称](https://api-docs.deepseek.com/zh-cn/)
- [DeepSeek 工具调用](https://api-docs.deepseek.com/zh-cn/guides/tool_calls/)
- [DeepSeek 思考模式与参数](https://api-docs.deepseek.com/zh-cn/guides/thinking_mode/)
