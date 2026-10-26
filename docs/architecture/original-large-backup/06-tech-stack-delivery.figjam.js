const spec={"name":"06 开发者技术栈与交付","title":"Agent 平台 · 开发技术栈与交付架构","subtitle":"面向开发者：用什么 → 如何开发 → 如何构建 → 如何部署｜业务无关，基于当前 Java 项目","position":{"x":10280,"y":-3700},"width":3400,"height":4500,"stack":[["backend","服务与构建  [现有]","Java 21 · Maven 3.9.x\nSpring Boot 4.1.1 · Web MVC\nBean Validation · 可执行 JAR\n首版沿用模块化单体服务","existing"],["ai","Agent 与模型接入  [现有]","Spring AI 2.0.1 · BOM 管理\nChatModel + ToolCallingManager\n@Tool / ToolCallback + 业务适配器\n调用外部模型 API，无需本机 GPU","existing"],["frontend","交互与客户端  [现有 / 扩展]","原生 HTML / CSS / JavaScript\nREST 已有；SSE 按交互需求扩展\n可嵌入团队现有管理端\n当前页面无需 Node 前端构建","existing"],["persistence","持久化  [建议新增]","PostgreSQL + Spring JDBC\nFlyway 管理数据库变更\n会话、任务、请求与操作记录\n唯一约束 + 事务 + 版本更新","new"],["security","身份与授权  [建议新增]","Spring Security + IAM 适配器\n逐请求绑定用户、租户与权限\nIAM 支持 JWT 时使用 Resource Server\n其他 Token 按现有协议适配","new"],["observe","可观测性  [部分已有]","已有：Actuator health 与基础日志\n新增：Micrometer → Prometheus 指标\nOpenTelemetry 链路 → 团队监控平台\nrequestId / taskId 关联日志与调用","new"]],"optional":"按需引入：RAG = Spring AI + EmbeddingModel + pgvector；Redis = 热缓存 / 分布式限流；Outbox / MQ = 异步投递；MCP = 工具接入协议。","steps":[["contracts","01  定义契约与身份","api/ · auth/  [建议职责]\n请求、结果、错误码与范围策略\n接入真实登录上下文\n确认操作权限与接口契约"],["storage","02  建立持久状态","persistence/ · db/migration/\nsession / task / request / operation\n唯一约束与原子受理\n任务版本、过期与恢复策略"],["tools","03  封装工具边界","tools/ · 业务 API 适配器\n@Tool → 参数校验 → 鉴权\nAPI 超时、业务错误与结果核实\n读写区分，未知写入不自动重试"],["orchestration","04  实现场景编排","agent/  [在现有代码上拆分]\n领域门控 → Skill / Workflow\n有界 ReAct + 工具结果校验\n轮次、调用数与总耗时预算"],["response","05  接入会话与界面","api/ · static/ 或既有前端\n服务端保存会话与任务状态\n结构化回复、澄清与操作状态\n浏览器不持有模型服务凭证"],["validation","06  联调与上线验收","Maven 构建 + 真实模型 / 工具联调\n越权、重复提交、超时与恢复\n记录路由正确率、延迟与调用成本\n构建通过不能替代功能验收"]],"runbook":[["local","当前本地启动","set -a\nsource .env\nset +a\nmvn spring-boot:run\n打开 http://127.0.0.1:8080"],["jar","当前构建与 JAR 运行","mvn clean verify\njava -jar target/spring-ai-react-demo-0.0.1-SNAPSHOT.jar\n沿用已加载的环境变量。\n当前无自动化测试，verify 主要验证构建。"],["deliverables","上线前需要编写的文件","Dockerfile · compose.yaml · .dockerignore\napplication-prod.yml · db/migration/\nCI 流水线配置 · 发布与回滚说明\n镜像示例（Dockerfile 完成后）：\ndocker build -t agent:VERSION ."]],"pipeline":[["git","Git / 团队 CI","接入版本管理\n代码与配置资产版本化"],["build","Build & Verify","mvn clean verify\n联调评估与镜像检查"],["registry","OCI 镜像仓库","Docker build / push\n保留 Tag 与 Digest"],["staging","测试环境验收","迁移校验与场景回归\n固定镜像版本准入"],["release","发布与回滚","分批替换与健康检查\n保留前版镜像和配置"]],"references":[["Spring AI 版本兼容与 BOM","https://docs.spring.io/spring-ai/reference/getting-started.html"],["Spring AI 工具调用","https://docs.spring.io/spring-ai/reference/api/tools.html"],["Spring Boot SQL 支持","https://docs.spring.io/spring-boot/reference/data/sql.html"],["Spring Security JWT","https://docs.spring.io/spring-security/reference/servlet/oauth2/resource-server/jwt.html"],["Spring Boot 容器镜像","https://docs.spring.io/spring-boot/reference/packaging/container-images/dockerfiles.html"],["Spring Boot 可观测性","https://docs.spring.io/spring-boot/reference/actuator/observability.html"],["Docker Compose 部署","https://docs.docker.com/compose/how-tos/production/"],["Kubernetes Deployment","https://kubernetes.io/docs/concepts/workloads/controllers/deployment/"],["Spring AI pgvector","https://docs.spring.io/spring-ai/reference/api/vectordbs/pgvector.html"]],"evidence":["pom.xml","src/main/resources/application.yml","README.md","src/main/java/com/example/reactdemo/api/AgentController.java","src/main/java/com/example/reactdemo/agent/ReActAgentService.java","src/main/resources/static/"]};

