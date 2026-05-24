// 云函数入口文件：getAnimals
// 获取动物列表，支持分页、筛选、搜索
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

exports.main = async (event) => {
  const { species, status, keyword, page = 1, pageSize = 20 } = event

  let query = db.collection('animals')
  const conditions = []

  // 按种类筛选
  if (species && species !== 'all') {
    conditions.push({ species })
  }

  // 按状态筛选
  if (status) {
    conditions.push({ status })
  }

  // 关键字搜索
  if (keyword) {
    conditions.push(_.or([
      { name: db.RegExp({ regexp: keyword, options: 'i' }) },
      { breed: db.RegExp({ regexp: keyword, options: 'i' }) },
      { description: db.RegExp({ regexp: keyword, options: 'i' }) }
    ]))
  }

  if (conditions.length > 0) {
    query = query.where(_.and(conditions))
  }

  try {
    // 获取总数
    const countResult = await query.count()
    const total = countResult.total

    // 分页查询
    const skip = (page - 1) * pageSize
    const dataResult = await query
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()

    return {
      code: 0,
      data: dataResult.data,
      total,
      page,
      pageSize,
      hasMore: skip + dataResult.data.length < total
    }
  } catch (err) {
    console.error('getAnimals error:', err)
    return {
      code: -1,
      message: err.message,
      data: []
    }
  }
}
