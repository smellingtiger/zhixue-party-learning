export const coldWaveGraphData = {
  id: 'cold-wave',
  label: '寒潮',
  type: 'root',
  description: '寒潮灾害知识体系',
  children: [
    {
      id: 'cold-wave-grade',
      label: '寒潮分级',
      type: 'category',
      description: '按降温幅度和最低气温分级',
      children: [
        {
          id: 'general-cold',
          label: '一般寒潮',
          type: 'subcategory',
          description: '48小时降温≥8℃，最低温≤4℃',
          children: [
            { id: 'general-standard', label: '分级标准', type: 'detail', description: '降温8-10℃' },
          ],
        },
        {
          id: 'strong-cold',
          label: '强/特强寒潮',
          type: 'subcategory',
          description: '48小时降温≥16℃，最低温≤0℃',
          children: [
            { id: 'strong-standard', label: '分级标准', type: 'detail', description: '降温≥16℃' },
          ],
        },
      ],
    },
    {
      id: 'cold-warning',
      label: '预警信号',
      type: 'category',
      description: '寒潮预警四级信号',
      children: [
        {
          id: 'blue-cold',
          label: '蓝色预警',
          type: 'subcategory',
          description: '48小时降温≥8℃，最低温≤4℃',
          children: [
            { id: 'blue-action', label: '防御指南', type: 'detail', description: '注意添衣保暖防冻' },
          ],
        },
        {
          id: 'red-cold',
          label: '红色预警',
          type: 'subcategory',
          description: '24小时降温≥16℃，最低温≤0℃',
          children: [
            { id: 'red-action', label: '紧急防御', type: 'detail', description: '做好防寒保暖应急准备' },
          ],
        },
      ],
    },
    {
      id: 'cold-protection',
      label: '防护措施',
      type: 'category',
      description: '寒潮来临前后防护措施',
      children: [
        {
          id: 'personal-protection',
          label: '个人防护',
          type: 'subcategory',
          description: '注意保暖防寒防冻伤',
          children: [
            { id: 'warm-clothes', label: '保暖衣物', type: 'detail', description: '穿保暖衣物戴手套帽子' },
          ],
        },
        {
          id: 'agriculture-protection',
          label: '农业防护',
          type: 'subcategory',
          description: '农作物和畜禽防寒保暖',
          children: [
            { id: 'greenhouse', label: '大棚保温', type: 'detail', description: '加固大棚加强保温措施' },
          ],
        },
      ],
    },
    {
      id: 'cold-disaster',
      label: '次生灾害',
      type: 'category',
      description: '寒潮引发的次生灾害',
      children: [
        {
          id: 'ice-snow',
          label: '冰冻灾害',
          type: 'subcategory',
          description: '道路结冰影响交通出行',
          children: [
            { id: 'road-ice', label: '道路结冰', type: 'detail', description: '路面湿滑易引发事故' },
          ],
        },
        {
          id: 'freeze-disaster',
          label: '冻害灾害',
          type: 'subcategory',
          description: '低温冻害对农业设施影响',
          children: [
            { id: 'crop-freeze', label: '农作物冻害', type: 'detail', description: '低温导致农作物受冻' },
          ],
        },
      ],
    },
    {
      id: 'cold-emergency',
      label: '应急救援',
      type: 'category',
      description: '寒潮灾害应急救援工作',
      children: [
        {
          id: 'warm-supply',
          label: '保暖物资',
          type: 'subcategory',
          description: '储备和发放保暖物资',
          children: [
            { id: 'supply-reserve', label: '物资储备', type: 'detail', description: '储备棉被棉衣取暖设备' },
          ],
        },
        {
          id: 'vulnerable-group',
          label: '弱势群体保护',
          type: 'subcategory',
          description: '关注老人儿童等弱势群体',
          children: [
            { id: 'elder-care', label: '关爱老人', type: 'detail', description: '上门走访独居老人' },
          ],
        },
      ],
    },
  ],
};
