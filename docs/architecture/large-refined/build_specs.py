"""Full 05/06 architecture posters. Build sources without invoking remote services."""
import json
from pathlib import Path

ROOT=Path(__file__).parent
BASE=ROOT.parent
B='#3DADFF'; G='#66D575'; V='#874FFF'; T='#5AD8CC'; GR='#B3B3B3'; O='#FF9E42'

def view(key,root,backup,title,subtitle,x,h,footer):
 return dict(key=key,rootId=root,backupId=backup,title=title,subtitle=subtitle,position=dict(x=x,y=-3700),width=3600,height=h,footer=footer,groups=[],cards=[],texts=[],edges=[],paths=[])

def group(v,key,x,y,w,h,fill,title=None,subtitle=None,parent=None,size=40):
 v['groups'].append(dict(id=key,x=x,y=y,w=w,h=h,fill=fill,title=title,subtitle=subtitle,parent=parent,size=size))

def card(v,key,title,body,x,y,w,h,accent=GR,parent=None,size=28,titleSize=32):
 v['cards'].append(dict(id=key,title=title,body=body,x=x,y=y,w=w,h=h,accent=accent,parent=parent,size=size,titleSize=titleSize))

def text(v,key,value,x,y,w,size=28,bold=False,parent=None,color='#505B6C',url=None):
 v['texts'].append(dict(id=key,text=value,x=x,y=y,w=w,size=size,bold=bold,parent=parent,color=color,url=url))

def edge(v,a,b,label='',sides=('RIGHT','LEFT'),dashed=False,both=False):
 v['edges'].append(dict(a=a,b=b,label=label,sides=sides,dashed=dashed,both=both))

def path(v,key,points,color=B,dashed=False):
 v['paths'].append(dict(id=key,points=points,color=color,dashed=dashed))

v=view('05-agent-components','23:372','39:697','05  /  Agent 组件与运行架构',
 '通用场景 · 完整组件、执行关系与状态归属｜上线目标设计，非现状全量实现',6700,3820,
 '部署边界：模块化 Spring Boot 应用 + 数据库；模型、IAM 与业务 API 复用现有平台。RAG、MCP、异步通知和人工接入按需启用。')
group(v,'guide',80,300,3440,92,'#F9F9F9')
text(v,'guide-t','阅读顺序：接入 → 路由 → 执行 → 结果 → 提交     ｜     右栏：契约与共享能力     ｜     实线：调用 / 结果；蓝线：短路结果',112,326,3376,29,True,'guide')
group(v,'channels',80,430,2420,94,'#FFFFFF')
for i,title in enumerate(['Web / H5','App / 桌面端','IM / 协作渠道','开放 API / SDK']):
 text(v,'channel-'+str(i),title,132+i*580,454,530,32,True,'channels')

stages=[
 ('runner','01  请求接入 · Runner','代码受理请求并持有可信上下文；每个 requestId 对应可查询的处理状态。',560,360,'#F9F9F9'),
 ('router','02  识别与分发 · Root Orchestrator','模型生成候选路由，代码决定范围、能力与执行权限。',1000,410,'#F5FBFF'),
 ('runtime','03  场景执行 · Skill Runtime','同一服务中的逻辑模块；Workflow 与 ReAct 共用工具网关和任务预算。',1480,960,'#EBFFEE'),
 ('result','04  统一结果 · Result Composer','正常执行、范围外、暂未支持与澄清，都进入同一结果出口。',2540,360,'#F1FEFD'),
 ('commit','05  保存与下发 · State Commit & Delivery','最终响应以保存结果为准；写入操作有独立记录，本地提交不包含远端事务。',2980,360,'#F9F9F9'),
]
for key,title,sub,y,h,fill in stages:
 group(v,key,80,y,2420,h,fill,title,sub)
 v['groups'][-1]['subSize']=25
