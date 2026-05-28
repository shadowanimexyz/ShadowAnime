const $ = id => document.getElementById(id);

const policyLoader = $("policyLoader");

const menu = $("menu");
const menuBtn = $("menuBtn");

const toTop = $("toTop");

document.addEventListener("DOMContentLoaded", initPolicy);

function initPolicy(){

  bindPolicyUI();

  setTimeout(()=>{
    policyLoader.style.opacity = "0";
    policyLoader.style.pointerEvents = "none";
  },800);
}

function bindPolicyUI(){

  /* MOBILE MENU */

  if(menuBtn && menu){

    menuBtn.onclick = () => {
      menu.classList.toggle("show");
    };
  }

  /* FAQ */

  document.querySelectorAll(".faq-btn").forEach(btn=>{

    btn.addEventListener("click",()=>{

      const panel = btn.nextElementSibling;

      panel.classList.toggle("show");

      btn.classList.toggle("active");
    });
  });

  /* TOP BUTTON */

  window.addEventListener("scroll",()=>{

    if(window.scrollY > 500){
      toTop.style.display = "block";
    }else{
      toTop.style.display = "none";
    }
  });

  toTop.onclick = () => {

    window.scrollTo({
      top:0,
      behavior:"smooth"
    });
  };

  /* ACTIVE SIDEBAR */

  const sections =
    document.querySelectorAll(".policy-card");

  const links =
    document.querySelectorAll(".policy-sidebar a");

  window.addEventListener("scroll",()=>{

    let current = "";

    sections.forEach(section=>{

      const top =
        section.offsetTop - 150;

      if(window.scrollY >= top){
        current = section.getAttribute("id");
      }
    });

    links.forEach(link=>{

      link.classList.remove("active-link");

      if(
        link.getAttribute("href") === `#${current}`
      ){
        link.classList.add("active-link");
      }
    });
  });

  /* SMOOTH SCROLL */

  links.forEach(link=>{

    link.addEventListener("click",(e)=>{

      e.preventDefault();

      const target =
        document.querySelector(
          link.getAttribute("href")
        );

      if(!target) return;

      target.scrollIntoView({
        behavior:"smooth",
        block:"start"
      });

      if(window.innerWidth <= 760){
        menu.classList.remove("show");
      }
    });
  });

  /* FLOATING CARD EFFECT */

  document.querySelectorAll(".policy-card")
    .forEach(card=>{

      card.addEventListener("mousemove",(e)=>{

        const rect =
          card.getBoundingClientRect();

        const x =
          e.clientX - rect.left;

        const y =
          e.clientY - rect.top;

        const centerX =
          rect.width / 2;

        const centerY =
          rect.height / 2;

        const rotateX =
          ((y - centerY) / 25) * -1;

        const rotateY =
          (x - centerX) / 25;

        card.style.transform = `
          perspective(1000px)
          rotateX(${rotateX}deg)
          rotateY(${rotateY}deg)
          translateY(-4px)
        `;
      });

      card.addEventListener("mouseleave",()=>{

        card.style.transform = `
          perspective(1000px)
          rotateX(0deg)
          rotateY(0deg)
          translateY(0px)
        `;
      });
    });
}