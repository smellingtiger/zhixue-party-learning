export const earthquakeGraphData = {
  id: 'earthquake',
  label: '地震',
  type: 'root',
  description: '地震灾害知识体系',
  children: [
    {
      id: 'magnitude-grade',
      label: '震级分级',
      type: 'category',
      description: '按里氏震级划分地震等级',
      children: [
        {
          id: 'minor-quake',
          label: '微震/小震',
          type: 'subcategory',
          description: '震级小于3级，人体一般感觉不到',
          children: [
            { id: 'micro-range', label: '震级范围', type: 'detail', description: 'M<3，仪器可记录' },
          ],
        },
        {
          id: 'strong-quake',
          label: '强震/巨大地震',
          type: 'subcategory',
          description: '震级大于等于6级，破坏性强',
          children: [
            { id: 'strong-range', label: '震级范围', type: 'detail', description: 'M≥6，造成严重破坏' },
          ],
        },
      ],
    },
    {
      id: 'intensity-grade',
      label: '烈度分级',
      type: 'category',
      description: '中国地震烈度12度分级',
      children: [
        {
          id: 'low-intensity',
          label: '低烈度',
          type: 'subcategory',
          description: 'I-V度，轻微感觉到少数损坏',
          children: [
            { id: 'iii-degree', label: 'III度', type: 'detail', description: '室内少数人有感' },
          ],
        },
        {
          id: 'high-intensity',
          label: '高烈度',
          type: 'subcategory',
          description: 'IX-XII度，严重破坏到毁灭性',
          children: [
            { id: 'xi-degree', label: 'XI度', type: 'detail', description: '大量建筑倒塌' },
          ],
        },
      ],
    },
    {
      id: 'earthquake-warning',
      label: '预警监测',
      type: 'category',
      description: '地震预警系统与技术',
      children: [
        {
          id: 'seismic-network',
          label: '地震台网',
          type: 'subcategory',
          description: '地震监测台站网络布局',
          children: [
            { id: 'station-layout', label: '台站布设', type: 'detail', description: '合理布局提高监测精度' },
          ],
        },
        {
          id: 'early-warning',
          label: '预警发布',
          type: 'subcategory',
          description: '利用P波S波时间差预警',
          children: [
            { id: 'p-wave', label: 'P波检测', type: 'detail', description: '检测到P波后快速预警' },
          ],
        },
      ],
    },
    {
      id: 'earthquake-shelter',
      label: '应急避险',
      type: 'category',
      description: '地震发生时应急避险方法',
      children: [
        {
          id: 'indoor-shelter',
          label: '室内避险',
          type: 'subcategory',
          description: '伏地、遮挡、手抓牢原则',
          children: [
            { id: 'drop-cover', label: '伏地遮挡', type: 'detail', description: '躲在坚固家具下保护头部' },
          ],
        },
        {
          id: 'outdoor-shelter',
          label: '室外避险',
          type: 'subcategory',
          description: '远离建筑物和危险设施',
          children: [
            { id: 'open-area', label: '开阔地带', type: 'detail', description: '迅速转移到空旷区域' },
          ],
        },
      ],
    },
    {
      id: 'earthquake-reduction',
      label: '防灾减灾',
      type: 'category',
      description: '地震防灾减灾措施',
      children: [
        {
          id: 'seismic-design',
          label: '建筑抗震',
          type: 'subcategory',
          description: '建筑物抗震设计与加固',
          children: [
            { id: 'seismic-code', label: '抗震规范', type: 'detail', description: '按抗震设防烈度设计' },
          ],
        },
        {
          id: 'public-education',
          label: '公众教育',
          type: 'subcategory',
          description: '地震防灾知识普及培训',
          children: [
            { id: 'drill-training', label: '应急演练', type: 'detail', description: '定期开展防震演练' },
          ],
        },
      ],
    },
  ],
};