runner=[
 ('adapter','渠道与协议适配','统一消息与交互动作\nHTTP / SSE / 事件回调\n格式、大小与请求限流'),
 ('identity','身份上下文','认证 → 用户 / 租户 / 权限\n校验会话与数据归属\n凭证仅在服务端使用'),
 ('request','请求原子受理','登记 requestId\n完成 → 重放；处理中 → 状态\n重复请求不重复执行'),
 ('context','上下文装配','读取可信任务版本与最近对话\n建立 traceId / deadline\n接续会话中的已有任务')]
for i,(key,title,body) in enumerate(runner):card(v,key,title,body,130+i*580,691,530,208,GR,'runner')
router=[
 ('event','交互事件优先','校验 actionId 与任务版本\n已知动作恢复目标任务\n自然语言进入语义分类',B),
 ('intent','语义分类与抽取','模型理解领域、意图与参数\n结合最近对话理解追问\n输出结构化候选路由',V),
 ('policy','范围与能力策略','范围外：目前无法回答相关问题\n未支持说明能力；不明则澄清\n支持且授权 → 绑定执行任务',B),
 ('dispatch','Skill 绑定与分发','绑定 Skill / Workflow 版本\n核验启用状态与依赖\n仅独立只读任务允许并行',B)]
for i,(key,title,body,accent) in enumerate(router):card(v,key,title,body,130+i*580,1131,530,218,accent,'router',27)
text(v,'rag-gate','可选知识路径：通过领域与权限门控后再检索；知识命中不能替代工具执行授权。',130,1360,2320,24,False,'router')
text(v,'short-label','范围外 / 未支持 / 澄清 → 结果出口；不调用工具',120,1425,1080,25,True,color='#357FC4')
path(v,'short-result',[(80,1190),(28,1190),(28,2710),(80,2710)])

for i,(key,title,body) in enumerate([
 ('loader','资产与版本加载','scope / facts / tools · 输入输出 Schema\n锁定 Prompt、流程和发布版本快照'),
 ('task','任务状态管理','taskId / taskVersion · 续接、暂停与终止\n并发更新采用版本检查与原子状态迁移'),
 ('prefetch','依赖事实预取','仅取当前步骤所需数据，授权后并发只读\n保留事实来源、有效时间与可追溯证据')]):
 card(v,key,title,body,130+i*780,1617,730,180,G,'runtime')
card(v,'workflow','Workflow 执行器','确定步骤与依赖顺序\n缺参则暂停；按需调用模型',130,1890,460,180,G,'runtime')
card(v,'react','有界 ReAct','模型：决策 / ToolCall\n代码：停止、预算与观察回传',130,2160,460,180,V,'runtime')
card(v,'gateway','统一工具网关','白名单 + 参数 Schema\n逐次鉴权、租户与数据范围\n注入凭证、超时与脱敏',730,2020,520,200,G,'runtime')
card(v,'readonly','只读适配','授权后访问事实来源\n按读取契约设置重试',1420,1890,470,180,G,'runtime')
card(v,'write','写入操作协调','operationId 原子受理\n保存写入意图后调用 API\n结果未知先核实，禁止盲重试',1420,2160,470,210,O,'runtime')
card(v,'external','外部系统适配','HTTP / RPC / 可选 MCP\n返回业务事实与操作回执\n外部系统保留业务规则',2040,2020,410,210,GR,'runtime',27)
edge(v,'workflow','gateway')
edge(v,'react','gateway','',both=True)
edge(v,'gateway','readonly','读取')
edge(v,'gateway','write','写入')
edge(v,'readonly','external')
edge(v,'write','external')
text(v,'runtime-foot','工具观察沿调用链回传；执行器结束时提交 SkillResult。所有工具结果和检索文本只作数据，不作为指令。',130,2385,2320,26,False,'runtime')
result=[
 ('normalize','结果归一与校验','Schema、状态与工具证据校验\n对齐多任务结果，按证据处理冲突\n保留失败与未完成项'),
 ('compose','回复生成','优先模板与结构化卡片\n复杂文本可经模型组织\n不改写写入状态与业务事实'),
 ('guard','回答检查','事实与来源一致\n未成功不得表述已完成\n检查范围与敏感字段'),
 ('interaction','交互动作封装','澄清选项与继续操作\nactionId 绑定任务及版本\n人工接入按产品需要启用')]
