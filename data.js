const DATA_VERSION = "2";
const INITIAL_CHARACTERS = [
  {
    id: "edelgard",
    name: "艾黛尔贾特",
    house: "黑鹫",
    houseColor: "#8d332d",
    lostItems: ["白色手套", "古老的羽毛笔", "东方瓷器"],
    favoriteTeas: ["香柠檬茶"],
    favoritegifts: ["熊玩具", "帝王学之书", "桌面游戏", "康乃馨", "柠檬草"],
    portrait: "portraits/edelgard.png",
    recruited: true
  },
  {
    id: "hubert",
    name: "修伯特",
    house: "黑鹫",
    houseColor: "#8d332d",
    lostItems: ["可疑的手帕", "弗雷斯贝尔古战争论", "折叠式剃刀"],
    favoriteTeas: ["鞑古扎风味茶", "肉桂茶"],
    favoritegifts: ["特芙豆", "桌面游戏", "芙朵拉史书"],
    portrait: "portraits/hubert.png",
    recruited: true
  },
  {
    id: "ferdinand",
    name: "菲尔迪南特",
    house: "黑鹫",
    houseColor: "#8d332d",
    lostItems: ["装有茶叶的小袋子","农场租税的报告书","武具用的油壶"],
    favoriteTeas: ["东方风味茶","南方果茶","赛罗司茶"],
    favoritegifts: ["骑马用靴子","刀具用磨刀石","红茶的茶叶"],
    portrait: "portraits/hubert.png",
    recruited: true
  },
  {
    id: "ferdinand",
    name: "菲尔迪南特",
    house: "黑鹫",
    houseColor: "#8d332d",
    lostItems: ["装有茶叶的小袋子","农场租税的报告书","武具用的油壶"],
    favoriteTeas: ["东方风味茶","南方果茶","赛罗司茶"],
    favoritegifts: ["骑马用靴子","刀具用磨刀石","红茶的茶叶"],
    portrait: "portraits/ferdinand.png",
    recruited: true
  },
  {
    id: "linhardt",
    name: "林哈尔特",
    house: "黑鹫",
    houseColor: "#8d332d",
    lostItems: [ "羽绒枕","四圣人的真相","以魔法操控的假饵"],
    favoriteTeas: ["东方风味茶","草本茶"],
    favoritegifts: ["美味的烤点心","图解纹章","钓鱼用浮标"],
    portrait: "portraits/linhardt.png",
    recruited: true
  },
  {
    id: "caspar",
    name: "卡斯帕尔",
    house: "黑鹫",
    houseColor: "#8d332d",
    lostItems: ["有破洞的上衣","「雷霆」的仿剑","防雷的护身符"],
    favoriteTeas: ["姜茶"],
    favoritegifts: ["训练用重物","刀具用磨刀石","狩猎用短剑","烟熏肉"],
    portrait: "portraits/caspar.png",
    recruited: true
  }, 
 {
    id: "bernadetta",
    name: "贝尔娜提塔",
    house: "黑鹫",
    houseColor: "#8d332d",
    lostItems: ["刺绣针及卷线筒","鲜艳的花朵静物画","刺猬图样的置物盒"],
    favoriteTeas: ["莓茶","蜜渍水果茶"],
    favoritegifts: ["熊玩具","乐谱集","浇花器","美丽的风景画","美丽的手帕","莱佛士猪笼草"],
    portrait: "portraits/bernadetta.png",
    recruited: true
  },  
{
    id: "dorothea",
    name: "多洛缇雅",
    house: "黑鹫",
    houseColor: "#8d332d",
    lostItems: ["魔银的胸饰","奇迹的歌姬的传单","玳瑁制的梳子"],
    favoriteTeas: ["苹果茶","莓茶"],
    favoritegifts: ["乐谱集","装饰用辉石","时髦的发饰"],
    portrait: "portraits/dorothea.png",
    recruited: true
  },
  {
    id: "petra",
    name: "佩托拉",
    house: "黑鹫",
    houseColor: "#8d332d",
    lostItems: ["鲜艳的羽毛饰品","小张鞣制皮革","写满笔记的辞典"],
    favoriteTeas: ["四种香料茶","姜茶"],
    favoritegifts: ["狩猎用短剑","异国辛香料","烟熏肉","向日葵"],
    portrait: "portraits/petra.png",
    recruited: true
  },

  {
    id: "dimitri",
    name: "帝弥托利",
    house: "青狮",
    houseColor: "#2b306a",
    lostItems: ["磨钝的长剑", "黑色皮革手套", "训练记录"],
    favoriteTeas: ["洋甘菊花茶"],
    favoritegifts: ["训练用重物", "刀具用磨刀石", "骑马用靴子", "装饰用的剑"],
    portrait: "portraits/dimitri.png",
    recruited: false
  },
  {
    id: "claude",
    name: "库罗德",
    house: "金鹿",
    houseColor: "#877a24",
    lostItems: ["皮革弓套", "腹泻灵药", "桌面游戏的棋子"],
    favoriteTeas: ["东方风味茶", "三日月茶"],
    favoritegifts: ["骑马用靴子", "图解纹章", "异国辛香料", "桌面游戏"],
    portrait: "portraits/claude.png",
    recruited: false
  },
  {
    id: "jeritza",
    name: "伊艾里扎",
    house: "教会",
    houseColor: "#696969",
    lostItems: ["铠甲扣具", "黑色发绳", "装着糖果的瓶子"],
    favoriteTeas: ["苹果茶", "蜜渍水果茶","南方果茶", "莓茶"],
    favoritegifts: ["美味的烤点心", "刀具用磨刀石", "狩猎用短剑", "玫瑰"],
    portrait: "portraits/jeritza.png",
    recruited: true
  },
  {
    id: "yuri",
    name: "尤里斯",
    house: "灰狼",
    houseColor: "#5f5a6f",
    lostItems: ["化妆笔", "奇怪的骰子"],
    favoriteTeas: ["莓茶", "蜜渍水果茶","赛罗司茶"],
    favoritegifts: ["美味的烤点心", "女神像的木雕", "桌面游戏", "算数课本"],
    portrait: "portraits/yuri.png",
    recruited: true
  },
];

const INITIAL_SUPPORTS = [
  {
    pair: ["edelgard", "hubert"],
    ranks: ["C", "B", "A"],
    completed: []
  },
  {
    pair: ["edelgard", "dimitri"],
    ranks: ["C", "B", "A"],
    completed: ["C"]
  }
];

const INITIAL_ITEMS = {
  teas: [
    "香柠檬茶", "洋甘菊花茶", "东方风味茶", "三日月茶",
    "苹果茶", "蜜渍水果茶", "南方果茶", "莓茶",
    "鞑古扎风味茶", "肉桂茶", "赛罗司茶"
  ],
  gifts: [
    "熊玩具", "帝王学之书", "桌面游戏", "康乃馨", "柠檬草",
    "特芙豆", "芙朵拉史书", "训练用重物", "刀具用磨刀石",
    "骑马用靴子", "装饰用的剑", "图解纹章", "异国辛香料",
    "美味的烤点心", "狩猎用短剑", "玫瑰", "女神像的木雕", "算数课本"
  ]
};