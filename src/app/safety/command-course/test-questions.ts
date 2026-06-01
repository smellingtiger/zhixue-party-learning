export interface TestQuestionData {
  id: string;
  type: 'single' | 'true_false';
  question: string;
  options: { id: string; label: string; text: string }[];
  correctAnswer: string;
  score: number;
  explanation: string;
}

export interface DisasterTestQuestions {
  [key: string]: TestQuestionData[];
}

export const disasterTestQuestions: DisasterTestQuestions = {
  防汛: [
    {
      id: 'flood-1', type: 'single',
      question: '防汛应急响应中，指挥岗位的首要职责是什么？',
      options: [
        { id: 'a', label: 'A', text: '立即向上级汇报灾情' },
        { id: 'b', label: 'B', text: '启动防汛应急预案并组织排涝抢险' },
        { id: 'c', label: 'C', text: '等待上级指示' },
        { id: 'd', label: 'D', text: '联系媒体发布消息' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '防汛应急响应中，指挥岗位的首要职责是立即启动防汛应急预案，组织排水防涝、险情处置等抢险救援工作。及时向上级汇报是必要的，但不能替代立即组织抢险的行动；等待指示会延误最佳抢险时机。',
    },
    {
      id: 'flood-2', type: 'single',
      question: '城市内涝发生时，以下哪项措施是错误的？',
      options: [
        { id: 'a', label: 'A', text: '及时封闭积水路段的交通' },
        { id: 'b', label: 'B', text: '组织抽排设备和人员赶赴积水点' },
        { id: 'c', label: 'C', text: '让行人继续通过积水路段' },
        { id: 'd', label: 'D', text: '开启排水管网闸门加大排水' },
      ],
      correctAnswer: 'c', score: 10,
      explanation: '城市内涝发生时，积水路段可能存在井盖缺失、电线漏电、暗沟等安全隐患，严禁让行人或车辆冒险通过积水路段。正确的做法是封闭道路、设置警示标志，引导行人绕行。',
    },
    {
      id: 'flood-3', type: 'true_false',
      question: '防汛应急响应等级分为四级，Ⅳ级（蓝色）为最低等级。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'a', score: 10,
      explanation: '我国防汛应急响应分为四级：Ⅳ级（蓝色）为一般，Ⅲ级（黄色）为较大，Ⅱ级（橙色）为重大，Ⅰ级（红色）为特别重大。响应等级与灾害严重程度成正比，Ⅰ级最高，Ⅳ级最低。',
    },
    {
      id: 'flood-4', type: 'single',
      question: '防汛期间，地下车库积水深度超过多少时应立即组织车辆转移？',
      options: [
        { id: 'a', label: 'A', text: '10cm' },
        { id: 'b', label: 'B', text: '30cm' },
        { id: 'c', label: 'C', text: '50cm' },
        { id: 'd', label: 'D', text: '100cm' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '地下车库积水深度超过30cm时，大部分轿车排气口已经进水，车辆随时可能熄火甚至发动机严重损坏，此时应立即组织车辆转移或采取挡水措施。10cm虽然需要注意但尚在可控范围，50cm已经非常危险。',
    },
    {
      id: 'flood-5', type: 'single',
      question: '以下哪项不是防汛应急响应的关键措施？',
      options: [
        { id: 'a', label: 'A', text: '巡查堤防和排水设施' },
        { id: 'b', label: 'B', text: '组织低洼地区群众转移' },
        { id: 'c', label: 'C', text: '立即关闭所有城市道路' },
        { id: 'd', label: 'D', text: '启动泵站加大排水力度' },
      ],
      correctAnswer: 'c', score: 10,
      explanation: '防汛应急响应中，应封闭积水严重路段和低洼危险区域，但不应"立即关闭所有城市道路"。正确的做法是根据积水情况有针对性地封闭危险路段，保障安全区域的正常通行，避免过度封闭造成社会秩序混乱。',
    },
    {
      id: 'flood-6', type: 'true_false',
      question: '防汛应急处置过程中，必须持续监测河道水位变化并及时上报。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'a', score: 10,
      explanation: '防汛应急处置的核心是"防"和"排"，持续监测河道、管网水位变化是及时掌握汛情动态、预测发展趋势的关键。必须按照应急预案规定的频次和标准进行监测并及时上报，为指挥决策提供科学依据。',
    },
    {
      id: 'flood-7', type: 'single',
      question: '防汛应急响应中，防汛沙袋主要用于什么目的？',
      options: [
        { id: 'a', label: 'A', text: '铺设临时道路' },
        { id: 'b', label: 'B', text: '构筑挡水围堤和封堵进水口' },
        { id: 'c', label: 'C', text: '填充地面裂缝' },
        { id: 'd', label: 'D', text: '作为临时救生器材' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '防汛沙袋是重要的防汛应急物资，主要用于构筑挡水围堤、封堵地下空间进水口（如地下车库、地铁入口）、加固堤防薄弱部位等，是防止洪水或积水蔓延的有效手段。',
    },
    {
      id: 'flood-8', type: 'single',
      question: '暴雨红色预警发布后，防汛指挥部门应当采取什么措施？',
      options: [
        { id: 'a', label: 'A', text: '加强值班值守' },
        { id: 'b', label: 'B', text: 'Ⅰ级应急响应，全员到岗' },
        { id: 'c', label: 'C', text: '等待降雨结束后再采取行动' },
        { id: 'd', label: 'D', text: '仅关注气象预报' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '暴雨红色预警是最严重的暴雨预警等级，防汛指挥部门应立即启动Ⅰ级应急响应，实行全员到岗24小时值班，所有防汛力量进入临战状态，做好抢险救灾的各项准备。',
    },
    {
      id: 'flood-9', type: 'true_false',
      question: '城市内涝消退后，可以立即恢复正常生产生活秩序。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '内涝消退后不能立即恢复正常秩序，必须先进行安全评估：检查房屋结构安全、排查次生灾害隐患（如地下空洞、地基沉降）、开展环境消杀防止疫情、检查供水供电设施等。确认安全后才能有序恢复正常秩序。',
    },
    {
      id: 'flood-10', type: 'single',
      question: '防汛应急物资储备的重点物资不包括以下哪项？',
      options: [
        { id: 'a', label: 'A', text: '抽水泵和发电机' },
        { id: 'b', label: 'B', text: '防汛沙袋和挡水板' },
        { id: 'c', label: 'C', text: '大型工程机械' },
        { id: 'd', label: 'D', text: '办公桌椅和文件柜' },
      ],
      correctAnswer: 'd', score: 10,
      explanation: '防汛应急物资储备的重点是用于抢险排水、挡水防洪的专用设备和器材，包括抽水泵、发电机、沙袋、挡水板、救生衣、应急照明等。办公桌椅和文件柜属于日常办公用品，不属于防汛应急物资。',
    },
  ],

  森林防火: [
    {
      id: 'forest-1', type: 'single',
      question: '森林火灾扑救中，指挥岗位的首要职责是什么？',
      options: [
        { id: 'a', label: 'A', text: '立即向上级汇报火情' },
        { id: 'b', label: 'B', text: '启动森林火灾应急预案并组织扑救' },
        { id: 'c', label: 'C', text: '等待上级指示' },
        { id: 'd', label: 'D', text: '联系媒体发布消息' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '森林火灾扑救中，指挥岗位的首要职责是立即启动森林火灾应急预案，调集扑火队伍和装备赶赴火场组织开展扑救。及时上报火情是必要的，但不能替代立即组织扑救的行动；等待指示会贻误最佳灭火时机。',
    },
    {
      id: 'forest-2', type: 'single',
      question: '森林火灾扑救的首要原则是什么？',
      options: [
        { id: 'a', label: 'A', text: '保护森林资源' },
        { id: 'b', label: 'B', text: '保障人员安全' },
        { id: 'c', label: 'C', text: '快速扑灭明火' },
        { id: 'd', label: 'D', text: '控制火势蔓延' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '森林火灾扑救的首要原则是"以人为本、安全第一"。扑火人员的生命安全高于一切，必须在确保人员安全的前提下开展扑救。严禁在危险地形（如峡谷、陡坡）盲目扑火，严禁让不具备扑火能力的人员参与灭火。',
    },
    {
      id: 'forest-3', type: 'true_false',
      question: '森林火灾扑救中，应选择在上风向或侧风向位置扑火。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'a', score: 10,
      explanation: '森林火灾扑救中，扑火人员应选择在上风向或侧风向位置进行扑火作业，避免处于下风向被火势包围。这是森林防火扑火的基本安全原则之一。',
    },
    {
      id: 'forest-4', type: 'single',
      question: '以下哪种地形在森林火灾中最危险？',
      options: [
        { id: 'a', label: 'A', text: '平坦开阔地' },
        { id: 'b', label: 'B', text: '山谷和峡谷' },
        { id: 'c', label: 'C', text: '河流附近' },
        { id: 'd', label: 'D', text: '道路旁边' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '山谷和峡谷是森林火灾中最危险的地形。火灾在山谷中会产生"烟囱效应"，火势蔓延速度极快，且逃生路线受限。此外，峡谷中风力风向变化剧烈，容易造成火情突变，威胁扑火人员安全。',
    },
    {
      id: 'forest-5', type: 'single',
      question: '森林火灾预警等级中，红色预警代表什么级别？',
      options: [
        { id: 'a', label: 'A', text: '低火险' },
        { id: 'b', label: 'B', text: '较高火险' },
        { id: 'c', label: 'C', text: '高火险' },
        { id: 'd', label: 'D', text: '极高火险' },
      ],
      correctAnswer: 'd', score: 10,
      explanation: '森林火险预警信号分为四级：蓝色（低火险）、黄色（较低火险）、橙色（较高火险）、红色（极高火险）。红色预警表示当前气象条件极有利于森林火灾的发生和蔓延，必须采取最严格的防火措施。',
    },
    {
      id: 'forest-6', type: 'true_false',
      question: '森林火灾发生后，可以组织未经培训的群众参与扑救。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '森林火灾扑救必须由经过专业培训、具备扑火技能的专业或半专业扑火队伍进行。未经培训的群众缺乏安全意识和扑救技能，参与扑救极易造成人员伤亡。群众可以参与防火宣传、信息报告等辅助工作。',
    },
    {
      id: 'forest-7', type: 'single',
      question: '森林火灾扑救中，"以火攻火"的战术适用于什么情况？',
      options: [
        { id: 'a', label: 'A', text: '火势较小、风力不大时' },
        { id: 'b', label: 'B', text: '火势猛烈、风力较大时' },
        { id: 'c', label: 'C', text: '专业扑火队伍在控制火势时' },
        { id: 'd', label: 'D', text: '火势即将蔓延至居民区时' },
      ],
      correctAnswer: 'c', score: 10,
      explanation: '"以火攻火"（也叫"以火灭火"、"火烧法"）是一种专业扑火战术，由专业扑火队伍在火势可控的范围内主动点燃火线，利用燃烧消耗可燃物来阻止火势蔓延。这需要专业人员和精确判断，不能随意使用。',
    },
    {
      id: 'forest-8', type: 'single',
      question: '森林防火期内，以下哪项行为是允许的？',
      options: [
        { id: 'a', label: 'A', text: '在林区野外用火' },
        { id: 'b', label: 'B', text: '上坟烧纸' },
        { id: 'c', label: 'C', text: '在指定安全区域进行生产用火' },
        { id: 'd', label: 'D', text: '野外露营生火做饭' },
      ],
      correctAnswer: 'c', score: 10,
      explanation: '森林防火期内，严禁在林区野外一切违规用火行为。只有在经过审批的指定安全区域、采取严格防火措施的前提下，才可以进行必要的生产用火。其他选项均属于严格禁止的行为。',
    },
    {
      id: 'forest-9', type: 'true_false',
      question: '森林火灾明火扑灭后，可以不安排人员看守火场。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '森林火灾明火扑灭后，必须安排专人看守火场至少24-48小时，防止死灰复燃。很多森林火灾复燃案例都是因为看守不严、检查不细造成的。只有确认火场完全无明火、无烟雾、无余火后才能撤离看守人员。',
    },
    {
      id: 'forest-10', type: 'single',
      question: '发现森林火灾后，第一时间应拨打什么电话报警？',
      options: [
        { id: 'a', label: 'A', text: '110' },
        { id: 'b', label: 'B', text: '119' },
        { id: 'c', label: 'C', text: '12119（森林火警）' },
        { id: 'd', label: 'D', text: '120' },
      ],
      correctAnswer: 'c', score: 10,
      explanation: '发现森林火灾后，应第一时间拨打12119（全国统一的森林火警电话）报警。110是公安报警电话，119是城市消防电话，120是医疗急救电话。拨打12119可以直接联系到森林防火部门，获得专业的森林火灾处置。',
    },
  ],

  防台风: [
    {
      id: 'typhoon-1', type: 'single',
      question: '台风应急响应中，指挥岗位的首要职责是什么？',
      options: [
        { id: 'a', label: 'A', text: '立即向上级汇报台风路径' },
        { id: 'b', label: 'B', text: '启动防台风应急预案并组织防御' },
        { id: 'c', label: 'C', text: '等待上级指示' },
        { id: 'd', label: 'D', text: '联系媒体发布消息' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '台风应急响应中，指挥岗位的首要职责是立即启动防台风应急预案，组织人员转移、危险区域管控、防御设施加固等各项防御工作。台风有较长的预警期，应提前做好各项防御准备，不能等待上级指示再行动。',
    },
    {
      id: 'typhoon-2', type: 'single',
      question: '台风来临前，以下哪项是最重要的防御措施？',
      options: [
        { id: 'a', label: 'A', text: '加固门窗' },
        { id: 'b', label: 'B', text: '转移危险区域人员' },
        { id: 'c', label: 'C', text: '储备食物和饮用水' },
        { id: 'd', label: 'D', text: '修剪树枝' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '台风来临前，最重要的防御措施是转移危险区域人员。包括低洼易涝区、地质灾害隐患点、危旧房屋、沿海渔排、建筑工地等危险区域的人员必须全部转移至安全地带。"人员安全"是防台风工作的核心。',
    },
    {
      id: 'typhoon-3', type: 'true_false',
      question: '台风预警分为四级，红色预警为最高等级。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'a', score: 10,
      explanation: '台风预警信号分为四级：蓝色（24小时内可能受台风影响）、黄色（24小时内可能受台风影响且风力较大）、橙色（12小时内可能受台风影响且风力很强）、红色（6小时内可能受台风影响且风力极强）。红色预警是最高等级。',
    },
    {
      id: 'typhoon-4', type: 'single',
      question: '台风红色预警发布后，学校和企业应采取什么措施？',
      options: [
        { id: 'a', label: 'A', text: '继续正常上课和上班' },
        { id: 'b', label: 'B', text: '停课、停工、停产' },
        { id: 'c', label: 'C', text: '仅学校停课，企业正常上班' },
        { id: 'd', label: 'D', text: '仅企业停工，学校正常上课' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '台风红色预警发布后，意味着台风将在短时间内严重影响当地，应全面停课、停工、停产、停运。这是最大限度保障人民群众生命安全的必要措施。所有户外作业必须停止，人员应留在安全场所避风。',
    },
    {
      id: 'typhoon-5', type: 'single',
      question: '台风期间，渔船应当如何处理？',
      options: [
        { id: 'a', label: 'A', text: '继续出海作业' },
        { id: 'b', label: 'B', text: '全部回港避风，人员上岸' },
        { id: 'c', label: 'C', text: '就近抛锚等待' },
        { id: 'd', label: 'D', text: '转移到开阔海域' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '台风预警发布后，所有出海渔船必须全部回港避风，船上人员全部上岸转移到安全地带。严禁渔船在台风期间出海或滞留海上，这是防止渔业人员伤亡的关键措施。',
    },
    {
      id: 'typhoon-6', type: 'true_false',
      question: '台风眼经过时风力会暂时减小，此时可以外出活动。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '台风眼经过时风力确实会暂时减小甚至平静，但这是短暂的（通常几十分钟），台风眼过后风力会迅速恢复甚至更强。此时外出活动极其危险，因为随时可能遭遇突发强风和暴雨。必须等到台风完全远离后才能外出。',
    },
    {
      id: 'typhoon-7', type: 'single',
      question: '台风过后，以下哪项工作是首要任务？',
      options: [
        { id: 'a', label: 'A', text: '立即恢复正常生产生活' },
        { id: 'b', label: 'B', text: '排查次生灾害和安全隐患' },
        { id: 'c', label: 'C', text: '开展环境消杀' },
        { id: 'd', label: 'D', text: '统计经济损失' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '台风过后首要任务是排查次生灾害和安全隐患，包括：地质灾害隐患（滑坡、泥石流）、建筑物安全评估、电线杆和树木倒塌、道路桥梁损坏等。只有确认安全后才能逐步恢复正常秩序。',
    },
    {
      id: 'typhoon-8', type: 'single',
      question: '台风防御中，广告牌和高空设施的处置要求是什么？',
      options: [
        { id: 'a', label: 'A', text: '台风过境后再加固' },
        { id: 'b', label: 'B', text: '台风来临前进行加固或拆除' },
        { id: 'c', label: 'C', text: '台风期间进行加固' },
        { id: 'd', label: 'D', text: '无需特别处置' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '台风来临前，必须对广告牌、塔吊、脚手架、室外空调机等高空设施进行加固或拆除。这些设施在强风中容易倒塌或坠落，对行人和车辆构成严重安全威胁。加固工作必须在台风来临前完成，台风期间禁止进行高空作业。',
    },
    {
      id: 'typhoon-9', type: 'true_false',
      question: '台风预警信息只需要通过电视广播发布。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '台风预警信息应通过多种渠道广泛发布，包括：电视广播、手机短信、互联网新媒体、社区喇叭、宣传车、网格员上门通知等。特别要确保预警信息覆盖到渔民、农民、外来人员等所有人群，做到"预警到户、通知到人"。',
    },
    {
      id: 'typhoon-10', type: 'single',
      question: '台风应急物资储备中，以下哪项是不需要的？',
      options: [
        { id: 'a', label: 'A', text: '救生衣和救生圈' },
        { id: 'b', label: 'B', text: '抽水泵和发电机' },
        { id: 'c', label: 'C', text: '沙滩鞋和泳衣' },
        { id: 'd', label: 'D', text: '应急照明和通讯设备' },
      ],
      correctAnswer: 'c', score: 10,
      explanation: '台风应急物资储备主要包括：救生装备（救生衣、救生圈）、排涝设备（抽水泵、发电机）、应急照明、通讯设备、食品饮水、医疗用品等。沙滩鞋和泳衣属于休闲用品，不属于应急物资。',
    },
  ],

  防寒潮: [
    {
      id: 'cold-1', type: 'single',
      question: '寒潮应急响应中，指挥岗位的首要职责是什么？',
      options: [
        { id: 'a', label: 'A', text: '立即向上级汇报降温情况' },
        { id: 'b', label: 'B', text: '启动防寒潮应急预案并组织防御' },
        { id: 'c', label: 'C', text: '等待上级指示' },
        { id: 'd', label: 'D', text: '联系媒体发布消息' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '寒潮应急响应中，指挥岗位的首要职责是立即启动防寒潮应急预案，组织落实供暖保障、防冻设施检查、弱势群体帮扶等各项防御措施。寒潮降温过程有明显的预报期，应提前做好各项准备工作。',
    },
    {
      id: 'cold-2', type: 'single',
      question: '寒潮期间，以下哪类人群是重点保护对象？',
      options: [
        { id: 'a', label: 'A', text: '青壮年' },
        { id: 'b', label: 'B', text: '老人、儿童和流浪人员' },
        { id: 'c', label: 'C', text: '企业职工' },
        { id: 'd', label: 'D', text: '学生' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '寒潮期间，老人、儿童、孕妇、体弱多病者、流浪人员以及室外作业人员是重点保护对象。这些人群御寒能力较差或暴露在寒冷环境中时间长，容易发生冻伤、失温甚至死亡。必须落实入户走访、救助安置等措施。',
    },
    {
      id: 'cold-3', type: 'true_false',
      question: '寒潮预警分为四级，红色预警为最高等级。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'a', score: 10,
      explanation: '寒潮预警信号分为四级：蓝色（48小时内最低气温下降8℃以上）、黄色（24小时内最低气温下降10℃以上）、橙色（24小时内最低气温下降12℃以上）、红色（24小时内最低气温下降16℃以上）。红色预警是最高等级。',
    },
    {
      id: 'cold-4', type: 'single',
      question: '寒潮期间，供暖保障工作的重点是什么？',
      options: [
        { id: 'a', label: 'A', text: '降低供暖温度以节约能源' },
        { id: 'b', label: 'B', text: '确保供暖设施正常运行，提高供暖温度' },
        { id: 'c', label: 'C', text: '暂停供暖进行检查' },
        { id: 'd', label: 'D', text: '减少供暖时间' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '寒潮期间，供暖保障工作的重点是确保供暖设施正常运行，并根据气温变化适当提高供暖温度。供暖是保障人民群众基本生活的重要措施，必须确保24小时不间断供应，严禁以各种理由停暖、减暖。',
    },
    {
      id: 'cold-5', type: 'single',
      question: '寒潮期间，农业防冻的主要措施是什么？',
      options: [
        { id: 'a', label: 'A', text: '停止一切农业活动' },
        { id: 'b', label: 'B', text: '加固温室大棚，采取覆盖保温措施' },
        { id: 'c', label: 'C', text: '露天种植无需防护' },
        { id: 'd', label: 'D', text: '大量浇水降温' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '寒潮期间，农业防冻的主要措施包括：加固温室大棚防止积雪压塌、采取草帘/塑料膜覆盖保温、大棚内使用增温设备、农田灌水防冻（利用水的热容量延缓降温）等。这些措施可以有效减轻低温对农作物的影响。',
    },
    {
      id: 'cold-6', type: 'true_false',
      question: '寒潮预警发布后，只需要关注气温变化，无需关注其他影响。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '寒潮带来的不仅是降温，还可能伴随大风、雨雪冰冻等灾害性天气。需要关注的方面包括：交通影响（道路结冰、高速封闭）、能源供应（用电用气高峰）、农业影响（农作物冻害）、健康影响（呼吸道疾病增多）等。',
    },
    {
      id: 'cold-7', type: 'single',
      question: '寒潮期间，道路结冰应急处置的首要任务是什么？',
      options: [
        { id: 'a', label: 'A', text: '封闭所有道路' },
        { id: 'b', label: 'B', text: '组织除冰融雪，保障交通畅通' },
        { id: 'c', label: 'C', text: '等待气温回升自然融化' },
        { id: 'd', label: 'D', text: '仅清理主干道' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '寒潮期间道路结冰应急处置的首要任务是组织除冰融雪作业，包括撒布融雪剂、人工除冰、机械清扫等，优先保障主干道、医院、学校、交通枢纽等重要路段的通行安全。同时设置警示标志提醒过往车辆减速慢行。',
    },
    {
      id: 'cold-8', type: 'single',
      question: '寒潮红色预警发布后，以下哪项措施是错误的？',
      options: [
        { id: 'a', label: 'A', text: '启动Ⅰ级应急响应' },
        { id: 'b', label: 'B', text: '建议减少户外活动' },
        { id: 'c', label: 'C', text: '继续正常开展户外施工作业' },
        { id: 'd', label: 'D', text: '加强弱势群体救助' },
      ],
      correctAnswer: 'c', score: 10,
      explanation: '寒潮红色预警期间，室外气温极低，继续进行户外施工作业存在严重的冻伤和安全风险。正确的做法是：除应急抢险外，停止一切露天施工作业，将室外作业人员转移至温暖的安全场所。',
    },
    {
      id: 'cold-9', type: 'true_false',
      question: '寒潮期间，使用煤炭取暖时应注意通风防止一氧化碳中毒。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'a', score: 10,
      explanation: '寒潮期间使用煤炭、木炭等取暖时，必须保持室内通风良好，防止一氧化碳积聚导致中毒。每年冬季都有一氧化碳中毒事件发生，多发生在密闭的室内环境中。建议使用清洁能源取暖，如确需使用煤炭，必须安装一氧化碳报警器。',
    },
    {
      id: 'cold-10', type: 'single',
      question: '寒潮应急物资储备中，以下哪项是必需的？',
      options: [
        { id: 'a', label: 'A', text: '防暑降温药品' },
        { id: 'b', label: 'B', text: '棉被、棉衣和取暖设备' },
        { id: 'c', label: 'C', text: '防晒用品' },
        { id: 'd', label: 'D', text: '游泳装备' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '寒潮应急物资储备的重点是保暖御寒和生活保障物资，包括：棉被、棉衣、毛毯等保暖用品；取暖设备（电暖器、煤炉等）；融雪剂和除冰工具；应急食品和饮用水；医疗急救用品等。',
    },
  ],

  防震: [
    {
      id: 'earthquake-1', type: 'single',
      question: '地震应急响应中，指挥岗位的首要职责是什么？',
      options: [
        { id: 'a', label: 'A', text: '立即向上级汇报震情' },
        { id: 'b', label: 'B', text: '启动地震应急预案并组织抢险救援' },
        { id: 'c', label: 'C', text: '等待上级指示' },
        { id: 'd', label: 'D', text: '联系媒体发布消息' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '地震应急响应中，指挥岗位的首要职责是立即启动地震应急预案，组织搜救被埋压人员、疏散危险区域群众、排查次生灾害等各项抢险救援工作。地震发生后黄金救援时间极为宝贵，必须争分夺秒立即行动。',
    },
    {
      id: 'earthquake-2', type: 'single',
      question: '地震发生时，在室内的人员应采取什么避震措施？',
      options: [
        { id: 'a', label: 'A', text: '立即跑出室外' },
        { id: 'b', label: 'B', text: '躲在结实的家具下或卫生间等小空间' },
        { id: 'c', label: 'C', text: '站在窗户旁边' },
        { id: 'd', label: 'D', text: '跳楼逃生' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '地震发生时，室内避震应遵循"伏地、遮挡、手抓牢"的原则：迅速躲在结实的桌子、床等家具下方，或进入卫生间、储藏室等小开间、有管道支撑的空间。不要盲目跑出室外（可能被坠物砸伤），严禁使用电梯和跳楼。',
    },
    {
      id: 'earthquake-3', type: 'true_false',
      question: '地震预警与地震预报是同一个概念。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '地震预警和地震预报是两个不同的概念。地震预报是在地震发生前，根据地震活动规律对可能发生的地震进行预测预报（目前技术尚不成熟）。地震预警是地震已经发生，利用地震波传播速度差，在破坏性地震波到达前发出警报（通常有几秒到几十秒的时间差）。',
    },
    {
      id: 'earthquake-4', type: 'single',
      question: '地震应急响应等级中，Ⅰ级响应针对的是哪种地震灾害？',
      options: [
        { id: 'a', label: 'A', text: '一般地震灾害' },
        { id: 'b', label: 'B', text: '较大地震灾害' },
        { id: 'c', label: 'C', text: '重大地震灾害' },
        { id: 'd', label: 'D', text: '特别重大地震灾害' },
      ],
      correctAnswer: 'd', score: 10,
      explanation: '地震应急响应分为四级：Ⅳ级对应一般地震灾害（4.0-4.9级），Ⅲ级对应较大地震灾害（5.0-5.9级），Ⅱ级对应重大地震灾害（6.0-6.9级），Ⅰ级对应特别重大地震灾害（7.0级以上）。Ⅰ级响应需要调动全国力量参与救援。',
    },
    {
      id: 'earthquake-5', type: 'single',
      question: '地震发生后，以下哪项是最紧迫的工作？',
      options: [
        { id: 'a', label: 'A', text: '统计财产损失' },
        { id: 'b', label: 'B', text: '搜救被埋压人员' },
        { id: 'c', label: 'C', text: '恢复通信' },
        { id: 'd', label: 'D', text: '开展心理援助' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '地震发生后最紧迫的工作是搜救被埋压人员。地震后的72小时是"黄金救援时间"，在此时间内被埋人员的存活率最高。必须在第一时间组织专业救援力量和社会力量开展拉网式搜救，尽最大努力抢救生命。',
    },
    {
      id: 'earthquake-6', type: 'true_false',
      question: '地震发生后，余震不会对救援工作造成影响。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '地震发生后通常伴随多次余震，余震可能导致已经受损的建筑物进一步坍塌，严重威胁救援人员安全。在救援过程中必须时刻注意余震预警，设置安全观察员，发现余震征兆时立即撤离到安全地带。',
    },
    {
      id: 'earthquake-7', type: 'single',
      question: '地震后，安置受灾群众的首选场地应具备什么条件？',
      options: [
        { id: 'a', label: 'A', text: '靠近高层建筑' },
        { id: 'b', label: 'B', text: '开阔平坦、远离危险建筑' },
        { id: 'c', label: 'C', text: '在河道旁边' },
        { id: 'd', label: 'D', text: '在山坡下方' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '地震后安置受灾群众的首选场地应满足：开阔平坦（便于搭建帐篷和活动）、远离危险建筑（防止余震倒塌）、远离河道和山坡（防止次生灾害）、有供水和交通条件。学校操场、体育场馆、公园广场等是理想的临时安置点。',
    },
    {
      id: 'earthquake-8', type: 'single',
      question: '地震后，被困在废墟下的人员应该如何自救？',
      options: [
        { id: 'a', label: 'A', text: '大声呼喊节省体力' },
        { id: 'b', label: 'B', text: '用硬物敲击管道或墙壁发出求救信号' },
        { id: 'c', label: 'C', text: '盲目用力推开废墟' },
        { id: 'd', label: 'D', text: '等待救援不采取任何行动' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '地震被困自救方法：保持冷静，节约体力和水源；用硬物（如石块、铁器）敲击管道、墙壁或地面发出求救信号，因为声音通过固体传播更远；不要盲目呼喊消耗体力；不要盲目用力推开废墟防止引发二次坍塌。',
    },
    {
      id: 'earthquake-9', type: 'true_false',
      question: '地震后只要房屋没有倒塌就可以立即入住。',
      options: [
        { id: 'a', label: 'A', text: '正确' },
        { id: 'b', label: 'B', text: '错误' },
      ],
      correctAnswer: 'b', score: 10,
      explanation: '地震后即使房屋没有倒塌也不能立即入住。必须经专业机构进行房屋安全鉴定，评估建筑结构是否受损、是否存在安全隐患后才能决定是否可以使用。很多看似完好的建筑内部结构可能已经受损，余震时可能坍塌。',
    },
    {
      id: 'earthquake-10', type: 'single',
      question: '家庭地震应急包中，以下哪项物品不是必需的？',
      options: [
        { id: 'a', label: 'A', text: '饮用水和食品' },
        { id: 'b', label: 'B', text: '手电筒和哨子' },
        { id: 'c', label: 'C', text: '电脑和游戏机' },
        { id: 'd', label: 'D', text: '急救药品' },
      ],
      correctAnswer: 'c', score: 10,
      explanation: '家庭地震应急包应包含：饮用水（每人每天3升以上）、应急食品（饼干、压缩干粮等）、手电筒和备用电池、哨子（求救用）、急救药品、口罩、手套、保温毯、重要证件复印件等。电脑和游戏机不属于应急物资。',
    },
  ],
};
