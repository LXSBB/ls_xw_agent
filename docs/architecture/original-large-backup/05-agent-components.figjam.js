const spec={"title":"Agent 平台 · 组件展开架构","subtitle":"通用场景｜模块职责、调用契约与状态归属｜上线目标设计，非现状全量实现","fileKey":"aWaXku9UJ1Z8yNxp7Xjh06","position":{"x":6700,"y":-3700},"width":3180,"height":3800,"channels":["Web / H5","App / 桌面端","IM / 协作渠道","开放 API / SDK"],"blocks":[{"id":"runner","title":"01  Request Runner · 请求接入与生命周期","subtitle":"代码持有身份、请求状态与返回结果；每个请求一次受理","y":420,"h":370,"tint":"#F9F9F9","color":"#757575","cards":[["adapter","渠道与协议适配  [代码]","HTTP / SSE / 事件回调\n统一消息与交互动作\n输入大小、格式与限流"],["identity","身份上下文  [代码]","登录态 → 用户与租户\n会话归属、权限范围\n凭证留在服务端"],["request","请求受理  [代码]","原子登记 requestId\n已完成：重放保存结果\n进行中：返回请求状态"],["context","上下文装配  [代码]","载入会话与任务版本\n可信状态、最近对话\n建立 deadline / traceId"]]},{"id":"router","title":"02  Root Orchestrator · 识别与分发","subtitle":"语义判断生成候选；确定性策略决定可进入的模块","y":880,"h":400,"tint":"#F5FBFF","color":"#3DADFF","cards":[["event","交互事件路由  [代码]","校验 actionId 与版本\n已知动作恢复目标任务\n自然语言进入意图识别"],["intent","语义分类与抽取  [模型]","应用领域 / 意图 / 参数\n理解追问与多意图\n输出结构化候选路由"],["policy","范围与能力策略  [代码]","范围外 → 范围说明\n领域内未支持 → 能力说明\n不明确 → 澄清；支持 → 执行"],["dispatch","能力分发  [代码]","绑定 Skill / Workflow 版本\n检查场景启用与依赖\n仅独立只读任务可并行"]],"foot":"可选知识路径：通过领域门控后检索；无命中可说明缺少依据，不将检索命中当作执行授权。"},{"id":"skill","title":"03  Skill Runtime · 场景执行容器","subtitle":"每个任务绑定版本与工具范围；以下为同一服务内的逻辑模块","y":1370,"h":930,"tint":"#EBFFEE","color":"#66D575","cards":[["skillLoader","Skill 资产加载  [代码]","scope / facts / tools\n参数与结果 Schema\nPrompt、流程与版本快照"],["task","任务状态管理  [代码]","taskId / taskVersion\n续接、暂停与终止\n并发更新采用版本检查"],["prefetch","依赖数据预取  [代码]","只取当前步骤所需事实\n授权后并发只读工具\n保留来源与有效时间"],["workflow","Workflow 执行器  [代码]","确定步骤与依赖顺序\n参数缺失则暂停等待\n需要语义判断时调用模型"],["react","有界 ReAct 控制器","模型：输出决策 / ToolCall\n代码：预算、停止与回传\n观察结果仅作为数据"],["toolGateway","工具网关  [代码]","工具白名单 + 参数 Schema\n逐次鉴权、租户范围\n服务端凭证注入与脱敏"],["operation","写入操作协调  [代码]","operationId 原子受理\n先记录意图再调用 API\n超时结果不明：核实，不盲重试"],["skillResult","Skill 结果校验  [代码]","校验状态、Schema 与证据\n事实引用真实工具结果\n输出 SkillResult + 状态变更"]],"foot":"内循环：Workflow / ReAct 共用工具网关；模型轮数、工具数、耗时与成本统一计入任务预算。\n外层重路由：只处理范围不匹配且未产生副作用的任务；携带结论，限制次数，禁止无限转交。"},{"id":"reply","title":"04  Result Composer · 结果融合与交互呈现","subtitle":"领域外、澄清、未支持与正常执行，都通过统一结果出口","y":2390,"h":370,"tint":"#F1FEFD","color":"#5AD8CC","cards":[["normalize","结果归一  [代码]","对齐多任务结果与状态\n按证据处理冲突\n保留失败和未完成项"],["compose","回复生成  [代码 / 模型]","优先模板与结构化卡片\n复杂文本可调用模型\n写入结果不被润色改写"],["guard","回答检查  [代码]","事实与来源一致\n未成功不得说已完成\n检查范围与敏感字段"],["interaction","交互动作封装  [代码]","澄清选项 / 继续操作\nactionId 绑定任务与版本\n人工接入按产品需要启用"]]},{"id":"commit","title":"05  State Commit & Delivery · 保存、响应与恢复","subtitle":"业务副作用有独立操作记录；本地状态提交不等于远端业务事务","y":2850,"h":400,"tint":"#F9F9F9","color":"#757575","cards":[["uow","状态提交  [代码]","事务保存会话、任务版本\n回复结果与关联审计\n冲突按任务状态处理"],["respond","同步响应  [代码]","读取已提交的最终结果\nHTTP / SSE final\n可按 requestId 再获取"],["outbox","异步下发  [可选]","结果与 Outbox 同事务\n投递重试 + 消费去重\n用于 IM / 异步通知"],["recovery","恢复与核实  [代码]","扫描中断与未知操作\n按可靠标识查询远端\n无依据保持 UNKNOWN"]],"foot":"流式草稿可先展示；最终结果以保存状态为准。远端业务、模型调用与本地数据库之间不承诺原子事务。"}],"side":[{"id":"requestContract","title":"A · 请求与上下文契约","y":420,"h":370,"tint":"#F9F9F9","lines":["RequestEnvelope","requestId · sessionId · message / action","身份上下文由认证服务生成","userId · tenantId · permissionScope","RunContext","taskId · taskVersion · traceId · deadline"]},{"id":"control","title":"B · 控制面与路由契约","y":880,"h":400,"tint":"#F5FBFF","lines":["RouteDecision","domain · intent · skillId · arguments","执行 / 澄清 / 范围外 / 暂未支持","配置资产","领域定义 · Skill / Tool Schema · Prompt","版本发布 · 灰度绑定 · 快照与回滚"]},{"id":"model","title":"C · Model Gateway · 模型接入","y":1370,"h":420,"tint":"#F8F5FF","lines":["面向分类、规划、回答提供统一接口","按任务配置模型，大小模型可复用","结构化输出校验、并发与超时控制","共享 Token / 调用次数 / 成本预算","记录模型、配置版本与调用耗时","模型不能直接取得凭证或调用外部 API"]},{"id":"adapters","title":"D · 能力适配与知识检索","y":1880,"h":420,"tint":"#FFF7F0","lines":["工具适配：HTTP / RPC / 可选 MCP","外部业务系统保留业务规则与权威数据","读取重试与写入重试采用不同策略","可选 RAG：权限过滤 → 检索 → 证据引用","知识不覆盖实时 API 事实","检索内容与工具结果都不是执行指令"]},{"id":"resultContract","title":"E · 统一结果与操作状态","y":2390,"h":370,"tint":"#F1FEFD","lines":["SkillResult","kind · payload · evidenceRefs · stateDelta","ANSWER / CLARIFY / UNSUPPORTED","OUT_OF_SCOPE / HANDOFF / ERROR","operationStatus 单独保存","提交中 / 成功 / 成功待核实 / 失败 / 未知"]},{"id":"governance","title":"F · 横向治理与运行保障","y":2850,"h":400,"tint":"#F9F9F9","lines":["权限与审计：身份、租户、数据范围","Trace：request → task → model / tool","指标：成功率、延迟、成本、未知操作","告警与处置：超时、错误、配额与积压","发布门禁：回归评估、版本灰度、回滚","秘密配置与日志脱敏贯穿所有模块"]}],"stores":[["stateDb","会话与任务库","会话摘要 · 任务快照 · 版本"],["operationDb","请求与操作记录","请求去重 · 操作状态 · 可重放结果"],["assetStore","配置与资产存储","Skill · Prompt · Schema · 发布版本"],["optionalInfra","按需基础设施","向量索引 / 缓存 / 消息投递设施"]]};