const found=figma.currentPage.children.find(n=>n.type==='SECTION'&&n.name===spec.name);
if(found)return {existing:found.id};
await Promise.all(['Regular','Medium','Bold','Semi Bold'].map(style=>figma.loadFontAsync({family:'Inter',style})));
const probe=figma.createShapeWithText();await figma.loadFontAsync(probe.text.fontName);probe.remove();
const rgb=h=>({r:parseInt(h.slice(1,3),16)/255,g:parseInt(h.slice(3,5),16)/255,b:parseInt(h.slice(5,7),16)/255});
const paint=h=>[{type:'SOLID',color:rgb(h)}];
const nodes={},made=[];
const board=figma.createSection();board.name=spec.name;board.resize(spec.width,spec.height);board.x=spec.position.x;board.y=spec.position.y;board.fills=paint('#FFFFFF');board.placeholder=true;
function section(id,parent,x,y,w,h,fill,name=''){
 const n=figma.createSection();n.name=name;n.resize(w,h);n.fills=paint(fill);parent.appendChild(n);n.x=x;n.y=y;nodes[id]=n;made.push(n.id);return n;
}
function txt(parent,value,x,y,w,fs=26,bold=false){
 const n=figma.createText();n.fontName={family:'Inter',style:bold?'Bold':'Regular'};n.fontSize=fs;n.lineHeight={unit:'PIXELS',value:Math.round(fs*1.45)};n.fills=paint('#1E1E1E');n.characters=value;n.textAutoResize='HEIGHT';n.resize(w,n.height);parent.appendChild(n);n.x=x;n.y=y;made.push(n.id);return n;
}
const measure=figma.createText();measure.fontName={family:'Inter',style:'Medium'};measure.fontSize=26;measure.lineHeight={unit:'PIXELS',value:40};measure.textAutoResize='HEIGHT';
function fitShapeToText(label,w,minH){measure.characters=label;measure.resize(w-64,measure.height);return {w,h:Math.max(minH,Math.ceil((measure.height+64)/8)*8)};}
function card(parent,id,title,body,x,y,w,h,accent='#3DADFF',fill='#FFFFFF'){
 const label=title+(body?'\n'+body:'');const dim=fitShapeToText(label,w,h);const n=figma.createShapeWithText();n.shapeType='SQUARE';n.text.characters=label;n.text.fontSize=26;n.text.lineHeight={unit:'PIXELS',value:40};n.text.setRangeFontName(0,title.length,{family:'Inter',style:'Semi Bold'});n.text.setRangeFontSize(0,title.length,30);n.text.fills=paint('#1E1E1E');n.fills=paint(fill);n.strokes=paint(accent);n.strokeWeight=2;n.resize(dim.w,dim.h);parent.appendChild(n);n.x=x;n.y=y;n.name=id+' · '+title;nodes[id]=n;made.push(n.id);return n;
}
function link(parent,id,a,b,label='',sides=['RIGHT','LEFT'],dash=false){
 const n=figma.createConnector();parent.appendChild(n);n.connectorStart={endpointNodeId:a.id,magnet:sides[0]};n.connectorEnd={endpointNodeId:b.id,magnet:sides[1]};n.connectorLineType='ELBOWED';n.connectorStartStrokeCap='NONE';n.connectorEndStrokeCap='ARROW_LINES';n.strokeWeight=2;n.strokes=paint('#757575');n.dashPattern=dash?[8,6]:[];if(label){n.text.fontName={family:'Inter',style:'Medium'};n.text.fontSize=24;n.text.characters=label;}nodes[id]=n;made.push(n.id);return n;
}
txt(board,spec.title,80,54,3240,66,true);
txt(board,spec.subtitle,80,155,3240,30);
txt(board,'技术选型区：蓝色＝项目已采用　｜　绿色＝上线建议补齐　｜　橙色＝按需启用　｜　版本沿用 pom.xml，不表示已完成上线',80,235,3240,27);

