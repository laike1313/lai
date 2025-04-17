onShow: function () {
  console.log('App Show')
  // 获取用户信息
  const userInfo = uni.getStorageSync('userInfo')
  if (userInfo) {
    // 设置TabBar内容
    if (userInfo.role === '普通用户') {
      // 普通用户TabBar配置
      uni.hideTabBar({
        animation: false,
        success: () => {
          // 获取TabBar配置
          let tabbarList = [
            {
              pagePath: "pages/index/index",
              text: "首页"
            },
            {
              pagePath: "pages/apply/apply",
              text: "申请"
            },
            {
              pagePath: "pages/my-applies/my-applies",
              text: "我的申请"
            }
          ]
          
          // 显示自定义TabBar，不包含待办任务
          uni.showTabBar({
            animation: false,
            success: () => {
              // 设置TabBar样式
              uni.setTabBarStyle({
                color: "#7A7E83",
                selectedColor: "#007AFF",
                backgroundColor: "#ffffff",
                borderStyle: "black"
              })
              
              // 设置TabBar项
              tabbarList.forEach((item, index) => {
                uni.setTabBarItem({
                  index: index,
                  text: item.text,
                  pagePath: item.pagePath
                })
              })
            }
          })
        }
      })
    } else {
      // 非普通用户TabBar配置
      uni.hideTabBar({
        animation: false,
        success: () => {
          // 获取TabBar配置
          let tabbarList = [
            {
              pagePath: "pages/index/index",
              text: "首页"
            },
            {
              pagePath: "pages/apply/apply",
              text: "申请"
            },
            {
              pagePath: "pages/my-applies/my-applies",
              text: "已办任务"
            },
            {
              pagePath: "pages/my-tasks/my-tasks",
              text: "待办任务"
            }
          ]
          
          // 显示自定义TabBar
          uni.showTabBar({
            animation: false,
            success: () => {
              // 设置TabBar样式
              uni.setTabBarStyle({
                color: "#7A7E83",
                selectedColor: "#007AFF",
                backgroundColor: "#ffffff",
                borderStyle: "black"
              })
              
              // 设置TabBar项
              tabbarList.forEach((item, index) => {
                uni.setTabBarItem({
                  index: index,
                  text: item.text,
                  pagePath: item.pagePath
                })
              })
            }
          })
        }
      })
    }
  }
}, 