for i,(key,title,body) in enumerate(result):card(v,key,title,body,130+i*580,2671,530,208,T,'result',27)
commit=[
 ('uow','本地状态提交','事务保存会话、任务版本\n保存回复结果与关联审计\n并发冲突按任务状态处理'),
 ('respond','同步响应','读取已提交的最终结果\nHTTP / SSE final\n支持按 requestId 再获取'),
 ('outbox','异步下发［可选］','结果与 Outbox 同事务保存\n投递重试 + 消费去重\n用于 IM / 异步通知'),
 ('recovery','恢复与核实','扫描中断任务与未知操作\n按可靠标识查询外部回执\n无依据保持 UNKNOWN')]
for i,(key,title,body) in enumerate(commit):card(v,key,title,body,130+i*580,3111,530,208,GR,'commit',27)
for a,b,label_ in [('channels','runner','统一请求'),('runner','router','RequestEnvelope + RunContext'),('router','runtime','已支持且授权的任务'),('runtime','result','SkillResult + stateDelta'),('result','commit','ReplyEnvelope + 待保存状态')]:
 edge(v,a,b,label_,('BOTTOM','TOP'))

group(v,'contract-request',2600,430,920,470,'#F9F9F9','请求与可信上下文')
text(v,'request-head','RequestEnvelope',2640,520,840,30,True,'contract-request')
text(v,'request-fields','requestId · sessionId · message / action',2640,568,840,27,parent='contract-request')
text(v,'context-head','RunContext',2640,644,840,30,True,'contract-request')
text(v,'context-fields','userId · tenantId · permissionScope\ntaskId · taskVersion · traceId · deadline\n身份由认证生成；会话与任务由服务端装配。',2640,692,840,27,parent='contract-request')
group(v,'control',2600,1000,920,380,'#F5FBFF','控制面与版本资产')
text(v,'control-body','RouteDecision：domain / intent / skillId / arguments\n结果：执行 / 澄清 / 范围外 / 暂未支持\n\n领域定义 · Skill / Tool Schema · Prompt\n版本发布与灰度绑定；任务持有版本快照。',2640,1100,840,28,parent='control')
group(v,'model',2600,1480,920,440,'#F8F5FF','共享模型网关与执行预算')
text(v,'model-body','分类、规划、回答复用统一模型接口\n结构化输出校验；并发、超时与配额控制\n记录模型 / 配置版本、调用耗时与 Token\n\n内循环：模型轮数、工具数、时间、成本有上限\n重路由：仅范围不匹配且无副作用，限次执行\n模型不持有凭证；实际调用由应用代码执行。',2640,1580,840,28,parent='model')
group(v,'knowledge',2600,2000,920,440,'#FFF7F0','事实、工具与知识边界')
text(v,'knowledge-body','外部业务 API 保留权威事实与业务规则\n读操作与写操作使用不同的超时 / 重试契约\n远端幂等键与回执查询能力须由接口确认\n\n可选 RAG：权限过滤 → 检索 → 引用证据\n检索无依据可说明缺失，不覆盖实时 API 事实\n知识片段、工具观察均不能提升执行权限。',2640,2100,840,28,parent='knowledge')
group(v,'contract-result',2600,2540,920,340,'#F1FEFD','统一结果与操作状态')
text(v,'result-body','SkillResult：kind / payload / evidenceRefs / stateDelta\nANSWER / CLARIFY / UNSUPPORTED\nOUT_OF_SCOPE / HANDOFF / ERROR\n操作状态独立保存：提交中 / 成功 / 成功待核实\n失败 / UNKNOWN；不以回复文本推断写入成功。',2640,2640,840,27,parent='contract-result')
group(v,'governance',2600,2980,920,340,'#F9F9F9','权限、监控与发布治理')
text(v,'governance-body','身份、租户、数据范围与敏感字段脱敏\nTrace：request → task → model / tool\n指标：成功率、延迟、成本、未知操作与积压\n告警处置；回归评估、灰度、配置回滚\n流式草稿可先展示，最终结果以保存状态为准。',2640,3080,840,28,parent='governance')
group(v,'stores',80,3420,3440,280,'#F9F9F9','状态与资产归属 · 可使用同一数据库按职责隔离')
stores=[('stateDb','会话与任务','Runtime 持有任务状态与版本\n摘要 / 快照 / 恢复位置'),('opDb','请求与写操作','Runner 管请求；协调器管操作\n去重 / 回执 / 可重放结果'),('assetStore','配置与资产','Skill / Prompt / Schema 发布版本\n任务引用不可变快照'),('optionalInfra','按需基础设施','向量索引 / 缓存 / 消息投递\n有明确场景后再引入')]
for i,(key,title,body) in enumerate(stores):card(v,key,title,body,130+i*850,3520,790,140,GR,'stores',26,30)
specs=[v]