const stack=section('stack',board,80,340,3240,940,'#F5FBFF','01 技术选型');
txt(stack,'01  用什么开发 · 六项技术栈与职责映射',40,24,3160,44,true);
spec.stack.forEach((c,i)=>card(stack,c[0],c[1],c[2],60+(i%3)*1060,130+Math.floor(i/3)*340,1000,280,c[3]==='existing'?'#3DADFF':'#66D575'));
const optional=section('optional',stack,40,810,3160,100,'#FFF7F0');
txt(optional,spec.optional,24,14,3112,27);

const dev=section('development',board,80,1370,2100,1000,'#EBFFEE','02 开发路线');
txt(dev,'02  如何开发 · 从契约到可验证的应用',40,24,2020,42,true);
txt(dev,'编号表示推荐实施顺序；目录为建议职责划分，可沿现有代码逐步拆分',40,86,2020,25);
spec.steps.forEach((c,i)=>card(dev,c[0],c[1],c[2],50+(i%3)*690,150+Math.floor(i/3)*360,620,288,'#66D575'));
link(dev,'d12',nodes.contracts,nodes.storage);
link(dev,'d23',nodes.storage,nodes.tools);
link(dev,'d45',nodes.orchestration,nodes.response);
link(dev,'d56',nodes.response,nodes.validation);
link(dev,'d34',nodes.tools,nodes.orchestration,'',['BOTTOM','TOP']);
txt(dev,'现有阅读入口：AgentController → ReActAgentService → ToolCallback / 业务适配器',40,858,2020,27,true);
txt(dev,'状态持久化、鉴权和可靠写入由代码实现；模型负责语义判断与受约束的工具选择。',40,910,2020,26);

const run=section('runbook',board,2260,1370,1060,1000,'#F9F9F9','本地与交付命令');
txt(run,'开发者启动与交付入口',32,24,996,38,true);
const positions=[108,422,700], heights=[296,248,268];
spec.runbook.forEach((c,i)=>{
 const p=section(c[0],run,32,positions[i],996,heights[i],i===2?'#FFF7F0':'#FFFFFF');
 txt(p,c[1],24,16,948,29,true);txt(p,i===0?'首次：从 .env.example 配好 .env\n'+c[2]:c[2],24,65,948,i<2?24:26);
});

const pipeline=section('pipeline',board,80,2460,3240,400,'#F8F5FF','03 构建与发布');
txt(pipeline,'03  如何交付 · 同一镜像从测试环境晋级生产',40,24,3160,42,true);
spec.pipeline.forEach((c,i)=>card(pipeline,c[0],c[1],c[2],60+i*640,120,560,200,'#874FFF'));
for(let i=0;i<4;i++)link(pipeline,'ci'+i,nodes[spec.pipeline[i][0]],nodes[spec.pipeline[i+1][0]]);
txt(pipeline,'新增 Git / CI 配置后启用。Flyway 迁移作为受控步骤；数据库变更保持向前兼容，镜像回滚不会自动撤销数据。',40,342,3160,25);

