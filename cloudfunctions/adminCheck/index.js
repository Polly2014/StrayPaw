// 云函数：adminCheck
// 校验当前用户是否为管理员
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

// 管理员 openid 白名单（部署后在云开发控制台的数据库 admins 集合中管理）
// 首次使用时，在云开发控制台创建 admins 集合，添加记录 { openid: "你的openid" }

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()

  try {
    // 先查 admins 集合
    const result = await db.collection('admins')
      .where({ openid: OPENID })
      .limit(1)
      .get()

    const isAdmin = result.data.length > 0

    return {
      code: 0,
      isAdmin,
      openid: OPENID
    }
  } catch (err) {
    // admins 集合不存在时，返回 openid 供首次配置
    console.error('adminCheck error:', err)
    return {
      code: 0,
      isAdmin: false,
      openid: OPENID,
      message: '请先创建 admins 集合并添加管理员 openid'
    }
  }
}
