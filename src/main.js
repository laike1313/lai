import {
	createSSRApp
} from "vue";
import App from "./App.vue";

export function createApp() {
	const app = createSSRApp(App);
	
	// 添加全局混入，确保每个页面显示时都能初始化TabBar
	app.mixin({
		onShow() {
			// 尝试获取App实例并初始化TabBar
			const appInstance = getApp();
			if (appInstance && appInstance.initTabBar) {
				// 立即初始化一次
				appInstance.initTabBar();
				
				// 延迟100ms再次初始化，确保UI完全加载
				setTimeout(() => {
					appInstance.initTabBar();
				}, 100);
				
				// 延迟500ms再次检查，以防底部导航未显示
				setTimeout(() => {
					if (appInstance.forceShowTabBar) {
						appInstance.forceShowTabBar();
					}
				}, 500);
			}
		},
		onHide() {
			// 页面隐藏时，确保下次显示时能恢复TabBar
			const appInstance = getApp();
			if (appInstance) {
				appInstance.globalData = appInstance.globalData || {};
				appInstance.globalData.needTabBarRefresh = true;
			}
		},
		onLoad() {
			// 页面加载时尝试显示TabBar
			uni.showTabBar({
				animation: false
			});
		}
	});
	
	return {
		app,
	};
}
