document.addEventListener("DOMContentLoaded", function () {
  // 初始化变量
  const updateTimeElement = document.getElementById("update-time");
  const refreshButton = document.getElementById("refresh-btn");
  let lastUpdateTime = null;

  // 加载内容函数
  function loadContent() {
    // 显示加载状态
    document.querySelectorAll(".section").forEach((section) => {
      section.querySelector(".loading").style.display = "block";
    });

    fetch("README.md")
      .then((response) => response.text())
      .then((text) => {
        const sections = parseMdContent(text);
        updateContent(sections);
        lastUpdateTime = new Date();
        updateTimeElement.textContent = `更新时间：${formatDate(
          lastUpdateTime
        )}`;

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

  // 刷新按钮点击事件
  refreshButton.addEventListener("click", function () {
    // 添加旋转动画
    this.querySelector(".refresh-icon").style.transform = "rotate(360deg)";
    setTimeout(() => {
      this.querySelector(".refresh-icon").style.transform = "";
    }, 300);

    loadContent();
  });

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
  const sidebar = document.querySelector(".sidebar");
  const content = document.querySelector(".content");

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
    } else if (line.includes("魔法")) {
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
      // 清除现有内容
      element.innerHTML = "";

      // 添加加载动画
      const loadingDiv = document.createElement("div");
      loadingDiv.className = "loading";
      element.appendChild(loadingDiv);

      // 使用marked.js解析markdown内容
      const content = marked.parse(sections[sectionId]);

      // 创建临时容器来处理内容
      const tempContainer = document.createElement("div");
      tempContainer.innerHTML = content;

      // 处理图片
      tempContainer.querySelectorAll("img").forEach((img) => {
        // 创建图片容器
        const container = document.createElement("div");
        container.className = "img-container";

        // 处理图片URL
        const originalSrc = img.getAttribute("src");
        if (originalSrc) {
          // 移除可能的 Markdown 语法并清理URL
          const cleanSrc = originalSrc.replace(/[!\[\]]/g, "").trim();

          // 创建新的图片元素
          const newImg = new Image();
          newImg.className = "content-image";

          // 添加加载中状态
          const loadingDiv = document.createElement("div");
          loadingDiv.className = "loading";
          container.appendChild(loadingDiv);

          // 图片加载失败处理
          newImg.onerror = () => {
            loadingDiv.remove();
            const errorDiv = document.createElement("div");
            errorDiv.className = "error";
            errorDiv.innerHTML = `
              <div>图片加载失败</div>
              <div class="error-url">${cleanSrc}</div>
              <button class="retry-button" onclick="retryImage(this, '${cleanSrc}')">重试</button>
            `;
            container.appendChild(errorDiv);
          };

          // 图片加载成功处理
          newImg.onload = function () {
            loadingDiv.remove();
            this.classList.add("loaded");
            container.appendChild(this);
          };

          // 设置图片源
          newImg.src = cleanSrc;
        }

        // 替换原始图片
        img.parentNode.replaceChild(container, img);
      });

      // 更新实际内容
      element.innerHTML = tempContainer.innerHTML;
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

    newImg.onerror = () => {
      loadingDiv.remove();
      const errorDiv = document.createElement("div");
      errorDiv.className = "error";
      errorDiv.innerHTML = `
        <div>图片加载失败</div>
        <div class="error-url">${originalSrc}</div>
        <button class="retry-button" onclick="retryImage(this, '${originalSrc}')">重试</button>
      `;
      container.appendChild(errorDiv);
    };

    newImg.onload = function () {
      loadingDiv.remove();
      this.classList.add("loaded");
      container.appendChild(this);
    };

    // 直接尝试加载原始URL
    newImg.src = originalSrc;
  }
};
