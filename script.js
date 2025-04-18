document.addEventListener("DOMContentLoaded", function () {
  // 初始化变量
  const updateTimeElement = document.getElementById("update-time");
  const refreshButton = document.getElementById("refresh-btn");
  const sidebarNav = document.querySelector(".sidebar ul");
  const mainContent = document.querySelector("main.content");
  const sidebar = document.querySelector(".sidebar");
  const content = document.querySelector(".content");
  let lastUpdateTime = null;

  // 定义所有可能的部分
  const allSections = {
    "daily-tasks": "今日任务",
    "eden-eye": "伊甸之眼坠落碎片",
    ancestors: "旅行先祖",
    "flower-tokens": "花朵代币",
    magic: "魔法商店",
    candles: "大蜡烛",
    "listen-together": "一起听",
  };

  // 加载内容函数
  function loadContent() {
    fetch("README.md")
      .then((response) => response.text())
      .then((text) => {
        const sections = parseMdContent(text);

        // 清空现有的导航和内容
        sidebarNav.innerHTML = "";
        mainContent.innerHTML = `
          <div class="header-info">
            <h1>光遇每日任务</h1>
            <div class="update-info">
              <span id="update-time">更新时间：加载中...</span>
              <button id="refresh-btn" class="refresh-button">
                <span class="refresh-icon">↻</span> 刷新
              </button>
            </div>
          </div>
        `;

        // 只添加有内容的部分
        Object.entries(sections).forEach(([sectionId, content]) => {
          if (content.trim()) {
            // 添加导航项
            const navItem = document.createElement("li");
            navItem.innerHTML = `<a href="#${sectionId}">${allSections[sectionId]}</a>`;
            sidebarNav.appendChild(navItem);

            // 添加内容区域
            const section = document.createElement("div");
            section.id = sectionId;
            section.className = "section";
            section.innerHTML = `
              <h2>${allSections[sectionId]}</h2>
              <div class="loading"></div>
            `;
            mainContent.appendChild(section);
          }
        });

        // 重新获取刷新按钮和更新时间元素
        const refreshBtn = document.getElementById("refresh-btn");
        const updateTime = document.getElementById("update-time");

        // 更新内容
        updateContent(sections);
        lastUpdateTime = new Date();
        updateTime.textContent = `更新时间：${formatDate(lastUpdateTime)}`;

        // 重新绑定刷新按钮事件
        refreshBtn.addEventListener("click", function () {
          this.querySelector(".refresh-icon").style.transform =
            "rotate(360deg)";
          setTimeout(() => {
            this.querySelector(".refresh-icon").style.transform = "";
          }, 300);
          loadContent();
        });

        // 显示成功消息
        showMessage("内容已更新", "success");
      })
      .catch((error) => {
        console.error("Error loading content:", error);
        showMessage("内容加载失败，请稍后重试", "error");
      });
  }

  // 显示消息函数
  function showMessage(message, type) {
    const messageDiv = document.createElement("div");
    messageDiv.className = type;
    messageDiv.textContent = message;

    // 移除之前的消息
    document.querySelectorAll(".error, .success").forEach((el) => el.remove());

    // 添加新消息
    document.querySelector(".header-info").appendChild(messageDiv);

    // 3秒后自动移除消息
    setTimeout(() => messageDiv.remove(), 3000);
  }

  // 格式化日期
  function formatDate(date) {
    const options = {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    };
    return date.toLocaleString("zh-CN", options);
  }

  // 处理导航点击事件
  document.querySelectorAll(".sidebar a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
        // 在移动端自动关闭菜单
        if (window.innerWidth <= 768) {
          document.querySelector(".sidebar").classList.remove("show");
        }
      }
    });
  });

  // 在移动设备上处理导航栏的显示/隐藏
  if (window.innerWidth <= 768) {
    // 创建遮罩层
    const overlay = document.createElement("div");
    overlay.className = "overlay";
    document.body.appendChild(overlay);

    // 创建菜单按钮
    const toggleButton = document.createElement("button");
    toggleButton.className = "toggle-nav";
    const iconSpan = document.createElement("span");
    iconSpan.className = "icon";
    toggleButton.appendChild(iconSpan);
    document.body.insertBefore(toggleButton, sidebar);

    // 处理菜单点击事件
    toggleButton.addEventListener("click", () => {
      sidebar.classList.toggle("show");
      overlay.classList.toggle("show");
      document.body.style.overflow = sidebar.classList.contains("show")
        ? "hidden"
        : "";
    });

    // 点击遮罩层关闭菜单
    overlay.addEventListener("click", () => {
      sidebar.classList.remove("show");
      overlay.classList.remove("show");
      document.body.style.overflow = "";
    });

    // 点击导航链接后关闭菜单
    document.querySelectorAll(".sidebar a").forEach((link) => {
      link.addEventListener("click", () => {
        sidebar.classList.remove("show");
        overlay.classList.remove("show");
        document.body.style.overflow = "";
      });
    });
  }

  // 处理窗口大小变化
  window.addEventListener("resize", () => {
    if (window.innerWidth > 768) {
      // 移除移动端相关元素
      const overlay = document.querySelector(".overlay");
      const toggleButton = document.querySelector(".toggle-nav");
      if (overlay) overlay.remove();
      if (toggleButton) toggleButton.remove();

      // 重置样式
      sidebar.classList.remove("show");
      document.body.style.overflow = "";
    } else if (!document.querySelector(".toggle-nav")) {
      // 如果切换到移动端视图，重新初始化移动端导航
      location.reload();
    }
  });

  // 处理滚动时的导航高亮
  window.addEventListener("scroll", () => {
    const sections = document.querySelectorAll(".section");
    let currentSection = "";

    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (window.pageYOffset >= sectionTop - 100) {
        currentSection = section.getAttribute("id");
      }
    });

    document.querySelectorAll(".sidebar a").forEach((link) => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${currentSection}`) {
        link.classList.add("active");
      }
    });
  });

  // 初始加载内容
  loadContent();
});

// 解析Markdown内容
function parseMdContent(text) {
  const sections = {
    "daily-tasks": "",
    "eden-eye": "",
    ancestors: "",
    "flower-tokens": "",
    magic: "",
    candles: "",
    "listen-together": "",
  };

  let currentSection = "";
  const lines = text.split("\n");

  // 添加调试信息
  console.log("开始解析Markdown内容");

  lines.forEach((line, index) => {
    // 调试每行内容
    console.log(`处理第${index + 1}行:`, line);

    if (line.startsWith("## 任务") || line.includes("任务一")) {
      currentSection = "daily-tasks";
      console.log("切换到每日任务部分");
    } else if (line.includes("伊甸之眼")) {
      currentSection = "eden-eye";
      console.log("切换到伊甸之眼部分");
    } else if (line.includes("旅行﻿先祖") || line.includes("旅行先祖")) {
      currentSection = "ancestors";
      console.log("切换到旅行先祖部分");
    } else if (line.includes("花朵代币")) {
      currentSection = "flower-tokens";
      console.log("切换到花朵代币部分");
    } else if (line.match(/^[\s]*魔法商店|^[\s]*##[\s]*魔法商店/)) {
      currentSection = "magic";
      console.log("切换到魔法商店部分");
    } else if (line.includes("大蜡烛")) {
      currentSection = "candles";
      console.log("切换到大蜡烛部分");
    } else if (line.includes('"一起听"')) {
      currentSection = "listen-together";
      console.log("切换到一起听部分");
    }

    if (currentSection && sections[currentSection] !== undefined) {
      sections[currentSection] += line + "\n";
    }
  });

  // 输出解析结果
  console.log("内容解析结果:", sections);

  // 检查每个部分是否有内容
  Object.entries(sections).forEach(([key, value]) => {
    console.log(`${key} 部分内容长度:`, value.length);
  });

  return sections;
}

// 更新页面内容
function updateContent(sections) {
  Object.keys(sections).forEach((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element && sections[sectionId]) {
      // 使用marked.js解析markdown内容
      const content = marked.parse(sections[sectionId]);
      element.innerHTML = content;

      // 处理图片加载
      element.querySelectorAll("img").forEach((img) => {
        // 创建图片容器
        const container = document.createElement("div");
        container.className = "img-container";

        // 处理图片URL
        const originalSrc = img.getAttribute("src");
        if (originalSrc) {
          // 移除可能的 Markdown 语法
          const cleanSrc = originalSrc.replace(/[!\[\]]/g, "").trim();

          // 创建新的图片元素
          const newImg = new Image();
          newImg.className = "content-image";

          // 添加加载中状态
          const loadingDiv = document.createElement("div");
          loadingDiv.className = "loading";
          container.appendChild(loadingDiv);

          // 尝试不同的图片加载方式
          const tryLoadImage = (urls, index = 0) => {
            if (index >= urls.length) {
              // 所有尝试都失败了
              loadingDiv.remove();
              const errorDiv = document.createElement("div");
              errorDiv.className = "error";
              errorDiv.innerHTML = `
                <div>图片加载失败</div>
                <button class="retry-button" onclick="retryImage(this, '${cleanSrc}')">重试</button>
                <div class="error-url">${cleanSrc}</div>
              `;
              container.appendChild(errorDiv);
              console.error("图片加载失败:", cleanSrc);
              return;
            }

            newImg.onerror = () => {
              console.log(`尝试加载失败，使用下一个URL: ${urls[index]}`);
              tryLoadImage(urls, index + 1);
            };

            newImg.onload = function () {
              loadingDiv.remove();
              this.classList.add("loaded");
              container.appendChild(this);
            };

            newImg.src = urls[index];
          };

          // 准备不同的URL尝试方案
          const urls = [
            cleanSrc, // 原始URL
            cleanSrc.replace("http://", "https://"), // HTTPS版本
            `https://images.weserv.nl/?url=${encodeURIComponent(cleanSrc)}`, // 使用weserv.nl代理
            `https://api.allorigins.win/raw?url=${encodeURIComponent(
              cleanSrc
            )}`, // 使用allorigins代理
          ];

          // 开始尝试加载
          tryLoadImage(urls);
        }

        // 替换原始图片
        img.parentNode.replaceChild(container, img);
      });

      // 移除加载状态
      const loadingElement = element.querySelector(".loading");
      if (loadingElement) {
        loadingElement.style.display = "none";
      }
    }
  });
}

