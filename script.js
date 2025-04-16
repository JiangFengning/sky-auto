document.addEventListener("DOMContentLoaded", function () {
  // 加载README内容
  fetch("README.md")
    .then((response) => response.text())
    .then((text) => {
      const sections = parseMdContent(text);
      updateContent(sections);
    })
    .catch((error) => {
      console.error("Error loading content:", error);
      document.querySelector(".content").innerHTML =
        '<div class="error">内容加载失败，请稍后重试</div>';
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
      element.innerHTML = marked.parse(sections[sectionId]);
      // 处理图片加载
      element.querySelectorAll("img").forEach((img) => {
        const container = document.createElement("div");
        container.className = "img-container";
        img.parentNode.insertBefore(container, img);
        container.appendChild(img);
      });
    }
  });
}
