/**
 * AI参谋方案生成器
 * 根据当前阶段、玩家角色、剧本进度，调用大模型生成应急处置方案
 */

import type { AgentMessage } from './ai-agents';
import { wuhanScenario, getAdvisorPromptForPhase } from './scenario-data';

// ==================== 大模型API配置 ====================

const API_CONFIG = {
  // 使用本地代理或直连大模型API
  // 这里使用一个通用的fetch接口，实际可根据项目配置调整
  endpoint: '/api/ai/generate-plan',
  timeout: 30000, // 30秒超时
};

// ==================== 方案生成请求参数 ====================

export interface PlanGenerationRequest {
  currentPhaseIndex: number;       // 当前阶段索引
  playerRoleId: string;            // 玩家角色ID
  playerRoleLevel: 'decision' | 'core' | 'collab';  // 玩家角色等级
  playerDepartment: string;        // 玩家所属部门
  currentSituation: string;        // 当前灾情描述
  previousDecisions: string[];     // 之前的决策记录
  userEditedPlan?: string;         // 用户编辑过的方案（用于继续优化）
  conversationHistory?: Array<{    // 对话历史（用于上下文）
    role: 'user' | 'assistant';
    content: string;
  }>;
}

// ==================== 方案生成结果 ====================

export interface PlanGenerationResult {
  success: boolean;
  plan?: string;                   // 生成的方案文本
  error?: string;                  // 错误信息
  metadata?: {
    model?: string;                // 使用的模型
    tokens?: number;               // 消耗的token数
    generationTime?: number;       // 生成耗时（毫秒）
  };
}

// ==================== 核心函数 ====================

/**
 * 生成AI参谋方案（调用大模型API - 流式输出）
 */
export async function generateAIPlanStream(
  request: PlanGenerationRequest,
  onChunk: (chunk: string) => void,
): Promise<PlanGenerationResult> {
  const startTime = Date.now();

  try {
    const phase = wuhanScenario[request.currentPhaseIndex];
    if (!phase) {
      return { success: false, error: '阶段数据不存在' };
    }

    const response = await fetch('/api/ai/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPhaseIndex: request.currentPhaseIndex,
        playerRoleId: request.playerRoleId,
        playerRoleLevel: request.playerRoleLevel,
        playerDepartment: request.playerDepartment,
        currentSituation: request.currentSituation,
        previousDecisions: request.previousDecisions,
        userEditedPlan: request.userEditedPlan,
        phaseName: phase.name,
        responseLevel: phase.responseLevel,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullPlan = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith('data: ')) continue;
        const jsonStr = trimmed.slice(6);
        if (jsonStr === '[DONE]') {
          return {
            success: true,
            plan: fullPlan.trim(),
            metadata: {
              generationTime: Date.now() - startTime,
            },
          };
        }

        try {
          const json = JSON.parse(jsonStr);
          if (json.content) {
            fullPlan += json.content;
            onChunk(json.content);
          }
        } catch {}
      }
    }

    return {
      success: true,
      plan: fullPlan.trim(),
      metadata: {
        generationTime: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      metadata: {
        generationTime: Date.now() - startTime,
      },
    };
  }
}

/**
 * 生成AI参谋方案（非流式，兼容旧接口）
 */
