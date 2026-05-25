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
      description: '按里氏震级（ML）和矩震级（MW）划分地震等级',
      children: [
        {
          id: 'micro-earthquake',
          label: '微震（M<3）',
          type: 'subcategory',
          description: '人体一般感觉不到需仪器记录',
          children: [
            { id: 'micro-range', label: '震级范围', type: 'detail', description: 'M<3.0，每年全球发生约90万次' },
            { id: 'micro-detection', label: '探测方式', type: 'detail', description: '仅地震仪能记录到人无任何感觉' },
          ],
        },
        {
          id: 'small-earthquake',
          label: '小震（3≤M<5）',
          type: 'subcategory',
          description: '室内有感一般不造成破坏',
          children: [
            { id: 'small-range', label: '震级范围', type: 'detail', description: '3.0≤M<5.0，室内多数人有感室外少数人有感' },
            { id: 'small-effect', label: '影响程度', type: 'detail', description: '吊灯摇晃器皿作响但建筑物通常不会受损' },
          ],
        },
        {
          id: 'medium-earthquake',
          label: '中强震（5≤M<7）',
          type: 'subcategory',
          description: '可造成破坏但程度有限',
          children: [
            { id: 'medium-range', label: '震级范围', type: 'detail', description: '5.0≤M<7.0，可造成不同程度破坏' },
            { id: 'medium-damage', label: '破坏特征', type: 'detail', description: '老旧房屋可能倒塌现代建筑出现裂缝家具倾倒' },
            { id: 'medium-casualty', label: '伤亡风险', type: 'detail', description: '可能造成人员伤亡取决于建筑质量和人口密度' },
          ],
        },
        {
          id: 'large-earthquake',
          label: '大地震/强震（7≤M<8）',
          type: 'subcategory',
          description: '可造成严重破坏和重大人员伤亡',
          children: [
            { id: 'large-range', label: '震级范围', type: 'detail', description: '7.0≤M<8.0，释放能量相当于数百万吨TNT炸药' },
            { id: 'large-destruction', label: '破坏规模', type: 'detail', description: '大量建筑倒塌桥梁断裂道路损毁基础设施瘫痪' },
            { id: 'large-casualty-scale', label: '伤亡规模', type: 'detail', description: '可能造成数万至数十万人伤亡如唐山汶川地震' },
          ],
        },
        {
          id: 'giant-earthquake',
          label: '巨大地震（M≥8）',
          type: 'subcategory',
          description: '毁灭性地震全球罕见',
          children: [
            { id: 'giant-range', label: '震级范围', type: 'detail', description: 'M≥8.0，释放能量超过数亿吨TNT如1960智利9.5级地震' },
            { id: 'giant-catastrophe', label: '灾难性后果', type: 'detail', description: '城市毁灭性破坏地形改变海啸等全球性影响' },
            { id: 'giant-frequency', label: '发生频率', type: 'detail', description: '全球平均每年约1次8级以上地震' },
          ],
        },
      ],
    },
    {
      id: 'intensity-grade',
      label: '烈度分级',
      type: 'category',
      description: '中国地震烈度12度表（GB/T 17742-2008）',
      children: [
        {
          id: 'low-intensity-group',
          label: '低烈度区（I-V度）',
          type: 'subcategory',
          description: '轻微感觉到轻微损坏',
          children: [
            { id: 'degree-i-ii', label: 'I-II度 无感-室内个别静中有感', type: 'detail', description: 'I度无感II度室内极少数静止中的人有感觉' },
            { id: 'degree-iii', label: 'III度 室内少数人有感', type: 'detail', description: '悬挂物微动门窗轻微作响' },
            { id: 'degree-iv-v', label: 'IV-V度 多数人有感-普遍有感', type: 'detail', description: 'IV度室内多数室外少数有感V度室内普遍室外多数有感不稳定器物翻倒' },
          ],
        },
        {
          id: 'mid-intensity-group',
          label: '中烈度区（VI-VIII度）',
          type: 'subcategory',
          description: '明显损坏到严重破坏',
          children: [
            { id: 'degree-vi', label: 'VI度 多数人惊慌', type: 'detail', description: '多数人惊逃户外少数家具损坏墙体细微裂缝' },
            { id: 'degree-vii', label: 'VII度 大多数人惊逃', type: 'detail', description: '物体从架子上掉落砖混结构房屋轻度至中度破坏' },
            { id: 'degree-viii', label: 'VIII度 摇晃颠簸', type: 'detail', description: '行走困难结构破坏严重部分房屋严重损坏或毁坏' },
          ],
        },
        {
          id: 'high-intensity-group',
          label: '高烈度区（IX-XII度）',
          type: 'subcategory',
          description: '严重破坏到毁灭性',
          children: [
            { id: 'degree-ix-x', label: 'IX-X度 行走不能-大量建筑倒塌', type: 'detail', description: 'IX度骑自行车的人会摔倒X度山崩地裂大量房屋倒塌' },
            { id: 'degree-xi-xii', label: 'XI-XII度 毁灭性', type: 'detail', description: 'XI度毁灭性破坏XII度地面剧烈变化山河改观一切毁坏' },
          ],
        },
      ],
    },
    {
      id: 'causes-mechanism',
      label: '成因机制',
      type: 'category',
      description: '地震发生的地质成因和力学机制',
      children: [
        {
          id: 'tectonic-earthquake',
          label: '构造地震',
          type: 'subcategory',
          description: '板块运动和断层活动引起的地震占全球90%以上',
          children: [
            { id: 'plate-tectonics', label: '板块构造理论', type: 'detail', description: '地球岩石圈分为六大板块板块边界应力积累释放引发地震' },
            { id: 'fault-types', label: '断层类型', type: 'detail', description: '包括正断层逆断层走滑断层三种基本类型及复合型断层' },
            { id: 'elastic-rebound', label: '弹性回跳理论', type: 'detail', description: '断层两侧岩体弹性变形积累能量超过摩擦力时突然错动释放' },
          ],
        },
        {
          id: 'induced-earthquake',
          label: '诱发地震',
          type: 'subcategory',
          description: '人类活动触发的地震事件',
          children: [
            { id: 'reservoir-induced', label: '水库诱发地震', type: 'detail', description: '大型水库蓄水增加孔隙水压力降低断层面有效正应力触发地震' },
            { id: 'mining-induced', label: '采矿诱发地震', type: 'detail', description: '地下开采导致岩体应力重新分布引发塌陷型或构造型微震' },
            { id: 'fracking-induced', label: ' fracking诱发地震', type: 'detail', description: '页岩气开采高压注水激活地下隐伏断层引发中小地震' },
          ],
        },
        {
          id: 'volcanic-earthquake',
          label: '火山地震',
          type: 'subcategory',
          description: '火山活动伴随的地震现象',
          children: [
            { id: 'volcanic-tectonic', label: '火山构造地震', type: 'detail', description: '岩浆上升过程中引起周围岩体破裂产生的地震' },
            { id: 'volcanic-eruption', label: '喷发震动', type: 'detail', description: '火山爆发时爆炸冲击波引起的地面振动' },
          ],
        },
      ],
    },
    {
      id: 'warning-monitoring',
      label: '预警监测',
      type: 'category',
      description: '地震预警系统和监测网络',
      children: [
        {
          id: 'seismic-network',
          label: '地震台网',
          type: 'subcategory',
          description: '全国地震监测台站网络体系',
          children: [
            { id: 'national-network', label: '国家测震台网', type: 'detail', description: '覆盖全国的1000多个测震台站实时传输数据到国家台网中心' },
            { id: 'regional-network', label: '区域加密台网', type: 'detail', description: '在首都圈川滇等重点区域加密布设提高定位精度' },
            { id: 'station-equipment', label: '观测设备', type: 'detail', description: '宽频带地震计强震仪GNSS位移计等多手段综合观测' },
          ],
        },
        {
          id: 'early-warning-system',
          label: '地震预警系统',
          type: 'subcategory',
          description: '利用P波S波时间差实现秒级预警',
          children: [
            { id: 'p-wave-detection', label: 'P波检测原理', type: 'detail', description: 'P波传播速度约5-7km/s比S波快检测到P波后立即发出预警' },
            { id: 'warning-time-window', label: '预警时间窗口', type: 'detail', description: '距震中越远获得的预警时间越长几十公里外可有数秒到数十秒' },
            { id: 'warning-channels', label: '发布渠道', type: 'detail', description: '电视广播手机APP专用终端多渠道同步推送预警信息' },
          ],
        },
        {
          id: 'preparation-signs',
          label: '前兆异常监测',
          type: 'subcategory',
          description: '地震前的各种异常现象观测',
          children: [
            { id: 'ground-deformation', label: '地形变监测', type: 'detail', description: 'GPS和水准测量监测地壳形变速率变化趋势' },
            { id: 'groundwater-change', label: '地下水异常', type: 'detail', description: '水位突升突降水温变化井水发浑冒泡变色等前兆' },
            { id: 'geo-electromagnetic', label: '地电磁异常', type: 'detail', description: '地电阻率地磁场地电场出现偏离正常背景的变化' },
          ],
        },
      ],
    },
    {
      id: 'emergency-shelter',
      label: '应急避险',
      type: 'category',
      description: '地震发生时的紧急避险方法',
      children: [
        {
          id: 'indoor-evacuation',
          label: '室内避险',
          type: 'subcategory',
          description: '室内人员的标准避险动作',
          children: [
            { id: 'drop-cover-hold', label: '伏地遮挡手抓牢', type: 'detail', description: 'DROP立即蹲下COVER躲在坚固桌下HOLD抓住桌腿直到震动停止' },
            { id: 'safe-corner', label: '生命三角区', type: 'detail', description: '若无法躲入桌下可选择承重墙角落形成三角空间' },
            { id: 'avoid-dangerous-spot', label: '避开危险位置', type: 'detail', description: '远离窗户玻璃门镜子高大家具和可能倾倒的重物' },
          ],
        },
        {
          id: 'outdoor-evacuation',
          label: '室外避险',
          type: 'subcategory',
          description: '室外人员的逃生安全要点',
          children: [
            { id: 'open-area', label: '开阔地带', type: 'detail', description: '迅速转移到公园广场操场等空旷开阔区域' },
            { id: 'away-from-building', label: '远离建筑物', type: 'detail', description: '远离高楼大厦围墙广告牌电线杆玻璃幕墙等危险物' },
            { id: 'protect-head', label: '头部保护', type: 'detail', description: '用书包双手护住头部防止被坠物砸伤' },
          ],
        },
        {
          id: 'special-scenario',
          label: '特殊场景应对',
          type: 'subcategory',
          description: '不同环境下的特殊避险方法',
          children: [
            { id: 'in-car-response', label: '驾车途中', type: 'detail', description: '靠边停车远离桥梁隧道高架路留在车内观察待震动停止后再行驶' },
            { id: 'in-public-place', label: '公共场所', type: 'detail', description: '商场影院听从工作人员指挥有序撤离不要乘坐电梯不要拥挤踩踏' },
            { id: 'in-school', label: '学校教室', type: 'detail', description: '老师组织学生迅速躲避课桌下震动停止后有秩序撤离到操场' },
          ],
        },
      ],
    },
    {
      id: 'disaster-prevention',
      label: '防灾减灾',
      type: 'category',
      description: '地震防灾减灾的综合措施',
      children: [
        {
          id: 'seismic-design-code',
          label: '建筑抗震设计',
          type: 'subcategory',
          description: '建筑工程抗震设防标准和规范',
          children: [
            { id: 'fortification-intensity', label: '抗震设防烈度', type: 'detail', description: '我国分6-9度四档设防烈度北京上海为8度大部分地区6-7度' },
            { id: 'three-level-target', label: '三水准设防目标', type: 'detail', description: '小震不坏中震可修大震不倒的三级性能目标' },
            { id: 'structural-measures', label: '抗震构造措施', type: 'detail', description: '设置圈梁构造柱剪力墙加强节点连接提高整体性和延性' },
          ],
        },
        {
          id: 'existing-building-retrofit',
          label: '既有建筑加固',
          type: 'subcategory',
          description: '对未达标的现有建筑进行抗震加固',
          children: [
            { id: 'risk-survey', label: '风险排查', type: 'detail', description: '全面排查学校医院老旧小区等关键建筑的抗震能力' },
            { id: 'strengthening-methods', label: '加固方法', type: 'detail', description: '包括增设构造柱外包钢加大截面基础隔震等多种技术方案' },
            { id: 'priority-order', label: '优先顺序', type: 'detail', description: '优先加固学校医院等重要公共建筑和人员密集场所' },
          ],
        },
        {
          id: 'public-education-drill',
          label: '公众教育与演练',
          type: 'subcategory',
          description: '提升全民防震意识和自救能力',
          children: [
            { id: 'knowledge-popularization', label: '科普宣传', type: 'detail', description: '通过媒体社区学校开展地震知识普及教育' },
            { id: 'emergency-drill', label: '应急演练', type: 'detail', description: '定期组织地震应急疏散演练让避险动作形成肌肉记忆' },
            { id: 'family-emergency-plan', label: '家庭应急预案', type: 'detail', description: '每个家庭应制定预案确定集合点准备应急包' },
          ],
        },
      ],
    },
  ],
};
