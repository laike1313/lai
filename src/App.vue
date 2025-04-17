<script>
export default {
  // 添加全局页面显示监听
  globalData: {
    // 标记是否已经添加了页面监听
    hasAddedPageListener: false
  },
  
  onLaunch: function () {
    console.log('App Launch')
    // 初始化应用数据
    this.initAppData()
    
    // 确保TabBar图标正确显示
    this.initTabBar()
    
    // 添加全局页面监听
    this.addPageListener()
  },
  onShow: function () {
    console.log('App Show')
    // 确保每次App显示时都重新初始化TabBar
    this.initTabBar()
  },
  onHide: function () {
    console.log('App Hide')
  },
  methods: {
    initAppData() {
      // 初始化申请数据
      if (!uni.getStorageSync('applies')) {
        // 设置初始申请列表为空数组
        uni.setStorageSync('applies', [])
      }
      
      // 初始化任务数据
      if (!uni.getStorageSync('tasks')) {
        // 设置初始任务列表为空数组
        uni.setStorageSync('tasks', [])
      }
    },
    
    // 初始化TabBar，确保图标正确显示
    initTabBar() {
      console.log('初始化TabBar')
      try {
        // 获取用户信息
        const userInfo = uni.getStorageSync('userInfo')
        if (userInfo) {
          // 如果是普通用户，隐藏待办任务标签
          if (userInfo.role === '普通用户') {
            this.setupUserTabBar()
          } else {
            // 确保非普通用户显示完整TabBar
            this.setupFullTabBar()
          }
        } else {
          // 未登录时也确保TabBar正确显示
          this.setupFullTabBar()
        }
        
        // 添加一个延迟检查，确保TabBar确实显示出来了
        setTimeout(() => {
          // 检查TabBar是否显示
          uni.getSystemInfo({
            success: (res) => {
              console.log('TabBar状态检查')
              // 如果TabBar可能未显示，再次尝试初始化
              if (res && res.windowBottom < 50) {
                console.log('TabBar可能未显示，重新初始化')
                this.forceShowTabBar()
              }
            }
          })
        }, 500)
      } catch (e) {
        console.error('初始化TabBar出错：', e)
        // 出错时尝试强制显示TabBar
        this.forceShowTabBar()
      }
    },
    
    // 强制显示TabBar的方法
    forceShowTabBar() {
      try {
        uni.showTabBar({
          animation: true,
          success: () => {
            console.log('强制显示TabBar成功')
            // 确保所有图标正确显示
            setTimeout(() => {
              this.setupFullTabBar()
            }, 100)
          },
          fail: (err) => {
            console.error('强制显示TabBar失败：', err)
          }
        })
      } catch (e) {
        console.error('强制显示TabBar出错：', e)
      }
    },
    
    // 设置普通用户的TabBar（不包含待办任务）
    setupUserTabBar() {
      uni.hideTabBar({
        animation: false,
        success: () => {
          // 获取TabBar配置
          let tabbarList = [
            {
              pagePath: "pages/index/index",
              text: "首页",
              iconPath: "/static/home.png",
              selectedIconPath: "/static/home-active.png"
            },
            {
              pagePath: "pages/apply/apply",
              text: "申请",
              iconPath: "/static/apply.png",
              selectedIconPath: "/static/apply-active.png"
            },
            {
              pagePath: "pages/my-applies/my-applies",
              text: "我的申请",
              iconPath: "/static/list.png",
              selectedIconPath: "/static/list-active.png"
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
                  pagePath: item.pagePath,
                  iconPath: item.iconPath,
                  selectedIconPath: item.selectedIconPath
                })
              })
            }
          })
        }
      })
    },
    
    // 设置完整的TabBar（包含待办任务）
    setupFullTabBar() {
      // 直接显示完整TabBar
      uni.showTabBar({
        animation: false,
        success: () => {
          // 重新设置所有TabBar项以确保图标正确
          const fullTabList = [
            {
              pagePath: "pages/index/index",
              text: "首页",
              iconPath: "/static/home.png",
              selectedIconPath: "/static/home-active.png"
            },
            {
              pagePath: "pages/apply/apply",
              text: "申请",
              iconPath: "/static/apply.png",
              selectedIconPath: "/static/apply-active.png"
            },
            {
              pagePath: "pages/my-applies/my-applies",
              text: "我的申请",
              iconPath: "/static/list.png",
              selectedIconPath: "/static/list-active.png"
            },
            {
              pagePath: "pages/my-tasks/my-tasks",
              text: "待办任务",
              iconPath: "/static/task.png",
              selectedIconPath: "/static/task-active.png"
            }
          ]
          
          // 设置TabBar样式
          uni.setTabBarStyle({
            color: "#7A7E83",
            selectedColor: "#007AFF",
            backgroundColor: "#ffffff",
            borderStyle: "black"
          })
          
          // 设置所有TabBar项
          fullTabList.forEach((item, index) => {
            uni.setTabBarItem({
              index: index,
              text: item.text,
              pagePath: item.pagePath,
              iconPath: item.iconPath,
              selectedIconPath: item.selectedIconPath
            })
          })
        }
      })
    },
    
    // 添加页面监听，确保每个页面显示时都有TabBar
    addPageListener() {
      if (this.globalData.hasAddedPageListener) return
      
      // 监听页面显示事件
      uni.onTabBarMidButtonTap(() => {
        console.log('TabBar点击');
        // 当TabBar被点击时重新初始化
        this.initTabBar();
      });
      
      // 添加页面显示监听
      const pages = getCurrentPages();
      if (pages && pages.length > 0) {
        pages.forEach(page => {
          // 重写页面的onShow方法
          const originalOnShow = page.onShow;
          page.onShow = function() {
            // 调用原始的onShow
            if (originalOnShow) {
              originalOnShow.call(this);
            }
            
            // 确保TabBar显示
            const app = getApp();
            if (app && app.initTabBar) {
              app.initTabBar();
            }
          }
        });
      }
      
      this.globalData.hasAddedPageListener = true;
    }
  }
}
</script>

<style>
/*每个页面公共css */
</style>
