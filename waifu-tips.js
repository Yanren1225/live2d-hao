/*
 * Live2D Widget
 * https://github.com/stevenjoezhang/live2d-widget
 */
function loadWidget(config) {
	let { waifuPath, apiPath, cdnPath } = config;
	let useCDN = false, modelList;
	if (typeof cdnPath === "string") {
		useCDN = true;
		if (!cdnPath.endsWith("/")) cdnPath += "/";
	}
	if (!apiPath.endsWith("/")) apiPath += "/";
	localStorage.removeItem("waifu-display");
	sessionStorage.removeItem("waifu-text");
	document.body.insertAdjacentHTML("beforeend", `<div id="waifu">
			<div id="waifu-tips"></div>
			<div id="live2d" width="800" height="800"></div>
			<div id="waifu-tool">
				<span class="fa fa-lg fa-comment"></span>
				<span class="fa fa-lg fa-user-circle"></span>
				<span class="fa fa-lg fa-camera-retro"></span>
				<span class="fa fa-lg fa-info-circle"></span>
				<span class="fa fa-lg fa-times"></span>
			</div>
		</div>`);
	// https://stackoverflow.com/questions/24148403/trigger-css-transition-on-appended-element
	setTimeout(() => {
		document.getElementById("waifu").style.bottom = 0;
	}, 0);

	function randomSelection(obj) {
		return Array.isArray(obj) ? obj[Math.floor(Math.random() * obj.length)] : obj;
	}
	// 检测用户活动状态，并在空闲时显示消息
	let userAction = false,
		userActionTimer,
		messageTimer,
		messageArray = ["好久不见，日子过得好快呢……", "大坏蛋！你都多久没理浩浩了呀，呜～", "诶，介叔叔去哪里了。。。", "拿小拳拳锤你胸口！"];
	window.addEventListener("mousemove", () => userAction = true);
	window.addEventListener("keydown", () => userAction = true);
	setInterval(() => {
		if (userAction) {
			userAction = false;
			clearInterval(userActionTimer);
			userActionTimer = null;
		} else if (!userActionTimer) {
			userActionTimer = setInterval(() => {
				showMessage(randomSelection(messageArray), 6000, 9);
			}, 20000);
		}
	}, 1000);

	(function registerEventListener() {
		document.querySelector("#waifu-tool .fa-comment").addEventListener("click", showHitokoto);
		document.querySelector("#waifu-tool .fa-camera-retro").addEventListener("click", () => {
			showMessage("照好了嘛，是不是很可爱呢？", 6000, 9);
            var e = document.createElement("a");
            document.body.appendChild(e);
			e.setAttribute("type", "hidden");
			e.href = document.getElementById("live2d").firstChild.toDataURL();
			e.download = "live2d.png";
			e.click();
	});
		document.querySelector("#waifu-tool .fa-info-circle").addEventListener("click", () => {
			open("#");
		});
		document.querySelector("#waifu-tool .fa-times").addEventListener("click", () => {
			localStorage.setItem("waifu-display", Date.now());
			showMessage("愿你有一天能与重要的人重逢。", 2000, 11);
			document.getElementById("waifu").style.bottom = "-500px";
			setTimeout(() => {
				document.getElementById("waifu").style.display = "none";
				document.getElementById("waifu-toggle").classList.add("waifu-toggle-active");
			}, 3000);
		});
		let devtools = () => {};
		console.log("%c", devtools);
		devtools.toString = () => {
			showMessage("哈哈，你打开了控制台，是想要看看我的小秘密吗？", 6000, 9);
		};
		window.addEventListener("copy", () => {
			showMessage("你都复制了些什么呀，转载要记得加上出处哦！", 6000, 9);
		});
		window.addEventListener("visibilitychange", () => {
			if (!document.hidden) showMessage("哇，你终于回来了～", 6000, 9);
		});
	})();

	(function welcomeMessage() {
		let text;
		if (location.pathname === "/") { // 如果是主页
			let now = new Date().getHours();
			if (now > 5 && now <= 7) text = "早上好！一日之计在于晨，美好的一天就要开始了。";
			else if (now > 7 && now <= 11) text = "上午好！工作顺利嘛，不要久坐，多起来走动走动哦！";
			else if (now > 11 && now <= 13) text = "中午了，工作了一个上午，现在是午餐时间！";
			else if (now > 13 && now <= 17) text = "午后很容易犯困呢，今天的运动目标完成了吗？";
			else if (now > 17 && now <= 19) text = "傍晚了！窗外夕阳的景色很美丽呢，最美不过夕阳红～";
			else if (now > 19 && now <= 21) text = "晚上好，今天过得怎么样？";
			else if (now > 21 && now <= 23) text = ["已经这么晚了呀，早点休息吧，晚安～", "深夜时要爱护眼睛呀！"];
			else text = "你是夜猫子呀？这么晚还不睡觉，明天起的来嘛？";
		} else if (document.referrer !== "") {
			let referrer = new URL(document.referrer),
				domain = referrer.hostname.split(".")[1];
			if (location.hostname === referrer.hostname) text = `欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
			else if (domain === "baidu") text = `Hello！来自 百度搜索 的朋友<br>你是搜索 <span>${referrer.search.split("&wd=")[1].split("&")[0]}</span> 找到的我吗？`;
			else if (domain === "so") text = `Hello！来自 360搜索 的朋友<br>你是搜索 <span>${referrer.search.split("&q=")[1].split("&")[0]}</span> 找到的我吗？`;
			else if (domain === "google") text = `Hello！来自 谷歌搜索 的朋友<br>欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
			else text = `Hello！来自 <span>${referrer.hostname}</span> 的朋友`;
		} else {
			text = `欢迎阅读<span>「${document.title.split(" - ")[0]}」</span>`;
		}
		showMessage(text, 7000, 8);
	})();

	function showHitokoto() {
		// 增加 hitokoto.cn 的 API
		fetch("https://v1.hitokoto.cn")
			.then(response => response.json())
			.then(result => {
				let text = `这句一言来自 <span>「${result.from}」</span>，是 <span>${result.creator}</span> 在 hitokoto.cn 投稿的。`;
				showMessage(result.hitokoto, 6000, 9);
				setTimeout(() => {
					showMessage(text, 4000, 9);
				}, 6000);
			});
	}

	function showMessage(text, timeout, priority) {
		if (!text || (sessionStorage.getItem("waifu-text") && sessionStorage.getItem("waifu-text") > priority)) return;
		if (messageTimer) {
			clearTimeout(messageTimer);
			messageTimer = null;
		}
		text = randomSelection(text);
		sessionStorage.setItem("waifu-text", priority);
		let tips = document.getElementById("waifu-tips");
		tips.innerHTML = text;
		tips.classList.add("waifu-tips-active");
		messageTimer = setTimeout(() => {
			sessionStorage.removeItem("waifu-text");
			tips.classList.remove("waifu-tips-active");
		}, timeout);
	}

	(function initModel() {
		window.onload = ()=>{
            window.l2app = new l2dViewer({
                el: document.getElementById('live2d'), // 要添加Live2d的元素
                basePath: apiPath + 'assets', // 模型根目录
                modelName: 'hao', // 模型名称
                width: 300,
                height: 300,
            })
		}
		fetch(waifuPath)
			.then(response => response.json())
			.then(result => {
				result.mouseover.forEach(tips => {
					window.addEventListener("mouseover", event => {
						if (!event.target.matches(tips.selector)) return;
						let text = randomSelection(tips.text);
						text = text.replace("{text}", event.target.innerText);
						showMessage(text, 4000, 8);
					});
				});
				result.click.forEach(tips => {
					window.addEventListener("click", event => {
						if (!event.target.matches(tips.selector)) return;
						let text = randomSelection(tips.text);
						text = text.replace("{text}", event.target.innerText);
						showMessage(text, 4000, 8);
					});
				});
				result.seasons.forEach(tips => {
					let now = new Date(),
						after = tips.date.split("-")[0],
						before = tips.date.split("-")[1] || after;
					if ((after.split("/")[0] <= now.getMonth() + 1 && now.getMonth() + 1 <= before.split("/")[0]) && (after.split("/")[1] <= now.getDate() && now.getDate() <= before.split("/")[1])) {
						let text = randomSelection(tips.text);
						text = text.replace("{year}", now.getFullYear());
						//showMessage(text, 7000, true);
						messageArray.push(text);
					}
				});
			});
	})();
}

function initWidget(config, apiPath = "/") {
	if (typeof config === "string") {
		config = {
			waifuPath: config,
			apiPath
		};
	}
	document.body.insertAdjacentHTML("beforeend", `<div id="waifu-toggle">
			<span>看板娘</span>
		</div>`);
	let toggle = document.getElementById("waifu-toggle");
	toggle.addEventListener("click", () => {
		toggle.classList.remove("waifu-toggle-active");
		if (toggle.getAttribute("first-time")) {
			loadWidget(config);
			toggle.removeAttribute("first-time");
		} else {
			localStorage.removeItem("waifu-display");
			document.getElementById("waifu").style.display = "";
			setTimeout(() => {
				document.getElementById("waifu").style.bottom = 0;
			}, 0);
		}
	});
	if (localStorage.getItem("waifu-display") && Date.now() - localStorage.getItem("waifu-display") <= 86400000) {
		toggle.setAttribute("first-time", true);
		setTimeout(() => {
			toggle.classList.add("waifu-toggle-active");
		}, 0);
	} else {
		loadWidget(config);
	}
}
