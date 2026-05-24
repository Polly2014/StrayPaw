// utils/mockData.js
// 统一的 Mock 数据，开发阶段使用，接入云开发后删除此文件

const { calculateAge } = require('./age')

const MOCK_ANIMALS = [
  {
    _id: '1',
    name: '橘子',
    species: 'cat',
    breed: '中华田园猫',
    gender: 'male',
    birthday: '2025-05-01',
    weight: '4.5kg',
    status: 'available',
    neutered: true,
    neuteredDate: '2026-01-15',
    vaccinated: true,
    vaccinatedDate: '2025-12-20',
    dewormed: true,
    dewormedDate: '2026-04-10',
    tags: ['温顺', '粘人', '爱呼噜'],
    photo: '/images/xiaobao_photo.jpg',
    photos: ['/images/xiaobao_photo.jpg'],
    description: '性格温顺，喜欢蹭人，已绝育已驱虫，适合家养。',
    personality: '橘子是个十足的小暖男，喜欢窝在人腿上打呼噜。见到生人会先观察一会儿，确认安全后就会主动来蹭。喜欢玩逗猫棒，也喜欢追纸球。',
    healthNote: '体检正常，已完成三联疫苗接种。',
    rescueStory: '在小区垃圾桶旁发现时还是只小奶猫，志愿者带回精心喂养，现已长成健康活泼的小胖橘。'
  },
  {
    _id: '2',
    name: '团团',
    species: 'dog',
    breed: '中华田园犬',
    gender: 'female',
    birthday: '2024-05-01',
    weight: '12kg',
    status: 'available',
    neutered: true,
    neuteredDate: '2025-08-20',
    vaccinated: true,
    vaccinatedDate: '2026-02-15',
    dewormed: true,
    dewormedDate: '2026-03-01',
    tags: ['活泼', '友善', '会握手'],
    photo: '/images/xiaobao_photo.jpg',
    photos: ['/images/xiaobao_photo.jpg'],
    description: '活泼好动，对人友善，在救助站已适应良好。',
    personality: '团团性格开朗，喜欢出门散步，见到人就摇尾巴。和其他狗相处也很友好。会坐下和握手。',
    healthNote: '健康状态良好，已完成五联疫苗和狂犬疫苗接种。',
    rescueStory: '从流浪犬收容所救出，经过三个月的社会化训练，已经是一只非常乖巧的家庭犬。'
  },
  {
    _id: '3',
    name: '雪球',
    species: 'cat',
    breed: '白色长毛',
    gender: 'female',
    birthday: '2023-05-01',
    weight: '3.2kg',
    status: 'pending',
    neutered: true,
    neuteredDate: '2024-06-10',
    vaccinated: true,
    vaccinatedDate: '2026-01-05',
    dewormed: true,
    dewormedDate: '2026-03-20',
    tags: ['安静', '高冷', '爱晒太阳'],
    photo: '/images/xiaobao_photo.jpg',
    photos: ['/images/xiaobao_photo.jpg'],
    description: '优雅安静，适合安静的家庭环境，已绝育。',
    personality: '雪球是个高冷女王，但一旦和你熟了就会变成粘人精。喜欢窗台晒太阳，偶尔会对着窗外的鸟儿"咔咔"叫。'
  },
  {
    _id: '4',
    name: '大黄',
    species: 'dog',
    breed: '金毛串串',
    gender: 'male',
    birthday: '2022-03-01',
    weight: '28kg',
    status: 'adopted',
    neutered: true,
    neuteredDate: '2023-05-15',
    vaccinated: true,
    vaccinatedDate: '2025-11-20',
    dewormed: true,
    dewormedDate: '2026-01-10',
    tags: ['温柔', '亲小孩', '忠诚'],
    photo: '/images/xiaobao_photo.jpg',
    photos: ['/images/xiaobao_photo.jpg'],
    description: '温柔忠诚，与小朋友相处融洽，已找到新家！'
  }
]

// 为每条数据动态计算年龄
MOCK_ANIMALS.forEach(a => {
  a.age = calculateAge(a.birthday)
})

// 按 ID 索引
const MOCK_ANIMALS_MAP = {}
MOCK_ANIMALS.forEach(a => { MOCK_ANIMALS_MAP[a._id] = a })

module.exports = {
  MOCK_ANIMALS,
  MOCK_ANIMALS_MAP
}