v=view('06-tech-stack-delivery','29:481','39:903','06  /  开发技术栈与交付部署',
 '面向开发者：用什么 → 如何开发 → 如何交付 → 如何部署｜业务无关，沿用当前 Java 项目',10700,3800,
 '依据：pom.xml、application.yml、README 与源码入口。生产平台、数据库规范、IAM 协议、资源规格及 SLO 待确认；目标方案仍需实施。')
group(v,'guide',80,300,3440,92,'#F9F9F9')
text(v,'guide-t','阅读分区：① 技术与启动    ② 开发与交付    ③ 部署与运维     ｜     实现状态用标签区分；命令仅在对应文件和配置具备后执行。',112,326,3376,29,True,'guide')
group(v,'stack',80,450,2300,880,'#FFFFFF','01  技术选型 · 职责与实现状态')
text(v,'stack-col-role','架构职责',120,542,350,26,True,'stack')
text(v,'stack-col-tech','采用技术与实现落点',520,542,1460,26,True,'stack')
text(v,'stack-col-status','当前状态',2040,542,300,26,True,'stack')
rows=[
 ('应用与构建','Java 21 · Maven 3.9.x · Spring Boot 4.1.1','Web MVC / Validation / 可执行 JAR；首版沿用模块化单体','已有',B),
 ('模型与工具','Spring AI 2.0.1 · ChatModel + ToolCallingManager','@Tool / ToolCallback + API 适配器；调用外部模型 API','基础已有',V),
 ('客户端交互','HTML / CSS / JavaScript · REST','当前无需 Node 构建；可嵌入现有管理端，SSE 按需扩展','已有 / 扩展',B),
 ('持久状态','PostgreSQL + Spring JDBC + Flyway','建议基线；事务、唯一约束、任务版本与受控数据库迁移','待新增',GR),
 ('身份与权限','Spring Security + IAM 适配器','绑定用户 / 租户 / 权限；支持 JWT 时接入 Resource Server','待新增',G),
 ('可观测性','Actuator → Micrometer / OpenTelemetry → 监控平台','已有 health 与日志；补指标、Trace、告警和调用关联','部分已有',T)]
for i,(role,tech,body,status,accent) in enumerate(rows):
 y=600+i*103
 group(v,'row-'+str(i),110,y,2240,96,'#F9F9F9' if i%2==0 else '#FFFFFF',parent='stack')
 group(v,'row-accent-'+str(i),110,y,6,96,accent,parent='stack')
 text(v,'role-'+str(i),role,140,y+27,350,30,True,'stack')
 text(v,'tech-'+str(i),tech,520,y+7,1460,29,True,'stack',color='#1E293B')
 text(v,'body-'+str(i),body,520,y+53,1460,25,parent='stack')
 text(v,'status-'+str(i),'［'+status+'］',2040,y+28,300,25,True,'stack')
