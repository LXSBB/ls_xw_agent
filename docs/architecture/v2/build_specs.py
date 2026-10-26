"""Editable FigJam view specifications; this script does not call remote services."""
import json
from pathlib import Path

ROOT = Path(__file__).parent
BLUE = '#3DADFF'
GREEN = '#66D575'
VIOLET = '#874FFF'
TEAL = '#5AD8CC'
GRAY = '#B3B3B3'
ORANGE = '#FF9E42'

def view(key, title, subtitle, x, y, footer):
    return dict(key=key, title=title, subtitle=subtitle, position=dict(x=x,y=y),
                width=2400, height=1350, footer=footer, groups=[], cards=[], texts=[], edges=[], paths=[])

def group(v, key, x, y, w, h, fill, title=None):
    v['groups'].append(dict(id=key,x=x,y=y,w=w,h=h,fill=fill,title=title))

def card(v, key, title, body, x, y, w, h=160, accent=BLUE, parent=None, badge=None, fill='#FFFFFF'):
    v['cards'].append(dict(id=key,title=title,body=body,x=x,y=y,w=w,h=h,accent=accent,parent=parent,badge=badge,fill=fill))

def text(v, key, value, x, y, w, size=26, bold=False, color='#505B6C'):
    v['texts'].append(dict(id=key,text=value,x=x,y=y,w=w,size=size,bold=bold,color=color))

def edge(v, a, b, label='', sides=('RIGHT','LEFT'), dashed=False, both=False, color='#757575'):
    v['edges'].append(dict(a=a,b=b,label=label,sides=sides,dashed=dashed,both=both,color=color))

def path(v, key, points, color='#757575', dashed=False, arrow=True):
    v['paths'].append(dict(id=key,points=points,color=color,dashed=dashed,arrow=arrow))

v = view('05a-component-map','05A  /  组件关系','一个应用进程中的职责边界，以及它依赖的外部系统。',6700,-7200,
         '目标设计 · 实线表示调用，虚线表示状态或配置依赖；响应沿调用关系返回。部署位置见 06C。')
group(v,'app',400,260,1430,680,'#F5FBFF','Agent 应用 · 模块化单体')
text(v,'app-caption','同一 Spring Boot 进程；模块可以独立演进，无需先拆微服务。',440,327,1300,24)
card(v,'client','访问渠道','Web / App / API',80,370,250,150,GRAY)
card(v,'runner','请求 Runner','认证上下文 · 请求去重',440,370,300,150,BLUE,'app')
card(v,'router','根编排器','范围门控 · 路由 · 预算',850,370,430,150,BLUE,'app')
card(v,'model','模型网关','分类 / 规划 / 回复接口',1440,370,350,150,VIOLET,'app')
card(v,'provider','模型服务','外部 API · 版本与配额',1960,370,360,150,VIOLET)
card(v,'result','结果与交互','证据校验 · 保存后响应',440,660,300,150,TEAL,'app')
card(v,'runtime','Skill Runtime','Workflow / ReAct · 任务状态',850,660,430,150,GREEN,'app')
card(v,'tools','工具网关','鉴权 · 读写分流 · 适配器',1440,660,350,150,GREEN,'app')
card(v,'external','外部业务系统','业务规则与权威事实',1960,660,360,150,GRAY)
edge(v,'client','runner')
edge(v,'runner','router')
edge(v,'router','model')
edge(v,'model','provider','模型 API')
edge(v,'router','runtime','分发',('BOTTOM','TOP'))
edge(v,'runtime','tools','工具调用')
edge(v,'tools','external','HTTP / RPC')
edge(v,'runtime','result','结果',('LEFT','RIGHT'))
edge(v,'result','runner','最终结果',('TOP','BOTTOM'))
text(v,'shared-model','Runtime 与结果模块按需复用模型网关；模型仅提出决策，由代码执行。',850,866,920,24)
card(v,'state','运行状态库','Runner 管请求 · Runtime 管任务 · 写入协调器管操作',440,1040,840,150,GRAY)
card(v,'assets','版本化配置与资产','Skill / Prompt / Tool Schema · 每个任务绑定版本',1440,1040,880,150,GRAY)
edge(v,'app','state','持久化状态',('BOTTOM','TOP'),True)
text(v,'asset-scope','发布配置供编排器与 Runtime 加载',1470,985,790,24)
specs=[v]