export async function generateAIPlan(request: PlanGenerationRequest): Promise<PlanGenerationResult> {
  const startTime = Date.now();

  try {
    const phase = wuhanScenario[request.currentPhaseIndex];
    if (!phase) {
      return { success: false, error: '阶段数据不存在' };
    }

    const response = await fetch('/api/ai/generate-plan', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        currentPhaseIndex: request.currentPhaseIndex,
        playerRoleId: request.playerRoleId,
        playerRoleLevel: request.playerRoleLevel,
        playerDepartment: request.playerDepartment,
        currentSituation: request.currentSituation,
        previousDecisions: request.previousDecisions,
        userEditedPlan: request.userEditedPlan,
        phaseName: phase.name,
        responseLevel: phase.responseLevel,
      }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const plan = data.plan || '';

    return {
      success: true,
      plan: plan.trim(),
      metadata: {
        generationTime: Date.now() - startTime,
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
      metadata: {
        generationTime: Date.now() - startTime,
      },
    };
  }
}

/**
 * 将方案转换为AgentMessage格式
 */
export function planToAgentMessage(
  plan: string,
  playerDepartment: string
): AgentMessage {
  return {
    agentId: 'ai-advisor',
    agentName: 'AI作战参谋',
    agentDepartment: '智能决策支持',
    message: plan,
    emotion: 'confident',
    timestamp: Date.now(),
  };
}

/**
 * 模拟方案生成（用于无API时的降级处理）
 */
export function generateFallbackPlan(request: PlanGenerationRequest): string {
  const phase = wuhanScenario[request.currentPhaseIndex];
  if (!phase) return '暂无可用数据。';

  const templates: Record<string, Record<string, string>> = {
    decision: {
      'prologue': `【序章·监测预警方案】\n\n一、总体要求\n坚持"预防为主、防治结合"原则，做好入梅初期监测预警工作。\n\n二、指挥体系\n• 指挥长：${playerDepartment}总体协调\n• 气象局：加密监测频次\n• 城管局：排查排水管网\n• 各街道：落实"门前三包"\n\n三、具体措施\n1. 指令气象局24小时监测降雨数据\n2. 城管局完成全市排水管网拉网排查\n3. 预置移动泵车至常发易涝点\n4. 各街道清理社区周边排水口\n5. 建立应急联络机制\n\n四、时间节点\n• 立即：发布预警信息\n• 2小时内：各部门到位\n• 6小时内：完成初步排查\n• 持续：动态监测`,

      'round1-level4': `【Ⅳ级响应·初期处置方案】\n\n一、总体要求\n根据《市防汛抗旱应急预案》Ⅳ级响应要求，立即启动监测预警和初期处置。\n\n二、响应启动\n• 启动Ⅳ级应急响应\n• 成立防汛指挥部\n• 各部门按预案就位\n\n三、具体措施\n1. 指令城管局预置移动泵车至竹叶山立交\n2. 交通局加强积水路段巡查\n3. 应急局做好物资调配准备\n4. 各街道持续关注低洼区域\n5. 建立信息日报制度\n\n四、资源调配\n• 移动泵车2台 → 竹叶山立交\n• 沙袋500个 → 低洼区域\n• 巡查人员 → 各积水点位\n\n五、时间节点\n• 立即：启动响应\n• 30分钟：部署到位\n• 2小时：巡查覆盖\n• 持续：动态监测`,
    },
    core: {
      'prologue': `【序章·部门配合方案】\n\n一、配合目标\n落实本部门职责，配合防汛指挥部做好入梅初期准备工作。\n\n二、具体措施\n1. 按预案要求开展排查工作\n2. 做好物资设备检查\n3. 建立应急联络机制\n4. 及时向指挥部报告情况\n\n三、执行要求\n• 立即响应，启动预案\n• 人员到位，集结队伍\n• 按指令执行任务\n• 及时上报执行情况`,

      'round1-level4': `【Ⅳ级响应·执行方案】\n\n一、执行目标\n按Ⅳ级响应预案要求，落实本部门防汛职责。\n\n二、具体措施\n1. 启动本部门应急预案\n2. 人员全员到岗\n3. 设备物资就位\n4. 加强巡查监测\n5. 及时上报情况\n\n三、配合机制\n• 服从指挥部统一调度\n• 与其他部门协同配合\n• 每2小时上报一次情况\n• 紧急情况随时报告`,
    },
    collab: {
      'prologue': `【序章·协同配合方案】\n\n一、配合目标\n落实本部门职责，配合各方高效处置。\n\n二、本部门职责\n按预案要求落实各项措施。\n\n三、具体措施\n1. 立即响应，启动预案\n2. 人员到位，集结队伍\n3. 按指令执行任务\n4. 及时上报执行情况\n\n四、配合机制\n• 15分钟内启动预案\n• 30分钟内人员到位\n• 每30分钟上报情况\n• 配合其他部门工作`,

      'round1-level4': `【Ⅳ级响应·协同方案】\n\n一、协同目标\n配合防汛指挥部，落实本部门级响应职责。\n\n二、具体措施\n1. 启动应急预案\n2. 加强巡查监测\n3. 做好应急准备\n4. 及时上报情况\n\n三、配合要求\n• 服从统一调度\n• 加强部门协作\n• 及时沟通信息\n• 确保执行到位`,
    },
  };

  const levelTemplates = templates[request.playerRoleLevel] || templates.collab;
  const phaseTemplate = levelTemplates[phase.id] || levelTemplates['prologue'];

  return phaseTemplate.replace('${playerDepartment}', request.playerDepartment);
}
