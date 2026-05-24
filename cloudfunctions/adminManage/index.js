// 云函数：adminManage
// 管理员操作：动物 CRUD + 领养审核
const cloud = require('wx-server-sdk')

cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })

const db = cloud.database()
const _ = db.command

// 鉴权：检查是否为管理员
async function checkAdmin(OPENID) {
  const result = await db.collection('admins')
    .where({ openid: OPENID })
    .limit(1)
    .get()
  return result.data.length > 0
}

exports.main = async (event) => {
  const { OPENID } = cloud.getWXContext()
  const { action, data } = event

  // 鉴权
  const isAdmin = await checkAdmin(OPENID)
  if (!isAdmin) {
    return { code: -1, message: '无管理员权限' }
  }

  try {
    switch (action) {
      // ===== 动物管理 =====
      case 'addAnimal': {
        const result = await db.collection('animals').add({
          data: {
            ...data,
            createdAt: db.serverDate(),
            updatedAt: db.serverDate()
          }
        })
        return { code: 0, message: '添加成功', id: result._id }
      }

      case 'updateAnimal': {
        const { id, _id, _openid, ...updateData } = data
        await db.collection('animals').doc(id || _id).update({
          data: {
            ...updateData,
            updatedAt: db.serverDate()
          }
        })
        return { code: 0, message: '更新成功' }
      }

      case 'deleteAnimal': {
        await db.collection('animals').doc(data.id).remove()
        return { code: 0, message: '删除成功' }
      }

      // ===== 领养审核 =====
      case 'getAdoptions': {
        const { status, page = 1, pageSize = 20 } = data || {}
        let query = db.collection('adoptions')
        if (status) {
          query = query.where({ status })
        }
        const countResult = await query.count()
        const skip = (page - 1) * pageSize
        const result = await query
          .orderBy('createdAt', 'desc')
          .skip(skip)
          .limit(pageSize)
          .get()
        return {
          code: 0,
          data: result.data,
          total: countResult.total
        }
      }

      case 'reviewAdoption': {
        const { id, status: newStatus } = data
        // status: approved / rejected
        await db.collection('adoptions').doc(id).update({
          data: {
            status: newStatus,
            reviewedAt: db.serverDate()
          }
        })

        // 如果通过，更新动物状态并拒绝该动物的其他待审申请
        if (newStatus === 'approved') {
          const adoption = await db.collection('adoptions').doc(id).get()
          if (adoption.data && adoption.data.animalId) {
            const animalId = adoption.data.animalId
            // 更新动物状态为 adopted
            await db.collection('animals').doc(animalId).update({
              data: { status: 'adopted', updatedAt: db.serverDate() }
            })
            // 自动拒绝该动物的其他 pending 申请
            await db.collection('adoptions').where({
              animalId,
              status: 'pending',
              _id: _.neq(id)
            }).update({
              data: {
                status: 'rejected',
                reviewedAt: db.serverDate(),
                rejectReason: '该动物已被其他申请人领养'
              }
            })
          }
        }

        return { code: 0, message: newStatus === 'approved' ? '已通过' : '已拒绝' }
      }

      default:
        return { code: -1, message: '未知操作: ' + action }
    }
  } catch (err) {
    console.error('adminManage error:', err)
    return { code: -1, message: err.message }
  }
}
