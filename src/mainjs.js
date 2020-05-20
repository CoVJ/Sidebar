/* -----------------  jQuery for slideDown and slideUP ----------------- */
jQuery(function ($) {

  $(".sidebar-dropdown > a").click(
  function() {
      $(".sidebar-submenu").slideUp(200);
      if ( $(this).parent().hasClass("active")) 
      {
          $(".sidebar-dropdown").removeClass("active");
          $(this).parent().removeClass("active");
      } 
      else 
      {
          $(".sidebar-dropdown").removeClass("active");
          $(this).next(".sidebar-submenu").slideDown(200);
          $(this).parent().addClass("active");
      }
      });
});




/* --------------------Pure JS Close and Open sidebar ------------------ */
document.querySelector(".page-content").addEventListener("click", closing);
document.getElementById("close-sidebar-button").addEventListener("click", closing);
function  closing () {
    document.querySelector(".page-wrapper").classList.remove("toggled");
}

document.getElementById("show-sidebar-button").addEventListener("click", opening);
function  opening (){
    document.querySelector(".page-wrapper").classList.add("toggled");

}


/* ------------------Pure JS  Load wrapper ----------------------------- */
/* jQuery version

        $(window).on("load", function(){
    			<!-- Remove background -->
          $(".loader-wrapper").fadeOut("slow");
        });
*/
window.addEventListener("load", f_loaded);

function f_loaded() {
	var mn = document.querySelector(".loader-wrapper");
  //mn.style.display = "none";
  fadeOut(mn);
}

function fadeOut(el){
  el.style.opacity = 1;

  (function fade() {
    if ((el.style.opacity -= 0.05) < 0) {
      el.style.display = "none";
    } 
    else {
      requestAnimationFrame(fade);
    }
  })();
}

/*------------------Pure JS  OverlayScrollbar ------------------------- */
document.addEventListener("DOMContentLoaded", function() {
	//The first argument are the elements to which the plugin shall be initialized
	//The second argument has to be at least a empty object or a object with your desired options
  OverlayScrollbars(document.querySelector("body"), {className : "os-theme-minimal-dark"});
  OverlayScrollbars(document.querySelector(".sidebar-content"), {className : "os-theme-thin-light"});
});
