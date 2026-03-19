import { DailyItinerary, Expense } from './types';

export const HANGZHOU_ITINERARY: DailyItinerary[] = [
  {
    date: '2026-03-19',
    weather: { temp: '15°C', condition: '多雲', suggestion: '建議穿著輕便夾克。☁️', icon: 'Cloud' },
    hourlyForecast: [
      { time: '12:00', temp: '15°C', condition: '多雲' },
      { time: '15:00', temp: '16°C', condition: '多雲' },
      { time: '18:00', temp: '14°C', condition: '陰天' },
      { time: '21:00', temp: '12°C', condition: '陰天' },
    ],
    items: [
      { 
        id: '1-1', 
        time: '09:30', 
        title: '出門', 
        location: '家', 
        category: 'transport', 
        description: '準備出發前往松山機場。', 
        imageUrl: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=800',
          'https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=800',
          'https://images.unsplash.com/photo-1500835595327-8307e770df2a?q=80&w=800',
          'https://images.unsplash.com/photo-1436491865332-7a61a109c055?q=80&w=800'
        ]
      },
      { 
        id: '1-2', 
        time: '12:30', 
        title: '松山機場 → 虹橋機場', 
        location: '松山機場 T1', 
        category: 'transport', 
        description: '搭乘中華航空 CI201 前往上海虹橋。', 
        details: '飛行時間 1 小時 45 分，空中巴士 A330-300。',
        imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109c055?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1436491865332-7a61a109c055?q=80&w=800',
          'https://images.unsplash.com/photo-1506012733851-bb9295d44730?q=80&w=800',
          'https://images.unsplash.com/photo-1521543062047-ebbf4b9680e5?q=80&w=800',
          'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800'
        ]
      },
      { 
        id: '1-3', 
        time: '15:00', 
        title: '搭客運前往烏鎮', 
        location: '虹橋長途西站', 
        category: 'transport', 
        description: '從虹橋機場搭地鐵至虹橋火車站，再轉長途客運。', 
        details: '17:45-19:20 上海虹橋客運西站 → 烏鎮 (120公里)。',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800',
          'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800',
          'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
          'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800'
        ]
      },
      { 
        id: '1-4', 
        time: '19:30', 
        title: '烏鎮望津裡精品飯店 Check-in', 
        location: '烏鎮西柵', 
        category: 'hotel', 
        description: '辦理入住並預約「早茶客」。', 
        details: '詢問「喜慶堂漢服租賃」的使用。',
        imageUrl: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800'
        ]
      },
      { 
        id: '1-5', 
        time: '20:30', 
        title: '書生羊肉麵館', 
        location: '西柵大街美食⑩', 
        category: 'food', 
        description: '夜探烏鎮，品嚐招牌紅燒羊肉麵。', 
        details: '推薦：紅燒羊肉麵、羊肚麵、羊腳麵。人均￥50。',
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800',
          'https://images.unsplash.com/photo-1512058560550-42749359a777?q=80&w=800',
          'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800',
          'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800'
        ]
      }
    ]
  },
  {
    date: '2026-03-20',
    weather: { temp: '17°C', condition: '晴時多雲', suggestion: '適合戶外活動，記得帶相機。📸', icon: 'Sun' },
    hourlyForecast: [
      { time: '07:00', temp: '12°C', condition: '晴' },
      { time: '12:00', temp: '17°C', condition: '晴' },
      { time: '18:00', temp: '15°C', condition: '多雲' },
    ],
    items: [
      { 
        id: '2-1', 
        time: '07:00', 
        title: '早茶客', 
        location: '烏鎮西柵', 
        category: 'food', 
        description: '開啟新的一天，體驗水鄉早茶文化。', 
        imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
          'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800'
        ]
      },
      { 
        id: '2-2', 
        time: '09:30', 
        title: '喜慶堂換裝拍照', 
        location: '喜慶堂', 
        category: 'attraction', 
        description: '換上漢服，漫步烏鎮古巷拍照。', 
        imageUrl: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=800',
          'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
          'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800',
          'https://images.unsplash.com/photo-1590715318100-c9f28f4112e7?q=80&w=800'
        ]
      },
      { 
        id: '2-3', 
        time: '18:00', 
        title: '蟹江南蟹黃麵', 
        location: '烏鎮', 
        category: 'food', 
        description: '享用濃郁的蟹黃麵。', 
        imageUrl: 'https://images.unsplash.com/photo-1512058560550-42749359a777?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1512058560550-42749359a777?q=80&w=800',
          'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800',
          'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800',
          'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800'
        ]
      }
    ]
  },
  {
    date: '2026-03-21',
    weather: { temp: '16°C', condition: '陰天', suggestion: '帶把傘以防萬一。☁️', icon: 'Cloud' },
    items: [
      { 
        id: '3-1', 
        time: '10:10', 
        title: '烏鎮 → 杭州', 
        location: '景區1號停車場', 
        category: 'transport', 
        description: '搭車前往杭州長運武林門驛站。', 
        details: '車資￥45，車程120分鐘。',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=800',
          'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800',
          'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
          'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800'
        ]
      },
      { 
        id: '3-2', 
        time: '12:20', 
        title: '李犟大爆鱔麵', 
        location: '杭州', 
        category: 'food', 
        description: '抵達杭州後的第一餐，品嚐道地爆鱔麵。', 
        details: '營業時間 10:00-22:00，車資￥11.5-17。',
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800',
          'https://images.unsplash.com/photo-1512058560550-42749359a777?q=80&w=800',
          'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800',
          'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800'
        ]
      },
      { 
        id: '3-3', 
        time: '14:10', 
        title: '西湖存翠居 Check-in', 
        location: '西湖區', 
        category: 'hotel', 
        description: '入住西湖邊的民宿。', 
        imageUrl: 'https://images.unsplash.com/photo-1590715318100-c9f28f4112e7?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1590715318100-c9f28f4112e7?q=80&w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800'
        ]
      },
      { 
        id: '3-4', 
        time: '15:15', 
        title: '蓮遇花園餐廳', 
        location: '西湖', 
        category: 'food', 
        description: '在花園環境中享用下午茶或提早晚餐。', 
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800',
          'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800',
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800'
        ]
      },
      { 
        id: '3-5', 
        time: '16:30', 
        title: '西湖十景：曲院風荷', 
        location: '西湖', 
        category: 'attraction', 
        description: '漫步西湖十景之一，免門票。', 
        imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
          'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800',
          'https://images.unsplash.com/photo-1590715318100-c9f28f4112e7?q=80&w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800'
        ]
      },
      { 
        id: '3-6', 
        time: '19:40', 
        title: '杭州印象西湖', 
        location: '西湖', 
        category: 'attraction', 
        description: '觀賞由張藝謀導演的大型水上實景演出。', 
        details: '演出時間 55 分鐘，需提前 30 分鐘入場。',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=800',
          'https://images.unsplash.com/photo-1514525253361-bee8718a300a?q=80&w=800',
          'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=800',
          'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?q=80&w=800'
        ]
      }
    ]
  },
  {
    date: '2026-03-22',
    weather: { temp: '18°C', condition: '晴', suggestion: '陽光明媚，適合拍照。☀️', icon: 'Sun' },
    items: [
      { 
        id: '4-1', 
        time: '07:40', 
        title: '水上巴士體驗', 
        location: '梖子橋', 
        category: 'transport', 
        description: '搭乘水上巴士前往梅花碑，感受水城風情。', 
        details: '船票￥3，全程 40 分鐘。',
        imageUrl: 'https://images.unsplash.com/photo-1559139225-421502ff2d9c?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1559139225-421502ff2d9c?q=80&w=800',
          'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?q=80&w=800',
          'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
          'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800'
        ]
      },
      { 
        id: '4-2', 
        time: '08:30', 
        title: '大馬弄逛早市', 
        location: '大馬弄', 
        category: 'food', 
        description: '當個杭州人，感受濃濃市井煙火氣。', 
        details: '必吃：吳阿姨蔥包檜、周萍粽子店、蔣師傅美食酥魚。',
        imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800',
          'https://images.unsplash.com/photo-1506617564039-2f3b650ad701?q=80&w=800',
          'https://images.unsplash.com/photo-1464226184884-fa280b67c35e?q=80&w=800',
          'https://images.unsplash.com/photo-1488459711615-228239433f86?q=80&w=800'
        ]
      },
      { 
        id: '4-3', 
        time: '13:30', 
        title: '中國茶葉博物館', 
        location: '雙峰館', 
        category: 'attraction', 
        description: '了解茶文化，欣賞茶園風光。', 
        details: '營業時間 09:00-16:30，免門票。',
        imageUrl: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=800',
          'https://images.unsplash.com/photo-1544967082-d9d25d867d66?q=80&w=800',
          'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?q=80&w=800',
          'https://images.unsplash.com/photo-1516715667182-c79213f24b5a?q=80&w=800'
        ]
      },
      { 
        id: '4-4', 
        time: '19:30', 
        title: '武林夜市', 
        location: '武林路', 
        category: 'food', 
        description: '迺夜市，品嚐街邊小吃。', 
        details: '推薦：潘老板炸雞、老北京爆肚、李喜歡蝦滑。',
        imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800',
          'https://images.unsplash.com/photo-1506617564039-2f3b650ad701?q=80&w=800',
          'https://images.unsplash.com/photo-1464226184884-fa280b67c35e?q=80&w=800',
          'https://images.unsplash.com/photo-1488459711615-228239433f86?q=80&w=800'
        ]
      }
    ]
  },
  {
    date: '2026-03-23',
    weather: { temp: '14°C', condition: '多雲', suggestion: '氣溫稍降，注意保暖。☁️', icon: 'Cloud' },
    items: [
      { 
        id: '5-1', 
        time: '08:00', 
        title: '岳王廟', 
        location: '西湖區', 
        category: 'attraction', 
        description: '紀念南宋名將岳飛的場所。', 
        details: '開放時間 07:00-18:00。',
        imageUrl: 'https://images.unsplash.com/photo-1590715318100-c9f28f4112e7?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1590715318100-c9f28f4112e7?q=80&w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800'
        ]
      },
      { 
        id: '5-2', 
        time: '12:10', 
        title: '杭州宮宴', 
        location: '曙光路122號', 
        category: 'food', 
        description: '沉浸式古裝午宴，觀賞舞劇《唐·長恨歌》。', 
        details: '需提前 2 小時到店做古裝造型。',
        imageUrl: 'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1523731407965-2430cd12f5e4?q=80&w=800',
          'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800',
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800'
        ]
      },
      { 
        id: '5-3', 
        time: '14:30', 
        title: '雷峰塔', 
        location: '西湖區', 
        category: 'attraction', 
        description: '西湖地標，登塔俯瞰西湖全景。', 
        imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
          'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800',
          'https://images.unsplash.com/photo-1590715318100-c9f28f4112e7?q=80&w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800'
        ]
      },
      { 
        id: '5-4', 
        time: '17:30', 
        title: '綠茶餐廳', 
        location: '龍井路店', 
        category: 'food', 
        description: '在龍井路環境中享用經典杭幫菜。', 
        imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=800',
          'https://images.unsplash.com/photo-1552566626-52f8b828add9?q=80&w=800',
          'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=800',
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?q=80&w=800'
        ]
      }
    ]
  },
  {
    date: '2026-03-24',
    weather: { temp: '16°C', condition: '晴', suggestion: '適合賞花，天氣晴朗。☀️', icon: 'Sun' },
    items: [
      { 
        id: '6-1', 
        time: '08:00', 
        title: '太子灣公園賞花', 
        location: '西湖區', 
        category: 'attraction', 
        description: '欣賞鬱金香與櫻花，春季必訪。', 
        details: '路線：西門 → 攬櫻軒 → 小教堂 → 九溪瀑布 → 大風車 → 北門。',
        imageUrl: 'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1599661046827-dacff0c0f09a?q=80&w=800',
          'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?q=80&w=800',
          'https://images.unsplash.com/photo-1590715318100-c9f28f4112e7?q=80&w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800'
        ]
      },
      { 
        id: '6-2', 
        time: '12:15', 
        title: '菊英麵店', 
        location: '杭州', 
        category: 'food', 
        description: '品嚐杭州著名的片兒川。', 
        imageUrl: 'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=800',
          'https://images.unsplash.com/photo-1512058560550-42749359a777?q=80&w=800',
          'https://images.unsplash.com/photo-1563379091339-03b21bc4a4f8?q=80&w=800',
          'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=800'
        ]
      },
      { 
        id: '6-3', 
        time: '13:30', 
        title: '南宋德壽宮遺址博物館', 
        location: '上城區', 
        category: 'attraction', 
        description: '體驗宋韻文化，欣賞紅牆與古建築。', 
        details: '開放時間 09:00-17:00，需先至公眾號預約。',
        imageUrl: 'https://images.unsplash.com/photo-1590715318100-c9f28f4112e7?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1590715318100-c9f28f4112e7?q=80&w=800',
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800'
        ]
      },
      { 
        id: '6-4', 
        time: '16:15', 
        title: '南宋御街', 
        location: '上城區', 
        category: 'attraction', 
        description: '漫步南宋臨安城的南北中軸線。', 
        details: '保留了老字號與古建築，體驗千年宋韻。',
        imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?q=80&w=800',
          'https://images.unsplash.com/photo-1506617564039-2f3b650ad701?q=80&w=800',
          'https://images.unsplash.com/photo-1464226184884-fa280b67c35e?q=80&w=800',
          'https://images.unsplash.com/photo-1488459711615-228239433f86?q=80&w=800'
        ]
      }
    ]
  },
  {
    date: '2026-03-25',
    weather: { temp: '15°C', condition: '晴', suggestion: '準備啟程回台。✈️', icon: 'Sun' },
    items: [
      { 
        id: '7-1', 
        time: '07:00', 
        title: '友好飯店早餐', 
        location: '旋轉餐廳', 
        category: 'food', 
        description: '在旋轉餐廳享用自助早餐，俯瞰西湖。', 
        imageUrl: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=800',
          'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=800',
          'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=800',
          'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=800'
        ]
      },
      { 
        id: '7-2', 
        time: '12:00', 
        title: '高鐵：杭州東 → 上海虹橋', 
        location: '杭州東站', 
        category: 'transport', 
        description: '搭乘高鐵返回上海。', 
        imageUrl: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800',
          'https://images.unsplash.com/photo-1506012733851-bb9295d44730?q=80&w=800',
          'https://images.unsplash.com/photo-1521543062047-ebbf4b9680e5?q=80&w=800',
          'https://images.unsplash.com/photo-1436491865332-7a61a109c055?q=80&w=800'
        ]
      },
      { 
        id: '7-3', 
        time: '16:15', 
        title: '虹橋機場 → 松山機場', 
        location: '虹橋機場 T1', 
        category: 'transport', 
        description: '搭乘中華航空 CI202 返回台北。', 
        imageUrl: 'https://images.unsplash.com/photo-1436491865332-7a61a109c055?q=80&w=800',
        images: [
          'https://images.unsplash.com/photo-1436491865332-7a61a109c055?q=80&w=800',
          'https://images.unsplash.com/photo-1542296332-2e4473faf563?q=80&w=800',
          'https://images.unsplash.com/photo-1506012733851-bb9295d44730?q=80&w=800',
          'https://images.unsplash.com/photo-1521543062047-ebbf4b9680e5?q=80&w=800'
        ]
      }
    ]
  }
];

export const MOCK_EXPENSES: Expense[] = [
  { id: 'e1', date: '2026-03-19', title: '往杭州機票 (三人)', amountCNY: 1500, category: '交通' },
  { id: 'e2', date: '2026-03-19', title: '晚餐 - 樓外樓', amountCNY: 350, category: '餐飲' },
  { id: 'e3', date: '2026-03-20', title: '西湖遊船票', amountCNY: 120, category: '景點' },
];

export const EXCHANGE_RATE = 4.5; // 1 CNY = 4.5 TWD
export const RETURN_DATE = '2026-03-25T23:59:59';
