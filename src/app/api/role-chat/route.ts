import { NextRequest, NextResponse } from 'next/server';
import { ollamaChatStream } from '@/lib/emergency-ollama';
import { getCharacter } from '@/lib/emergency-characters';
import { emergencySOPs, type ResponseLevel } from '@/lib/emergency-sops';

function buildRoleSystemPrompt(
  characterId: string,
  level: string,
  scenario: string
): string {
  const character = getCharacter(characterId);
  if (!character) {
    return '';
  }

  const levelKey: ResponseLevel = level as ResponseLevel;
  const levelData = emergencySOPs[levelKey];
  const roleKeyword = character?.title?.replace(/[（(].*[）)]/g, '').trim();
  const roleCard = levelData?.roles?.find(r =>
    r.roleName?.includes(roleKeyword || '') || r.roleName === character?.title
  );

  const manualInstructions = roleCard?.instructions?.join('\n') || '暂无对应指令';

  return `# 角色扮演设定

你现在是【${character.name}】，${character.title}。

## 角色信息
- **职位**：${character.levelName} - ${character.title}
- **性格特点**：${character.personality}
- **说话风格**：${character.speakingStyle}
- **职责**：${character.description}

## 当前场景
${scenario}

## 应急指挥手册指令（你的职责范围内）
${manualInstructions}

---

## 对话规则（必须严格遵守）

1. **角色扮演**：你必须以${character.name}的身份说话，使用第一人称"我"
2. **说话风格**：${character.speakingStyle}，语气符合${character.personality}的特点
3. **专业性**：所有指令和建议必须基于应急指挥手册内容
4. **区分来源**：
   - 如果回答来自手册指令，说"根据应急手册，我需要..."
   - 如果是针对特殊情况的新建议，说"针对当前情况，我建议..."
5. **优先级排序**：当被问到"现在该做什么"时，给出按优先级排序的前三项
6. **互动性**：可以询问用户更多细节（如"积水深度多少？""有没有人员被困？"）
7. **简洁明了**：每条指令不超过两句话，重点突出

## 禁止事项
- 不要说"我是AI"或暴露AI身份
- 不要输出完整的指挥手册
- 不要编造不在手册内的操作流程
`;
}

function buildOpeningMessage(characterId: string, scenario: string): string {
  const character = getCharacter(characterId);
  if (!character) return '';

  const openings: Record<string, string> = {
    'mayor': `我是张明，现在启动应急响应。${scenario}，各单位立即按预案行动。你现在是哪个岗位？告诉我现场情况。`,
    'vice-mayor': `我是李强。${scenario}。各单位注意，我要了解实时监测数据。你负责什么岗位？现场情况如何？`,
    'emergency-bureau': `我是王刚，应急局已启动响应。${scenario}。值班人员就位，信息平台已开启。你那边什么情况？`,
    'urban-management': `我是赵军，城管局已出动。${scenario}。泵车、清淤队伍正在赶往各点位。你是哪个点位？积水情况怎么样？`,
    'traffic-bureau': `我是刘伟，交通局已启动预案。${scenario}。公交线路正在调整，交警已开始疏导。你那边的路况如何？`,
    'public-security': `我是陈勇，公安已部署到位。${scenario}。重点区域警戒已设置，疏导队伍已出动。现场有什么紧急情况？`,
    'health-commission': `我是周敏，卫健委医疗队已待命。${scenario}。各医院急诊已做好准备。有伤员需要转运吗？`,
    'meteorology-bureau': `我是孙磊，气象局持续监测中。${scenario}。雷达、雨量站数据实时更新。你需要了解哪里的雨情？`,
    'subdistrict': `我是吴涛，街道已全面动员。${scenario}。社区通知已发出，隐患排查正在进行。你负责哪个社区？有没有需要转移的群众？`
  };

  return openings[characterId] || `我是${character.name}，${scenario}。请告诉我具体情况。`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { characterId, level, messages, isFirstMessage } = body;

    if (!characterId) {
      return NextResponse.json({ error: '缺少角色ID' }, { status: 400 });
    }

    const character = getCharacter(characterId);
    if (!character) {
      return NextResponse.json({ error: '角色不存在' }, { status: 400 });
    }

    if (isFirstMessage) {
      const levelName = level === 'IV' ? 'IV级（蓝色预警）' : level === 'III' ? 'III级（黄色预警）' : 'II级（橙色预警）';
      const scenario = `当前已启动${levelName}应急响应`;
      const openingMessage = buildOpeningMessage(characterId, scenario);

      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ content: openingMessage })}\n\n`));
          controller.close();
        }
      });

      return new Response(stream, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      });
    }

    const levelName = level === 'IV' ? 'IV级（蓝色预警）' : level === 'III' ? 'III级（黄色预警）' : 'II级（橙色预警）';
    const scenario = `当前已启动${levelName}应急响应`;

    const systemPrompt = buildRoleSystemPrompt(characterId, level, scenario);

    const chatMessages = [
      { role: 'system', content: systemPrompt },
      ...messages
    ];

    const responseStream = await ollamaChatStream(chatMessages);

    return new Response(responseStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      }
    });

  } catch (error) {
    console.error('Role chat error:', error);
    return NextResponse.json({ error: '对话失败' }, { status: 500 });
  }
}
