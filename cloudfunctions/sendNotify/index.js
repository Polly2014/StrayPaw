// 云函数：sendNotify
// 发送订阅消息通知给管理员
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()

const DEFAULT_TEMPLATE_ID = 'oj9vcvtZSF4I52v9YWOoHfPQ8CAlM85IFN2rFXv1N04'

exports.main = async (event) => {
  const { type, data } = event

  try {
    // 优先从 config 集合读取模板 ID，fallback 到默认值
    let templateId = DEFAULT_TEMPLATE_ID
    try {
      const configRes = await db.collection('config').doc('notify').get()
      if (configRes.data && configRes.data.templateId) {
        templateId = configRes.data.templateId
      }
    } catch (_) { /* config 不存在时用默认值 */ }

    if (type === 'newAdoption') {
      // 通知所有管理员：有新的领养申请
      const adminsResult = await db.collection('admins').get()
      const admins = adminsResult.data

      const results = []
      for (const admin of admins) {
        try {
          await cloud.openapi.subscribeMessage.send({
            touser: admin.openid,
            templateId: templateId,
            page: '/pages/admin/admin',
            data: {
              time1: { value: data.applyTime },         // 申请时间
              thing2: { value: data.applicantName },     // 申请人员
              phone_number3: { value: data.phone },      // 联系电话
              thing4: { value: '请尽快审核领养申请' },     // 温馨提示
              thing5: { value: data.animalName }          // 产品名称（动物名字）
            }
          })
          results.push({ openid: admin.openid, success: true })
        } catch (err) {
          // 用户未订阅或配额用完，跳过
          console.warn(`通知管理员 ${admin.openid} 失败:`, err.errCode, err.errMsg)
          results.push({ openid: admin.openid, success: false, error: err.errMsg })
        }
      }

      return { code: 0, message: '通知已发送', results }
    }

    return { code: -1, message: '未知通知类型' }
  } catch (err) {
    console.error('sendNotify error:', err)
    return { code: -1, message: err.message }
  }
}
