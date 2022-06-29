const backdrop = document.querySelector('.backdrop');
const sideDrawer = document.querySelector('.mobile-nav');
const menuToggle = document.querySelector('#side-menu-toggle');

function backdropClickHandler() {
  sideDrawer.classList.remove('open');
  backdrop.style.display = 'none';
}

function menuToggleClickHandler() {
  sideDrawer.classList.add('open');
  backdrop.style.display = 'block';
}

backdrop.addEventListener('click', backdropClickHandler);
menuToggle.addEventListener('click', menuToggleClickHandler);