v = view('05b-execution-mechanism','05B  /  执行机制','只读工具与写入工具分路；确定性流程和模型规划受同一边界约束。',9380,-7200,
         '目标设计 · 实线表示执行或结果传递；双向线表示决策与观察；虚线表示未知操作的核实分支。')
text(v,'entry-label','识别与分发',80,244,330,25,True)
card(v,'route','范围与路由','事件优先 · 文本分类',80,320,330,160,BLUE)
card(v,'workflow','Workflow','确定步骤 · 缺参暂停',520,270,360,150,GREEN)
card(v,'react','有界 ReAct','模型决策 ↔ 工具观察',520,510,360,150,VIOLET)
card(v,'gateway','统一工具网关','白名单 · Schema · 权限',1000,400,360,170,GREEN)
card(v,'read','只读适配器','授权后读取外部事实',1500,270,340,150,GREEN)
card(v,'write','写入协调器','先保存 operationId\n再提交外部写入',1500,570,340,170,ORANGE)
card(v,'api','外部 API','返回事实 / 操作回执',2000,400,320,170,GRAY)
card(v,'validate','统一结果校验','Schema · 证据 · 操作状态',1000,870,360,160,TEAL)
card(v,'persist','状态提交','事务保存任务与最终结果',520,870,360,160,TEAL)
card(v,'reply','响应与交互','回复 / 澄清 / 能力说明',80,870,330,160,TEAL)
card(v,'recover','核实与恢复','查回执；无依据保留 UNKNOWN',1500,870,340,160,ORANGE)
edge(v,'route','workflow','执行')
edge(v,'route','react')
edge(v,'workflow','gateway')
edge(v,'react','gateway','',both=True)
edge(v,'gateway','read','读取')
edge(v,'gateway','write','写入')
edge(v,'read','api')
edge(v,'write','api')
path(v,'short-result',[(245,480),(245,760),(940,760),(940,900),(1000,900)])
text(v,'short-result-label','范围外 / 未支持 / 待澄清 → 短路结果',290,712,650,24)
edge(v,'validate','persist','',('LEFT','RIGHT'))
edge(v,'persist','reply','',('LEFT','RIGHT'))
edge(v,'write','recover','UNKNOWN',('BOTTOM','TOP'),True)
edge(v,'recover','validate','核实结果',('LEFT','RIGHT'),True)
path(v,'api-result',[(2160,570),(2160,1080),(1180,1080),(1180,1030)])
text(v,'api-result-label','事实 /\n操作回执',2190,745,130,23)
text(v,'no-tool-result','无需工具时，\n执行器结果直达统一校验。',1000,700,450,24)
group(v,'bounds',80,1120,2240,120,'#F9F9F9')
text(v,'inner','内循环：限制轮数、工具数、耗时与成本',110,1143,715,25,True)
text(v,'outer','重路由：仅无副作用的范围不匹配，限次执行',850,1143,820,25,True)
text(v,'unknown','写入未知：禁止盲目重试',1740,1143,540,25,True)
text(v,'out-of-scope','领域外统一说明“目前无法回答相关问题”；不调用业务工具。',110,1186,2100,23)
specs.append(v)

v = view('06a-technology-map','06A  /  技术栈映射','沿用当前 Java 项目补齐上线能力；颜色标职责，标签标实现状态。',12060,-7200,
         '依据：pom.xml / application.yml / 源码入口。版本沿用当前项目；数据库规范与 IAM 协议待确认。')
