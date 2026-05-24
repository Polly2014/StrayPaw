// 云函数入口文件：submitAdopt
// 提交领养申请
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()

  const {
    animalId,
    animalName,
    name,
    phone,
    wechat,
    age,
    housing,
    hasPetExp,
    familyAgree,
    reason
  } = event

  // 基础校验
  if (!animalId || !name || !phone || !reason) {
    return { code: -1, message: '缺少必填字段' }
  }

  if (!/^1\d{10}$/.test(phone)) {
    return { code: -1, message: '手机号格式不正确' }
  }

  if (parseInt(age) < 18) {
    return { code: -1, message: '需年满18周岁' }
  }

  try {
    // 检查是否已对该动物提交过申请
    const existing = await db.collection('adoptions')
      .where({
        _openid: OPENID,
        animalId,
        status: 'pending'
      })
      .count()

    if (existing.total > 0) {
      return { code: -1, message: '您已对该动物提交过申请，请勿重复提交' }
    }

    // 创建申请记录
    // 注意：不修改 animal status，允许多人同时申请
    // 管理员审批时再统一修改 animal status 为 adopted
    const result = await db.collection('adoptions').add({
      data: {
        animalId,
        animalName,
        applicant: {
          name,
          phone,
          wechat: wechat || '',
          age: parseInt(age),
          housing,
          hasPetExp,
          familyAgree
        },
        reason,
        status: 'pending', // pending → approved / rejected
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })

    // 异步通知管理员（不阻塞主流程）
    const now = new Date(Date.now() + 8 * 3600 * 1000)
    const applyTime = `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}-${String(now.getUTCDate()).padStart(2, '0')} ${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`
    cloud.callFunction({
      name: 'sendNotify',
      data: {
        type: 'newAdoption',
        data: {
          applyTime,
          applicantName: name,
          phone,
          animalName: animalName || '未知'
        }
      }
    }).catch(err => console.warn('通知发送失败（不影响申请）:', err))

    return {
      code: 0,
      message: '申请提交成功',
      adoptionId: result._id
    }
  } catch (err) {
    console.error('submitAdopt error:', err)
    return {
      code: -1,
      message: '提交失败，请重试'
    }
  }
}
