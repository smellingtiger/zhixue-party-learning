import { NextRequest, NextResponse } from 'next/server';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://192.168.1.212:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'deepseek-r1:14b';

interface DisasterGraphNode {
  id: string;
  label: string;
  type: 'root' | 'category' | 'subcategory' | 'detail';
  description?: string;
  children?: DisasterGraphNode[];
}

interface GenerateGraphRequest {
  disasterType: string;
}

const DISASTER_TEMPLATES: Record<string, string> = {
  '地震': `请为"地震"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"地震灾害知识体系"
2. 包含以下主要分类：成因机制、震级分类、预警监测、应急避险、次生灾害、历史案例、防灾减灾
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,

  '洪水': `请为"洪水（洪涝）"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"洪涝灾害知识体系"
2. 包含以下主要分类：洪水类型、形成原因、预警等级、应急措施、防洪工程、历史案例、灾后重建
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,

  '台风': `请为"台风（热带气旋）"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"台风灾害知识体系"
2. 包含以下主要分类：台风分级、形成机制、路径预测、预警信号、防御措施、风暴潮、历史案例
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,

  '火山爆发': `请为"火山爆发"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"火山灾害知识体系"
2. 包含以下主要分类：火山类型、喷发类型、监测预警、避险方法、次生灾害、世界著名火山、防灾准备
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,

  '泥石流': `请为"泥石流"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"泥石流灾害知识体系"
2. 包含以下主要分类：泥石流类型、形成条件、易发区域、预警识别、逃生方法、防治工程、典型案例
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,

  '海啸': `请为"海啸"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"海啸灾害知识体系"
2. 包含以下主要分类：海啸成因、传播特性、预警系统、避险方法、历史海啸、沿海防护、应急救援
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,

  '龙卷风': `请为"龙卷风"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"龙卷风灾害知识体系"
2. 包含以下主要分类：龙卷风分级、形成条件、预警信号、安全避险、EF等级、历史案例、建筑防护
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,

  '森林火灾': `请为"森林火灾"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"森林火灾知识体系"
2. 包含以下主要分类：火灾类型、起火原因、火险等级、扑救方法、逃生自救、防火措施、典型案例
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,

  '沙尘暴': `请为"沙尘暴"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"沙尘暴灾害知识体系"
2. 包含以下主要分类：沙尘暴分级、形成原因、影响范围、健康防护、农业影响、治理措施、预警预报
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,

  '雪崩': `请为"雪崩"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"雪崩灾害知识体系"
2. 包含以下主要分类：雪崩类型、触发因素、危险区域、识别征兆、逃生方法、救援技术、预防措施
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,

  '干旱': `请为"干旱"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"干旱灾害知识体系"
2. 包含以下主要分类：干旱类型、成因分析、监测指标、影响领域、应对措施、节水技术、历史案例
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`,
};

export async function POST(request: NextRequest) {
  try {
    const body: GenerateGraphRequest = await request.json();
    const { disasterType } = body;

    if (!disasterType) {
      return NextResponse.json(
        { error: '请选择灾害类型' },
        { status: 400 }
      );
    }

    const prompt = DISASTER_TEMPLATES[disasterType] || 
      `请为"${disasterType}"灾害生成一个完整的知识图谱JSON结构。要求：
1. 根节点为"${disasterType}灾害知识体系"
2. 包含5-8个主要分类（如：成因机制、分类标准、预警监测、应急避险、次生灾害、历史案例、防灾减灾等）
3. 每个分类下要有3-5个子类别
4. 每个子类别下要有2-4个具体知识点
5. 每个节点需要有id、label、type、description字段
6. type字段值为：root/category/subcategory/detail
7. 返回格式必须是有效的JSON，不要有任何其他文字说明`;

    console.log(`[灾害图谱] 正在调用 Ollama 生成 ${disasterType} 知识图谱...`);
    console.log(`[灾害图谱] Ollama 地址: ${OLLAMA_BASE_URL}, 模型: ${OLLAMA_MODEL}`);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          num_predict: 4096,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[灾害图谱] Ollama API 错误: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { error: `Ollama API 调用失败: ${response.status}` },
        { status: 500 }
      );
    }

    const data = await response.json();
    let content = data.response?.trim() || '';

    console.log(`[灾害图谱] Ollama 原始响应长度: ${content.length}`);

    let graphData: DisasterGraphNode;

    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        graphData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('无法从响应中提取JSON');
      }
    } catch (parseError) {
      console.error('[灾害图谱] JSON 解析失败，尝试清理后重试...');
      
      const cleanedContent = content
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^[^{]*/, '')
        .replace(/[^}]*$/, '')
        .trim();
      
      const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        graphData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('JSON解析失败');
      }
    }

    console.log(`[灾害图谱] 成功生成 ${disasterType} 知识图谱`);

    return NextResponse.json({
      success: true,
      data: graphData,
      disasterType,
    });

  } catch (error) {
    console.error('[灾害图谱] 生成失败:', error);
    return NextResponse.json(
      { error: `生成知识图谱失败: ${error instanceof Error ? error.message : '未知错误'}` },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    availableDisasters: Object.keys(DISASTER_TEMPLATES),
    ollamaConfig: {
      baseUrl: OLLAMA_BASE_URL,
      model: OLLAMA_MODEL,
    },
  });
}