text(v,'col1','架构职责',110,270,390,26,True)
text(v,'col2','采用的技术与落点',570,270,1210,26,True)
text(v,'col3','当前状态',1950,270,320,26,True)
rows=[
 ('交互入口','HTML / CSS / JavaScript · REST','static/ 与 AgentController；SSE 根据交互需要扩展','已有',BLUE),
 ('应用服务','Java 21 · Spring Boot 4.1.1 · Maven','Web MVC / Validation；继续使用模块化单体与可执行 JAR','已有',BLUE),
 ('模型与工具','Spring AI 2.0.1 · ChatModel · ToolCallingManager','@Tool / ToolCallback + API 适配器；网关治理仍需补齐','基础已有',VIOLET),
 ('持久状态','PostgreSQL + Spring JDBC + Flyway','建议基线；保存请求、会话、任务、操作与可重放结果','待新增',GRAY),
 ('身份与权限','Spring Security + IAM 适配器','接入用户 / 租户 / 权限；IAM 支持 JWT 时再用 Resource Server','待新增',GREEN),
 ('观测与运维','Actuator → Micrometer / OpenTelemetry → 监控平台','已有 health 与基础日志；指标、链路和告警待接入','部分已有',TEAL),
]
for i,(role,tech,body,status,accent) in enumerate(rows):
    y=332+i*108
    group(v,'row'+str(i),80,y,2240,100,'#F9F9F9' if i%2==0 else '#FFFFFF')
    group(v,'accent'+str(i),80,y,7,100,accent)
    text(v,'role'+str(i),role,110,y+25,390,30,True)
    text(v,'tech'+str(i),tech,570,y+10,1300,28,True,'#1E293B')
    text(v,'body'+str(i),body,570,y+53,1300,23)
    group(v,'badge'+str(i),1950,y+25,270,49,'#FFFFFF')
    text(v,'status'+str(i),status,1980,y+34,220,23,True)
group(v,'optional',80,1040,2240,160,'#FFFBF0')
text(v,'optional-title','按需启用',110,1064,340,30,True)
text(v,'optional-items','RAG / pgvector         Redis         Outbox / MQ         MCP',570,1064,1660,29,True)
text(v,'optional-use','知识检索                         缓存 / 限流      异步投递                  工具协议',570,1112,1660,24)
text(v,'optional-note','有明确场景再引入；首版不以向量库、消息队列或多 Agent 框架为前提。',570,1154,1660,23)
specs.append(v)

v = view('06b-development-delivery','06B  /  开发与交付','先补齐可验证的应用能力，再让同一镜像从测试环境晋级生产。',6700,-5650,
         '交付目标 · 部署文件与 CI 尚待编写。当前 mvn verify 主要验证构建，不代表已有自动化回归覆盖。')
text(v,'dev-label','开发顺序  /  在现有入口上逐步拆分职责',80,250,2100,27,True)
card(v,'contract','01  契约与持久状态','api / auth / persistence\n身份、请求去重、任务版本与操作记录',80,320,700,205,BLUE)
card(v,'implement','02  编排与工具边界','agent / tools\n范围门控、统一网关与受控执行',850,320,700,205,GREEN)
card(v,'verify','03  交互与联调验证','api / static / observability\n真实模型、权限、重复提交与超时恢复',1620,320,700,205,TEAL)
edge(v,'contract','implement')
edge(v,'implement','verify')
text(v,'pipeline-title','交付流水线  /  以不可变镜像版本作为发布单元',80,600,2100,27,True)
steps=[('source','版本输入','Git · 代码与配置资产',BLUE),('ci','CI 校验','构建 · 联调评估',BLUE),('registry','镜像仓库','OCI Tag + Digest',GRAY),('staging','测试环境','迁移校验 · 场景回归',GREEN),('release','生产发布','分批替换 · 健康检查',TEAL)]
for i,(key,title,body,accent) in enumerate(steps):
    card(v,key,title,body,80+i*455,700,370,180,accent)
    if i: edge(v,steps[i-1][0],key)