const existing = figma.currentPage.children.find(n=>n.type==='SECTION' && n.name==='05 通用 Agent 组件展开架构');
if(existing) return {existing:existing.id, message:'该图已存在，避免重复创建'};
await Promise.all(['Regular','Medium','Bold','Semi Bold'].map(style=>figma.loadFontAsync({family:'Inter',style})));
const probe=figma.createShapeWithText(); await figma.loadFontAsync(probe.text.fontName); probe.remove();
const color=hex=>({r:parseInt(hex.slice(1,3),16)/255,g:parseInt(hex.slice(3,5),16)/255,b:parseInt(hex.slice(5,7),16)/255});
const paint=hex=>[{type:'SOLID',color:color(hex)}];
const nodes={}, created=[];
const board=figma.createSection(); board.name='05 通用 Agent 组件展开架构'; board.resize(spec.width,spec.height);board.x=spec.position.x;board.y=spec.position.y;board.fills=paint('#FFFFFF');board.placeholder=true;
function section(id,parent,x,y,w,h,fill,name=''){
 const n=figma.createSection();n.name=name; n.resize(w,h);n.fills=paint(fill);parent.appendChild(n);n.x=x;n.y=y;nodes[id]=n;created.push(n.id);return n;
}
function text(parent,s,x,y,w,size=26,bold=false){
 const n=figma.createText();n.fontName={family:'Inter',style:bold?'Bold':'Regular'};n.fontSize=size;n.lineHeight={unit:'PIXELS',value:Math.round(size*1.4)};n.fills=paint('#1E1E1E');n.characters=s;n.textAutoResize='HEIGHT';n.resize(w,n.height);parent.appendChild(n);n.x=x;n.y=y;created.push(n.id);return n;
}
const measurer=figma.createText();measurer.fontName={family:'Inter',style:'Medium'};measurer.fontSize=26;measurer.lineHeight={unit:'PIXELS',value:38};measurer.textAutoResize='HEIGHT';
function fitShapeToText(label,w,minH){
 measurer.characters=label;measurer.resize(w-52,measurer.height);
 return {w,h:Math.max(minH,Math.ceil((measurer.height+60)/8)*8)};
}
function card(parent,id,title,body,x,y,w,minH,accent,fill='#FFFFFF',size=26){
 const label=title+(body?'\n'+body:''); const dim=fitShapeToText(label,w,minH);
 const n=figma.createShapeWithText();n.shapeType=id.startsWith('channel')?'ROUNDED_RECTANGLE':'SQUARE';n.text.characters=label;n.text.fontSize=size;n.text.lineHeight={unit:'PIXELS',value:38};
 n.text.setRangeFontName(0,title.length,{family:'Inter',style:'Semi Bold'});n.text.setRangeFontSize(0,title.length,28);
 n.text.fills=paint('#1E1E1E');n.fills=paint(fill);n.strokes=paint(accent);n.strokeWeight=2;n.resize(dim.w,dim.h);
 parent.appendChild(n);n.x=x;n.y=y;n.name=id+' · '+title;nodes[id]=n;created.push(n.id);return n;
}
function link(id,a,b,label='',dashed=false,sides=['BOTTOM','TOP'],caps=['NONE','ARROW_LINES']){
 const n=figma.createConnector();board.appendChild(n);n.connectorStart={endpointNodeId:a.id,magnet:sides[0]};n.connectorEnd={endpointNodeId:b.id,magnet:sides[1]};n.connectorLineType='ELBOWED';n.connectorStartStrokeCap=caps[0];n.connectorEndStrokeCap=caps[1];n.strokeWeight=2;n.strokes=paint(dashed?'#B3B3B3':'#757575');n.dashPattern=dashed?[8,6]:[];
 if(label){n.text.fontName={family:'Inter',style:'Medium'};n.text.fontSize=24;n.text.characters=label;}
 n.name=id;nodes[id]=n;created.push(n.id);return n;
}
text(board,spec.title,80,56,2820,68,true);
text(board,spec.subtitle,80,160,2900,30);
const channels=section('channels',board,80,240,2040,90,'#FFFFFF');
spec.channels.forEach((s,i)=>card(channels,'channel'+i,s,'',i*516,0,492,90,'#B3B3B3'));
channels.resize(2040,Math.max(...channels.children.map(n=>n.height)));
text(board,'矩形：逻辑模块，不等于独立服务\n实线：调用 / 数据；虚线：契约 / 依赖\n[模型]：语义能力；[可选]：按需接入',2200,240,900,24);
for(const b of spec.blocks){
 const p=section(b.id,board,80,b.y,2040,b.h,b.tint,b.title);
 text(p,b.title,36,18,1960,40,true);text(p,b.subtitle,36,78,1960,25);
 b.cards.forEach((c,i)=>{
  const row=Math.floor(i/4),col=i%4;
  let accent=b.color,fill='#FFFFFF';
  if(c[0]==='intent'||c[0]==='react'||c[0]==='compose') accent='#874FFF';
  if(c[0]==='operation') accent='#FF9E42';
  if(c[0]==='outbox') {accent='#FF9E42';fill='#FFF7F0';}
  card(p,c[0],c[1],c[2],40+col*496,126+row*310,472,b.id==='skill'?252:224,accent,fill);
 });
 if(b.foot)text(p,b.foot,40,b.id==='skill'?776:b.h-42,1960,b.id==='skill'?25:22);
 if(b.id==='skill'){
  const strip=section('loops',p,40,716,1960,52,'#F8F5FF');
  text(strip,'控制边界：模型不直接执行工具；只读预取、确定性流程与 ReAct 统一受网关和预算约束',20,8,1920,25,true);
 }
}
for(const s of spec.side){
 const p=section(s.id,board,2200,s.y,900,s.h,s.tint,s.title);
 text(p,s.title,32,22,836,34,true);
 text(p,s.lines.join('\n'),32,92,836,28);
}
link('channels-runner',nodes.channels,nodes.runner,'统一请求');
link('runner-router',nodes.runner,nodes.router,'RequestEnvelope + RunContext');
link('router-skill',nodes.router,nodes.skill,'已支持的任务 → 执行；其余结果直达 04');
link('skill-reply',nodes.skill,nodes.reply,'SkillResult + stateDelta');
link('reply-commit',nodes.reply,nodes.commit,'ReplyEnvelope + 待保存状态');
link('react-tools',nodes.react,nodes.toolGateway,'',false,['RIGHT','LEFT'],['ARROW_LINES','ARROW_LINES']);
link('tools-operation',nodes.toolGateway,nodes.operation,'',false,['RIGHT','LEFT']);
link('operation-result',nodes.operation,nodes.skillResult,'',false,['RIGHT','LEFT']);
link('request-contract',nodes.runner,nodes.requestContract,'',true,['RIGHT','LEFT'],['NONE','NONE']);
link('route-contract',nodes.router,nodes.control,'',true,['RIGHT','LEFT'],['NONE','NONE']);
link('result-contract',nodes.reply,nodes.resultContract,'',true,['RIGHT','LEFT'],['NONE','NONE']);
link('governance-dependency',nodes.commit,nodes.governance,'',true,['RIGHT','LEFT'],['NONE','NONE']);
const runtimeModel=link('model-dependency',nodes.skill,nodes.model,'',true,['RIGHT','LEFT'],['NONE','NONE']);
runtimeModel.connectorStart={endpointNodeId:nodes.skill.id,magnet:'RIGHT'};
const runtimeTools=link('adapter-dependency',nodes.skill,nodes.adapters,'',true,['RIGHT','LEFT'],['NONE','NONE']);
runtimeTools.connectorStart={endpointNodeId:nodes.skill.id,magnet:'RIGHT'};
const data=section('stores',board,80,3340,2040,290,'#F9F9F9','06 数据与资产');
text(data,'06  数据与资产 · 按职责隔离，不要求拆成多个数据库',36,18,1960,36,true);
spec.stores.forEach((c,i)=>card(data,c[0],c[1],c[2],40+i*496,94,472,148,'#B3B3B3'));
link('commit-store',nodes.commit,data,'持久化结果 / 读取快照');
const deploy=section('deployment',board,2200,3340,900,290,'#FFFBF0','部署边界');
text(deploy,'落地与部署边界',32,22,836,34,true);
text(deploy,'首版：模块化 Spring Boot 应用 + 数据库\n模型、登录与业务 API 复用现有平台\nRAG / 异步消息 / 人工接入按需启用\n远端幂等与核实能力须以接口契约确认',32,92,836,27);
text(board,'状态归属：Runner 管请求；任务模块管会话与任务；写入协调器管操作；外部系统拥有最终业务事实。',80,3670,3020,28,true);
text(board,'参考图的分层与嵌套方式；不绑定具体业务。所有循环上限、并行度和时间预算由发布配置明确，不视为无限自治。',80,3725,3020,25);
measurer.remove();
board.placeholder=false;
const overflow=[];
for(const p of [board,...Object.values(nodes).filter(n=>n.type==='SECTION')]){
 for(const n of p.children){if(n.type!=='CONNECTOR'&&(n.x<0||n.y<0||n.x+n.width>p.width+1||n.y+n.height>p.height+1))overflow.push({parent:p.id,node:n.id,name:n.name,x:n.x,y:n.y,w:n.width,h:n.height,parentW:p.width,parentH:p.height});}
}
return {rootId:board.id,width:board.width,height:board.height,ids:Object.fromEntries(Object.entries(nodes).map(([k,v])=>[k,v.id])),created:created.length,overflow};

