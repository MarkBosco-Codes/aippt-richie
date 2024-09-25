let activeIndex = 0;
const container = document.querySelector(".carousel");
const elements = [...document.querySelectorAll(".carousel li")];

function handleIntersect(entries){
  const entry = entries.find(e => e.isIntersecting);
  if (entry) {
    const index = elements.findIndex(
      e => e === entry.target
    );
    activeIndex = index;
  }
}

const observer = new IntersectionObserver(handleIntersect, {
  root: container,
  rootMargin: "0px",
  threshold: 0.75
});

elements.forEach(el => {
  observer.observe(el);
});


function goNext() {
  if(activeIndex < elements.length - 1) {
    elements[activeIndex + 1].scrollIntoView({
      behavior: 'smooth'
    })
  }
  else{
    elements[0].scrollIntoView({
      behavior: 'smooth'
    })
  }
}