text(v,'command','mvn clean verify',535,912,370,24,True)
text(v,'same-image','同一 Digest 晋级',1445,912,370,24,True)
text(v,'rollback','异常 → 前版镜像与配置',1900,912,420,24,True)
card(v,'files','需要交付的工程文件','Dockerfile · compose.yaml · application-prod.yml\ndb/migration/ · CI 配置 · 发布与回滚说明',80,1040,1070,170,GRAY)
card(v,'gates','发布边界','迁移采用向前兼容策略；镜像回滚不撤销数据。\n验收关注越权、重复写入、未知状态、延迟与成本。',1210,1040,1110,170,ORANGE)
specs.append(v)

v = view('06c-deployment-topology','06C  /  部署拓扑','建议基线：既有网关 + 双副本应用 + 外置数据库；模型与业务能力复用外部服务。',9380,-5650,
         '目标拓扑 · 部署平台、数据库高可用、资源规格与 SLO 待确认；恢复任务需原子抢占，避免多副本重复执行。')
text(v,'external-label','外部依赖 / 受控出口',1810,250,510,25,True)
group(v,'app',970,310,650,620,'#F5FBFF','应用私网 · 建议双副本')
text(v,'app-desc','相同镜像与配置版本；共享持久状态',1010,385,570,24)
card(v,'a','副本 A · Spring Boot','Linux VM A / Docker · JRE 21',1010,440,570,160,BLUE,'app')
card(v,'b','副本 B · Spring Boot','Linux VM B / Docker · JRE 21',1010,700,570,160,BLUE,'app')
card(v,'client','客户端','Web / App / IM',80,500,260,150,GRAY)
card(v,'gateway','网关 / 托管 LB','TLS :443 · 路由与限流',470,500,340,150,BLUE)
card(v,'db','PostgreSQL','外置 / 托管 · 备份与恢复',1810,310,510,160,GRAY)
card(v,'model','外部模型 API','Key · 配额 · 超时与预算',1810,560,510,160,VIOLET)
card(v,'iam','IAM / 业务 API','身份、权限与权威业务事实',1810,810,510,160,GREEN)
edge(v,'client','gateway','HTTPS')
edge(v,'gateway','app',':8080')
edge(v,'app','db','JDBC')
edge(v,'app','model','HTTPS')
edge(v,'app','iam','受控调用')
text(v,'platform-title','复用已有部署平台',80,790,730,30,True)
text(v,'platform-body','本地 / 测试：Compose\n已有 Kubernetes：Deployment + Service\n入口使用团队现有 Ingress / Gateway',80,843,730,25)
card(v,'config','运行配置与凭证','平台注入所有副本；密钥不进入镜像\nprod Profile · 0.0.0.0:8080 · 数据源',80,1040,730,170,GRAY)
card(v,'monitor','监控与健康检查','指标 / 日志 / Trace → 现有监控平台\n就绪与存活探针 · 优雅停机',970,1040,650,170,TEAL)
edge(v,'app','monitor','采集 / 探测',('BOTTOM','TOP'),True)
text(v,'state-note-title','副本替换不丢任务',1810,1055,510,30,True)
text(v,'state-note','会话、请求、任务与写操作都存入数据库；\n外部调用和本地事务不承诺原子一致。',1810,1106,510,24)
specs.append(v)

runtime=(ROOT/'render.figjam.js').read_text()
for spec in specs:
    (ROOT/(spec['key']+'.json')).write_text(json.dumps(spec,ensure_ascii=False,indent=2)+'\n')
    (ROOT/(spec['key']+'.figjam.js')).write_text('const spec='+json.dumps(spec,ensure_ascii=False)+';\n'+runtime)
print(json.dumps([dict(key=s['key'],title=s['title']) for s in specs],ensure_ascii=False))