const runtime=section('runtime',board,80,2950,3240,1180,'#F1FEFD','04 运行部署');
txt(runtime,'04  如何部署 · 建议生产拓扑与运行要求',40,24,3160,42,true);
txt(runtime,'默认建议：既有网关 + Linux VM / Docker + 外置数据库；已有 Kubernetes 时复用平台，不另建集群。',40,84,3160,26);
card(runtime,'client','浏览器 / App / IM','统一入口与登录态\n只访问应用服务',60,240,420,200,'#3DADFF');
card(runtime,'ingress','平台网关 / 托管 LB','TLS :443 · 路由与限流\n仅转发到应用内网端口',620,240,500,200,'#3DADFF');
const replicas=section('replicas',runtime,1300,150,760,550,'#EBFFEE','应用副本');
txt(replicas,'Agent 应用 · 建议双副本',32,20,696,32,true);
txt(replicas,'相同镜像与配置版本 · 无本机会话依赖',32,72,696,24);
card(replicas,'vmA','副本 A · Spring Boot + JRE 21','Linux VM A · Docker\n请求、任务状态存入数据库',40,126,680,176,'#66D575');
card(replicas,'vmB','副本 B · Spring Boot + JRE 21','Linux VM B · Docker\n故障后依据持久状态恢复',40,338,680,176,'#66D575');
card(runtime,'db','PostgreSQL  [建议新增]','外置 / 托管数据库 · 备份与恢复\n会话、任务、请求、操作与审计',2240,150,940,200,'#66D575');
card(runtime,'llm','模型服务  [外部依赖]','经 Spring AI / Model Gateway 调用\nAPI Key、预算、超时与模型版本',2240,430,940,200,'#874FFF');
card(runtime,'external','IAM / 业务 API  [复用平台]','身份、权限与业务事实来源\n经登录适配器 / 工具网关访问',2240,710,940,200,'#3DADFF');
link(runtime,'client-lb',nodes.client,nodes.ingress,'HTTPS');
link(runtime,'lb-app',nodes.ingress,replicas,'HTTP :8080');
link(runtime,'app-db',replicas,nodes.db,'JDBC');
link(runtime,'app-model',replicas,nodes.llm,'HTTPS');
link(runtime,'app-external',replicas,nodes.external,'受控调用');
const env=section('environment',runtime,60,550,1160,330,'#FFFFFF');
txt(env,'环境选择与扩容',26,18,1108,30,true);
txt(env,'本地 / 测试：Docker Compose，应用 + PostgreSQL。\n生产：两台 VM 各运行同版本容器，规格按压测确定。\n已有 K8s：Deployment + Service + Ingress / Gateway。\n恢复任务使用数据库原子抢占，避免多副本重复执行。',26,78,1108,27);
card(runtime,'runtimeConfig','运行配置  [待新增]','SERVER_ADDRESS=0.0.0.0 · SERVER_PORT=8080\nSPRING_PROFILES_ACTIVE=prod · 数据源配置\nLLM Key / 凭证由运行平台注入，不写入镜像',60,930,980,224,'#FF9E42');
card(runtime,'probes','健康检查与停机  [待补齐]','启用 liveness / readiness 与监控访问控制\nreadiness 校验 DB；liveness 不探测外部 API\n优雅停机、请求 deadline 与入口超时对齐',1100,930,980,224,'#66D575');
card(runtime,'monitoring','监控平台  [复用 / 接入]','Prometheus / 日志 / Trace 平台\n告警：错误率、延迟、成本与未知操作',2240,960,940,200,'#66D575');

txt(board,'实施边界与开发依据',80,4180,3240,34,true);
txt(board,'生产平台、数据库规范、IAM 协议、资源规格与 SLO 待确认；PostgreSQL 是建议基线，可按团队既有标准替换。\n当前依据：pom.xml、application.yml、README 与源码入口；新增依赖、部署文件及生产能力仍需实施。',80,4236,3240,26);
spec.references.forEach((ref,i)=>{
 const n=txt(board,ref[0],80+(i%3)*1080,4330+Math.floor(i/3)*44,1040,23);
 n.setRangeHyperlink(0,n.characters.length,{type:'URL',value:ref[1]});
});
measure.remove();board.placeholder=false;
const overflow=[];
for(const p of [board,...board.findAll(n=>n.type==='SECTION')]){
 for(const n of p.children)if(n.type!=='CONNECTOR'&&(n.x<0||n.y<0||n.x+n.width>p.width+1||n.y+n.height>p.height+1))overflow.push({parent:p.id,node:n.id,name:n.name,x:n.x,y:n.y,w:n.width,h:n.height,parentW:p.width,parentH:p.height});
}
return {rootId:board.id,created:made.length,ids:Object.fromEntries(Object.entries(nodes).map(([k,n])=>[k,n.id])),overflow};

