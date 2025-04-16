document.addEventListener("DOMContentLoaded", function () {
  // 处理导航点击事件
  document.querySelectorAll(".sidebar a").forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      const targetId = this.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);
      if (targetElement) {
        targetElement.scrollIntoView({ behavior: "smooth" });
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
      if (window.pageYOffset >= sectionTop - 60) {
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
