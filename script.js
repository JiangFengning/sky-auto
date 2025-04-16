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
    const toggleButton = document.createElement("button");
    toggleButton.textContent = "菜单";
    toggleButton.classList.add("toggle-nav");
    document.body.insertBefore(toggleButton, sidebar);

    toggleButton.addEventListener("click", () => {
      sidebar.classList.toggle("show");
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

  lines.forEach((line) => {
    if (line.startsWith("## 任务")) {
      currentSection = "daily-tasks";
    } else if (line.includes("伊甸之眼")) {
      currentSection = "eden-eye";
    } else if (line.includes("旅行﻿先祖")) {
      currentSection = "ancestors";
    } else if (line.includes("花朵代币")) {
      currentSection = "flower-tokens";
    } else if (line.includes("魔法")) {
      currentSection = "magic";
    } else if (line.includes("大蜡烛")) {
      currentSection = "candles";
    } else if (line.includes('"一起听"')) {
      currentSection = "listen-together";
    }

    if (currentSection && sections[currentSection] !== undefined) {
      sections[currentSection] += line + "\n";
    }
  });

  return sections;
}

// 更新页面内容
function updateContent(sections) {
  Object.keys(sections).forEach((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element && sections[sectionId]) {
      const content = marked.parse(sections[sectionId]);
      element.innerHTML = content;

      // 处理图片加载
      element.querySelectorAll("img").forEach((img) => {
        const container = document.createElement("div");
        container.className = "img-container";
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);

        // 添加加载状态处理
        img.addEventListener("load", () => {
          img.classList.add("loaded");
        });

        img.addEventListener("error", () => {
          img.style.display = "none";
          const errorText = document.createElement("div");
          errorText.className = "error";
          errorText.textContent = "图片加载失败";
          container.appendChild(errorText);
        });
      });
    }
  });
}
