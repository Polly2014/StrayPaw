# StrayPaw 🐾 流浪动物救助小程序

微信小程序，帮助流浪动物救助团队展示待领养动物、接收领养申请。

## Commands

```bash
# 用微信开发者工具打开此目录
# 导入项目时选择 X-Workspace/StrayPaw/ 目录
# 首次使用：cp project.config.json.example project.config.json 并填入 AppID
# 云环境 ID 配置在 miniprogram/app.js 中

# 云函数部署（在微信开发者工具中）
# 右键 cloudfunctions/getAnimals → 上传并部署
# 右键 cloudfunctions/submitAdopt → 上传并部署
# 右键 cloudfunctions/adminCheck → 上传并部署
# 右键 cloudfunctions/adminManage → 上传并部署
# 右键 cloudfunctions/sendNotify → 上传并部署（云端安装依赖）
```

## Architecture

```
StrayPaw/
├── project.config.json          # 项目配置（AppID）
├── miniprogram/                 # 前端代码
│   ├── app.js/json/wxss         # 全局入口
│   ├── utils/
│   │   ├── mockData.js          # Mock 数据（保留备用）
│   │   ├── age.js               # calculateAge() 根据 birthday 动态算年龄
│   │   └── format.wxs           # WXS 模板过滤器（日期格式化等）
│   ├── pages/
│   │   ├── index/               # 首页：动物列表（搜索+筛选+性格标签）
│   │   ├── detail/              # 动物详情（轮播图+信息+医疗卡片+领养须知）
│   │   ├── adopt/               # 领养申请表单（校验+防重复+协议勾选）
│   │   ├── about/               # 关于我们（使命+统计+联系方式）
│   │   ├── admin/               # 管理后台（动物管理+领养审核双 tab）
│   │   ├── admin-edit/          # 动物编辑（新增/编辑+照片上传）
│   │   ├── privacy/             # 隐私保护指引
│   │   └── agreement/           # 用户服务协议
│   └── images/                  # 图标资源
│       ├── tab-home*.png        # tabBar 爪印图标（dream-painter 生成）
│       ├── tab-about*.png       # tabBar 爱心图标（dream-painter 生成）
│       ├── empty-state.png      # 空状态插画（睡觉小橘猫）
│       ├── placeholder.png      # 动物卡片占位图（小宝头像裁剪）
│       └── xiaobao_photo.jpg    # Mock 动物封面照片
└── cloudfunctions/              # 云函数（Node.js）
    ├── getAnimals/              # 查询动物列表（分页+筛选+搜索）
    ├── submitAdopt/             # 提交领养申请（服务端校验+防重复+触发通知）
    ├── adminCheck/              # 管理员鉴权（查 admins 集合）
    ├── adminManage/             # 管理操作（动物 CRUD+领养审核）
    └── sendNotify/              # 订阅消息通知（新申请→推送给所有管理员）
```

## 云开发数据库 Collections

### animals
| 字段 | 类型 | 说明 |
|------|------|------|
| name | string | 名字 |
| species | string | cat / dog / other |
| breed | string | 品种 |
| gender | string | male / female |
| birthday | string | 生日 (YYYY-MM-DD)，前端 `calculateAge()` 动态显示 |
| weight | string | 体重 |
| status | string | available / pending / adopted |
| tags | array | 性格标签（温顺/活泼/粘人等） |
| neutered | boolean | 是否绝育 |
| neuteredDate | string | 绝育日期 (YYYY-MM-DD) |
| vaccinated | boolean | 是否接种疫苗 |
| vaccinatedDate | string | 最近接种日期 |
| dewormed | boolean | 是否驱虫 |
| dewormedDate | string | 最近驱虫日期 |
| photo | string | 封面图 fileID |
| photos | array | 多张照片 fileID |
| description | string | 简介 |
| personality | string | 性格描述 |
| healthNote | string | 健康状况 |
| rescueStory | string | 救助故事 |
| height | string | 身高（参考 CAWA） |
| neckCirc | string | 颈围 |
| chestCirc | string | 胸围 |
| specialNote | string | 特殊情况（如“双后腿截肢”） |
| createdAt | date | 创建时间 |

### adoptions
| 字段 | 类型 | 说明 |
|------|------|------|
| animalId | string | 动物 ID |
| animalName | string | 动物名字 |
| applicant | object | 申请人信息（姓名/电话/微信/年龄/居住/宠物经验/家人同意） |
| reason | string | 领养理由 |
| status | string | pending / approved / rejected |
| createdAt | date | 申请时间 |

### admins
| 字段 | 类型 | 说明 |
|------|------|------|
| openid | string | 管理员的微信 OpenID |

权限：所有用户不可读写（仅云函数服务端访问）

## 开发路线图

### Phase 1: MVP ✅
Mock 数据可预览，核心页面和交互完整。
- [x] 4 页面（列表/详情/领养申请/关于我们）
- [x] 2 云函数（getAnimals / submitAdopt）
- [x] birthday + 动态年龄计算（`utils/age.js`）
- [x] 性格标签 + 医疗信息卡片（带日期）
- [x] 搜索防抖 + iOS 风格分段筛选控件
- [x] dream-painter 生成 tabBar 图标（爪印/爱心）+ 空状态插画
- [x] WXS 日期格式化（`utils/format.wxs`）
- [x] 分享功能（详情页+首页 `onShareAppMessage`）
- [x] 领养申请表单（手机号/年龄/居住/宠物经验/家人同意 校验，Mock 模式模拟提交）
- [x] 小宝照片裁剪用作 placeholder + Mock 封面

### Phase 2: 云开发上线 ✅
接入真实后端，可以给救助团队用。
- [x] 开通云开发，部署云函数
- [x] 创建 `animals` / `adoptions` / `admins` 三个 collection
- [x] 管理后台（动物 CRUD + 照片上传 + 领养审核，openid 鉴权）
- [x] 管理入口：关于页长按 🐾 → 管理后台
- [x] about 页统计数据改为云端实时查询
- [x] 体型数据（身高/颈围/胸围，参考 CAWA）
- [x] 特殊情况标注（`specialNote`，如“双后腿截肢”）
- [x] 领养申请通知（订阅消息推送给管理员，sendNotify 云函数）

### Phase 3: 增长功能
提升用户参与度和团队运营效率。
- [ ] 助养功能（微信支付 + 月度推送近况）
- [ ] 志愿者报名模块
- [ ] 领养后回访跟踪
- [ ] 公众号联动（菜单嵌入小程序 + 文章跳转）
- [ ] 寻宠/流浪上报（拍照 + 定位）

## 开发状态

**Phase 2 全部完成**，准备发布：
- 云开发环境已开通，5 个云函数（getAnimals / submitAdopt / adminCheck / adminManage / sendNotify）
- 前端已从 Mock 数据切换到云函数调用
- 管理后台可通过「关于我们」长按 🐾 进入
- 管理员鉴权通过 `admins` 集合 openid 白名单
- 领养申请订阅消息通知（sendNotify 云函数）

发布进度：
- [x] 小程序信息填写
- [x] 小程序类目（生活服务/宠物）
- [ ] 小程序备案（已提交，平台审核中）
- [x] 云函数部署（5 个全部已部署）
- [x] 隐私保护指引 + 用户服务协议页面
- [x] 领养表单协议勾选（审核必备）
- [ ] 上传代码 + 提交审核 + 发布（等备案通过）