text(v,'optional','按需引入：RAG = Spring AI + EmbeddingModel + pgvector；Redis = 热缓存 / 分布式限流。\nOutbox / MQ = 异步投递；MCP = 工具接入协议。模型通过 API 使用，应用节点无需配置 GPU。',120,1240,2220,26,parent='stack')
group(v,'quickstart',2460,450,1060,880,'#F9F9F9','开发者启动与工程文件',size=36)
card(v,'local','本地启动［现有］','首次：按 .env.example 配置 .env\nset -a\nsource .env\nset +a\nmvn spring-boot:run\n访问 http://127.0.0.1:8080',2490,550,1000,300,B,'quickstart',25,30)
card(v,'jar','构建与 JAR 运行［现有］','mvn clean verify\njava -jar target/spring-ai-react-demo-0.0.1-SNAPSHOT.jar\n沿用已加载环境变量；当前 verify 主要验证构建。',2490,875,1000,180,B,'quickstart',24,30)
card(v,'deliverables','上线工程文件［待编写］','Dockerfile · compose.yaml · .dockerignore\napplication-prod.yml · db/migration/ · CI 配置\n发布 / 回滚说明；Dockerfile 完成后再执行：\ndocker build -t agent:VERSION .',2490,1080,1000,220,GR,'quickstart',25,30)

group(v,'dev',80,1410,3440,430,'#F5FBFF','02  开发路线 · 沿现有代码逐步划分职责')
steps=[
 ('contracts','01  契约与身份','api/ · auth/\n请求、结果与错误码\n真实登录上下文与操作权限'),
 ('storage','02  持久状态','persistence/ · db/migration/\nsession / task / request / operation\n原子受理、版本与恢复策略'),
 ('tools','03  工具边界','tools/ · API 适配器\n参数校验、逐次鉴权与超时\n读写分离；未知写入先核实'),
 ('orchestration','04  场景编排','agent/\n领域门控 → Skill / Workflow\n有界 ReAct 与工具结果校验'),
 ('ui','05  会话与界面','api/ · static/ 或现有前端\n服务端保存会话与任务\n结构化回复、澄清与操作状态'),
 ('acceptance','06  联调与验收','真实模型 / 工具联调\n越权、重复提交、超时与恢复\n路由正确率、延迟与成本')]
for i,(key,title,body) in enumerate(steps):
 card(v,key,title,body,120+i*570,1530,520,225,B if i<2 else G if i<4 else T,'dev',27,30)
 if i:edge(v,steps[i-1][0],key)
text(v,'dev-note','阅读入口：AgentController → ReActAgentService → ToolCallback / API 适配器。身份、持久化、幂等由代码实现；模型负责受约束的语义与规划。',120,1787,3360,25,parent='dev')

group(v,'delivery',80,1920,3440,350,'#F9F9F9','03  构建与发布 · 同一镜像从测试环境晋级生产')
pipeline=[('git','Git / 团队 CI','代码与配置资产版本化\n接入版本管理与流水线'),('build','Build & Verify','mvn clean verify\n联调评估与镜像检查'),('registry','OCI 镜像仓库','Docker build / push\n保留 Tag 与 Digest'),('staging','测试环境验收','迁移校验与场景回归\n固定镜像版本准入'),('release','发布与回滚','分批替换与健康检查\n保留前版镜像与配置')]
for i,(key,title,body) in enumerate(pipeline):
 card(v,key,title,body,120+i*680,2020,620,170,GR,'delivery',27,32)
 if i:edge(v,pipeline[i-1][0],key)
text(v,'migration','Flyway 迁移作为受控步骤；数据库变更保持向前兼容，镜像回滚不会自动撤销数据。当前无自动化回归覆盖，构建通过不能替代验收。',120,2216,3360,25,parent='delivery')

group(v,'deploy',80,2350,3440,1090,'#FFFFFF','04  运行部署 · 建议生产拓扑与运维要求',
 '默认建议：既有网关 + Linux VM / Docker + 外置数据库；已有 Kubernetes 时复用平台。')