// 重试加载图片
window.retryImage = function (button, originalSrc) {
  const container = button.closest(".img-container");
  if (container) {
    // 清除错误信息
    container.innerHTML = "";

    // 添加加载中状态
    const loadingDiv = document.createElement("div");
    loadingDiv.className = "loading";
    container.appendChild(loadingDiv);

    // 创建新图片
    const newImg = new Image();
    newImg.className = "content-image";

    // 准备不同的URL尝试方案
    const urls = [
      originalSrc,
      originalSrc.replace("http://", "https://"),
      `https://images.weserv.nl/?url=${encodeURIComponent(originalSrc)}`,
      `https://api.allorigins.win/raw?url=${encodeURIComponent(originalSrc)}`,
    ];

    let currentIndex = 0;

    function tryNextUrl() {
      if (currentIndex < urls.length) {
        console.log(`尝试加载URL: ${urls[currentIndex]}`);
        newImg.src = urls[currentIndex];
        currentIndex++;
      } else {
        loadingDiv.remove();
        const errorDiv = document.createElement("div");
        errorDiv.className = "error";
        errorDiv.innerHTML = `
          <div>图片加载失败</div>
          <button class="retry-button" onclick="retryImage(this, '${originalSrc}')">重试</button>
          <div class="error-url">${originalSrc}</div>
        `;
        container.appendChild(errorDiv);
      }
    }

    newImg.onerror = tryNextUrl;

    newImg.onload = function () {
      loadingDiv.remove();
      this.classList.add("loaded");
      container.appendChild(this);
    };

    // 开始尝试第一个URL
    tryNextUrl();
  }
};
