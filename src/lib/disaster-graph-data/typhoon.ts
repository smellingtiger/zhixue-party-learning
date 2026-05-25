export const typhoonGraphData = {
  id: 'typhoon',
  label: '台风',
  type: 'root',
  description: '台风灾害知识体系',
  children: [
    {
      id: 'typhoon-grade',
      label: '台风分级',
      type: 'category',
      description: '热带低压到超强台风分级',
      children: [
        {
          id: 'tropical-depression',
          label: '热带低压',
          type: 'subcategory',
          description: '底层中心附近最大风力6-7级',
          children: [
            { id: 'td-wind', label: '风力标准', type: 'detail', description: '风速10.8-17.1m/s' },
          ],
        },
        {
          id: 'super-typhoon',
          label: '超强台风',
          type: 'subcategory',
          description: '底层中心附近最大风力≥16级',
          children: [
            { id: 'st-wind', label: '风力标准', type: 'detail', description: '风速≥51.0m/s' },
          ],
        },
      ],
    },
    {
      id: 'typhoon-warning',
      label: '预警信号',
      type: 'category',
      description: '台风预警四级信号',
      children: [
        {
          id: 'blue-warning',
          label: '蓝色预警',
          type: 'subcategory',
          description: '24小时内可能受台风影响',
          children: [
            { id: 'blue-action', label: '防御指南', type: 'detail', description: '做好防台风准备工作' },
          ],
        },
        {
          id: 'red-warning',
          label: '红色预警',
          type: 'subcategory',
          description: '6小时内可能受台风影响',
          children: [
            { id: 'red-action', label: '紧急防御', type: 'detail', description: '停止集会停课停业' },
          ],
        },
      ],
    },
    {
      id: 'typhoon-defense',
      label: '防御措施',
      type: 'category',
      description: '台风来临前后防护措施',
      children: [
        {
          id: 'before-typhoon',
          label: '台风来临前',
          type: 'subcategory',
          description: '提前做好各项准备',
          children: [
            { id: 'supply-prep', label: '物资储备', type: 'detail', description: '储备食物饮水应急物品' },
          ],
        },
        {
          id: 'during-typhoon',
          label: '台风期间',
          type: 'subcategory',
          description: '台风来袭时安全避险',
          children: [
            { id: 'stay-indoor', label: '室内避险', type: 'detail', description: '远离窗户玻璃门等危险区域' },
          ],
        },
      ],
    },
    {
      id: 'typhoon-disaster',
      label: '次生灾害',
      type: 'category',
      description: '台风引发的次生灾害',
      children: [
        {
          id: 'storm-surge',
          label: '风暴潮',
          type: 'subcategory',
          description: '台风导致海水异常升降',
          children: [
            { id: 'surge-warning', label: '预警监测', type: 'detail', description: '实时监测潮位变化' },
          ],
        },
        {
          id: 'landslide',
          label: '山体滑坡',
          type: 'subcategory',
          description: '强降雨引发山体滑坡',
          children: [
            { id: 'slope-monitor', label: '边坡监测', type: 'detail', description: '加强对高危边坡巡查' },
          ],
        },
      ],
    },
    {
      id: 'typhoon-rescue',
      label: '应急救援',
      type: 'category',
      description: '台风灾害应急救援工作',
      children: [
        {
          id: 'evacuation',
          label: '人员转移',
          type: 'subcategory',
          description: '危险区域人员安全转移',
          children: [
            { id: 'evac-route', label: '转移路线', type: 'detail', description: '预先规划安全转移路线' },
          ],
        },
        {
          id: 'post-disaster',
          label: '灾后恢复',
          type: 'subcategory',
          description: '台风过后恢复重建',
          children: [
            { id: 'damage-assess', label: '灾情评估', type: 'detail', description: '统计受灾情况损失评估' },
          ],
        },
      ],
    },
  ],
};
