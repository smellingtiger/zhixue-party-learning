export const waterloggingGraphData = {
  id: 'waterlogging',
  label: '城市内涝',
  type: 'root',
  description: '城市内涝知识体系',
  children: [
    {
      id: 'formation-cause',
      label: '形成原因',
      type: 'category',
      description: '内涝形成的自然与人为因素',
      children: [
        {
          id: 'rainfall',
          label: '降雨因素',
          type: 'subcategory',
          description: '短时强降雨超过排水能力',
          children: [
            { id: 'heavy-rain', label: '短时强降雨', type: 'detail', description: '1小时降雨量超过50mm' },
          ],
        },
        {
          id: 'drainage',
          label: '排水系统',
          type: 'subcategory',
          description: '排水管网能力不足',
          children: [
            { id: 'pipe-age', label: '管网老化', type: 'detail', description: '管道淤积堵塞影响排水' },
          ],
        },
      ],
    },
    {
      id: 'warning-level',
      label: '预警等级',
      type: 'category',
      description: '内涝预警分级标准',
      children: [
        {
          id: 'yellow-warning',
          label: '黄色预警',
          type: 'subcategory',
          description: '24小时降雨量达50mm以上',
          children: [
            { id: 'yellow-action', label: '应急响应', type: 'detail', description: '加强巡查监测易涝点' },
          ],
        },
        {
          id: 'red-warning',
          label: '红色预警',
          type: 'subcategory',
          description: '24小时降雨量达250mm以上',
          children: [
            { id: 'red-action', label: '最高响应', type: 'detail', description: '启动全面应急救援' },
          ],
        },
      ],
    },
    {
      id: 'emergency-response',
      label: '应急响应',
      type: 'category',
      description: '各级应急响应措施',
      children: [
        {
          id: 'iv-response',
          label: 'IV级响应',
          type: 'subcategory',
          description: '蓝色预警响应级别',
          children: [
            { id: 'iv-action', label: '值班值守', type: 'detail', description: '24小时在岗监测' },
          ],
        },
        {
          id: 'i-response',
          label: 'I级响应',
          type: 'subcategory',
          description: '红色预警响应级别',
          children: [
            { id: 'i-action', label: '全面动员', type: 'detail', description: '所有力量投入抢险' },
          ],
        },
      ],
    },
    {
      id: 'drainage-measure',
      label: '排涝措施',
      type: 'category',
      description: '城市排涝技术手段',
      children: [
        {
          id: 'pump-drainage',
          label: '机械强排',
          type: 'subcategory',
          description: '使用移动泵车强排积水',
          children: [
            { id: 'mobile-pump', label: '移动泵车', type: 'detail', description: '快速部署抽排积水' },
          ],
        },
        {
          id: 'channel-drainage',
          label: '导流排水',
          type: 'subcategory',
          description: '开挖临时排水沟导流',
          children: [
            { id: 'temp-channel', label: '临时排水沟', type: 'detail', description: '引导积水排入河道' },
          ],
        },
      ],
    },
    {
      id: 'traffic-control',
      label: '交通管制',
      type: 'category',
      description: '积水路段交通管控',
      children: [
        {
          id: 'road-closure',
          label: '道路封闭',
          type: 'subcategory',
          description: '积水深度达标时封闭道路',
          children: [
            { id: 'closure-standard', label: '封闭标准', type: 'detail', description: '积水深度≥30cm封闭' },
          ],
        },
        {
          id: 'detour-guide',
          label: '绕行引导',
          type: 'subcategory',
          description: '通过导航推送绕行方案',
          children: [
            { id: 'nav-push', label: '导航推送', type: 'detail', description: '实时推送绕行路线' },
          ],
        },
      ],
    },
  ],
};