card(v,'client','浏览器 / App','统一入口与登录态\n只访问应用服务',130,2640,270,180,GR,'deploy',27,30)
card(v,'lb','平台网关 / LB','TLS :443 · 路由与限流\n转发到应用内网端口',490,2640,340,180,B,'deploy',27,30)
group(v,'replicas',960,2510,650,650,'#F5FBFF','Agent 应用 · 建议双副本',
 '相同镜像与配置版本；共享持久状态。','deploy',32)
card(v,'replica-a','副本 A · Spring Boot','Linux VM A · Docker · JRE 21\n请求、会话与任务写入数据库',1000,2660,570,180,B,'replicas',27,30)
card(v,'replica-b','副本 B · Spring Boot','Linux VM B · Docker · JRE 21\n依据持久化状态恢复中断任务',1000,2930,570,180,B,'replicas',27,30)
card(v,'db','PostgreSQL［建议新增］','外置 / 托管；备份与恢复\n会话、任务、请求、操作与审计',1790,2520,580,180,GR,'deploy',27,30)
card(v,'model-api','外部模型服务','经 Spring AI / 模型网关调用\nAPI Key、配额、预算与版本',1790,2780,580,180,V,'deploy',27,30)
card(v,'iam-api','IAM / 业务 API','身份、权限与权威业务事实\n经 IAM 适配器 / 工具网关访问',1790,3040,580,180,G,'deploy',27,30)
edge(v,'client','lb','HTTPS')
edge(v,'lb','replicas',':8080')
edge(v,'replicas','db','JDBC')
edge(v,'replicas','model-api','HTTPS')
edge(v,'replicas','iam-api','受控调用')
text(v,'env-title','环境选择',130,2960,730,30,True,'deploy')
text(v,'env-body','本地 / 测试：Compose，应用 + 数据库。\n生产：两台 VM，容量规格由压测确定。\n已有 K8s：Deployment + Service\n入口复用 Ingress / Gateway。',130,3012,730,27,parent='deploy')
text(v,'state-note','应用副本不依赖本机会话；恢复任务用数据库原子抢占，避免多副本重复执行。\n外部业务 / 模型调用与本地数据库不承诺原子事务；无法核实的写入保持 UNKNOWN。',130,3300,2240,27,parent='deploy')

card(v,'runtime-config','运行配置［待补齐］','SERVER_ADDRESS=0.0.0.0\nSERVER_PORT=8080 · SPRING_PROFILES_ACTIVE=prod\n数据库连接与 LLM Key / 凭证由运行平台注入\n密钥不进入镜像；配置与资产绑定发布版本',2470,2510,1010,250,GR,'deploy',27,32)
card(v,'health','健康检查与停机［待补齐］','启用 liveness / readiness，并控制监控访问\nreadiness 校验 DB；liveness 不探测外部 API\n优雅停机；请求 deadline 与入口超时对齐\n副本替换前确认就绪，异常恢复前一版本',2470,2800,1010,250,T,'deploy',27,32)
card(v,'observability','观测与运行处置［接入现有平台］','Micrometer / Prometheus · 日志 · OTel Trace\n关联 requestId / taskId / 模型与工具调用\n告警：错误率、延迟、成本、未知操作、积压\n写入结果不明先核实；恢复流程原子领取任务',2470,3090,1010,250,T,'deploy',27,32)
text(v,'refs-title','开发参考 · 官方文档',80,3490,3440,32,True)
refs=json.loads((BASE/'original-large-backup/06-tech-stack-delivery.json').read_text())['references']
for i,(title,url) in enumerate(refs):text(v,'ref-'+str(i),title,80+(i%3)*1160,3550+(i//3)*44,1100,25,url=url)
specs.append(v)

runtime=(ROOT/'render.figjam.js').read_text()
for spec in specs:
 path_=ROOT/(spec['key']+'.json')
 path_.write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
 (ROOT/(spec['key']+'.figjam.js')).write_text('const spec='+json.dumps(spec,ensure_ascii=False)+';\n'+runtime)
print(json.dumps([dict(key=s['key'],width=s['width'],height=s['height'],cards=len(s['cards'])) for s in specs],ensure_ascii=False))
