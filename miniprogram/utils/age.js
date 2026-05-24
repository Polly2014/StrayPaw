// utils/age.js
// 根据生日计算动态年龄显示

function calculateAge(birthday) {
  if (!birthday) return '未知'

  const birth = new Date(birthday)
  const now = new Date()

  let years = now.getFullYear() - birth.getFullYear()
  let months = now.getMonth() - birth.getMonth()

  if (months < 0) {
    years--
    months += 12
  }

  // 日期修正
  if (now.getDate() < birth.getDate()) {
    months--
    if (months < 0) {
      years--
      months += 12
    }
  }

  if (years === 0) {
    return months <= 1 ? '不到1个月' : `${months}个月`
  }
  if (months === 0) {
    return `${years}岁`
  }
  if (years >= 5) {
    // 大龄简化显示
    return months >= 6 ? `${years}岁半` : `${years}岁`
  }
  return `${years}岁${months}个月`
}

module.exports = { calculateAge }
