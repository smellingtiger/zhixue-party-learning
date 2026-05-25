export const forestFireGraphData = {
  id: 'forest-fire',
  label: '森林火灾',
  type: 'root',
  description: '森林火灾知识体系',
  children: [
    {
      id: 'fire-grade',
      label: '火灾分级',
      type: 'category',
      description: '按受害面积划分火灾等级',
      children: [
        {
          id: 'general-fire',
          label: '一般火灾',
          type: 'subcategory',
          description: '受害森林面积1公顷以下',
          children: [
            { id: 'general-area', label: '面积标准', type: 'detail', description: '受害面积<1公顷' },
          ],
        },
        {
          id: 'major-fire',
          label: '重大/特别重大火灾',
          type: 'subcategory',
          description: '受害森林面积100公顷以上',
          children: [
            { id: 'major-area', label: '面积标准', type: 'detail', description: '受害面积≥100公顷' },
          ],
        },
      ],
    },
    {
      id: 'fire-warning',
      label: '火险预警',
      type: 'category',
      description: '森林火险气象预警等级',
      children: [
        {
          id: 'low-risk',
          label: '低度危险',
          type: 'subcategory',
          description: '一级/二级，不易发生森林火灾',
          children: [
            { id: 'low-level', label: '一二等级', type: 'detail', description: '可燃物难燃烧' },
          ],
        },
        {
          id: 'extreme-risk',
          label: '极度危险',
          type: 'subcategory',
          description: '五级，极易发生森林火灾',
          children: [
            { id: 'five-level', label: '五级预警', type: 'detail', description: '严禁一切野外用火' },
          ],
        },
      ],
    },
    {
      id: 'fire-prevention',
      label: '防火措施',
      type: 'category',
      description: '森林火灾预防管理措施',
      children: [
        {
          id: 'fire-control',
          label: '火源管控',
          type: 'subcategory',
          description: '严格管控野外火源',
          children: [
            { id: 'no-fire', label: '禁火令', type: 'detail', description: '高火险期严禁野外用火' },
          ],
        },
        {
          id: 'fire-road',
          label: '防火隔离带',
          type: 'subcategory',
          description: '开设防火隔离带阻止蔓延',
          children: [
            { id: 'isolation', label: '隔离带建设', type: 'detail', description: '提前开辟生物防火林带' },
          ],
        },
      ],
    },
    {
      id: 'fire-rescue',
      label: '扑救方法',
      type: 'category',
      description: '森林火灾扑救战术与技术',
      children: [
        {
          id: 'direct-attack',
          label: '直接扑打',
          type: 'subcategory',
          description: '近距离扑打火线',
          children: [
            { id: 'tool-punch', label: '扑火工具', type: 'detail', description: '使用扑火把风力灭火机' },
          ],
        },
        {
          id: 'water-extinguish',
          label: '以水灭火',
          type: 'subcategory',
          description: '利用水源和消防设备灭火',
          children: [
            { id: 'water-truck', label: '消防水车', type: 'detail', description: '调动消防水车远程供水' },
          ],
        },
      ],
    },
    {
      id: 'escape-self',
      label: '逃生自救',
      type: 'category',
      description: '被困火场时逃生自救方法',
      children: [
        {
          id: 'escape-route',
          label: '安全转移',
          type: 'subcategory',
          description: '选择安全路线撤离火场',
          children: [
            { id: 'wind-direction', label: '逆风撤离', type: 'detail', description: '逆风方向快速撤离' },
          ],
        },
        {
          id: 'emergency-shelter',
          label: '紧急避险',
          type: 'subcategory',
          description: '无法撤离时紧急避险方法',
          children: [
            { id: 'fire-shelter', label: '避险区域', type: 'detail', description: '选择空旷地带卧倒避险' },
          ],
        },
      ],
    },
  ],
};
