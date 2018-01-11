(function($) {

  function setPlanColBg(plans) {
    if( typeof plans === 'string' ) {
      plans = [plans];
    }

    plans = plans.map(function(plan) {
      return plan.replace('#', '').replace('plan-id', 'plan-col');
    })

    jQuery('.plan-col').removeClass('selected');
    if(plans.length > 0 ) {
      plans.forEach(function(plan) {
        jQuery('#' + plan).addClass('selected')
      })
    }
  }


  jQuery(document).on('mouseover', '.plan-col__body > div', function() {
    jQuery('.plan-col__body').find('> div:eq(' + jQuery(this).index() + ')').addClass('hover');
  })

  jQuery(document).on('mouseout', '.plan-col__body > div', function() {
    jQuery('.plan-col__body').find('> div').removeClass('hover');
  })



  $(document).ready(function(){
    var width = $(window).width();

    // If someone came to this page for a specific plan
    if (location.hash.indexOf('#plan-id') !== -1 ) {
      // The scroll should stay on top
      setTimeout(function() {
        window.scrollTo(0, 0);
      }, 1);


      // Set the plan column to it
      setPlanColBg(location.hash)
    } else {
      // If no plan is selected initially highlight the two enterprise plans
      setPlanColBg(['plan-col-visits-enterprise1', 'plan-col-visits-enterprise2'])
    }

    // Selected plan column logic
    $(document).on('click', '.details-link' ,function() {
      setPlanColBg('plan-col-' + $(this).parents('.plan').attr('data-id'))
    })



    // Viewport width specific settings;
    slidesToShow = 3;
    centerPadding = '250px';

    if( width < 1080 ) {
      slidesToShow = 1;
    }
    centerMode = true;
    if( width < 700 ) {
      centerMode = true;
      centerPadding = '30px'
    }

    // Slick slider setup
    $('.price-carousel').slick({
      slidesToShow: slidesToShow,
      draggable: false,
      infinite: false,
      centerMode: centerMode,
      initialSlide: 1,
      centerPadding: centerPadding,
      speed: 200,
      waitForAnimate: false,
      nextArrow: `<div class="carousel-next faded">${kinsta.chevronRight}</div>`,
      prevArrow: `<div class="carousel-prev faded">${kinsta.chevronLeft}</div>`,
    });


    // Clicking anywhere on the plan should focus it in the slider
    $(document).on('click', '.carousel-item', function(){
      var planbox = $(this)
      $('.price-carousel').slick('slickGoTo', planbox.index());
      history.pushState(null, null, '#' + planbox.attr('id'));
      // If a plan has already been selected change the table column highlight
      if( $('.plan-col.selected').length < 2 ) {
        setPlanColBg(planbox.attr('id'))
      }

    })

    // Manage arrow states and active class on carousel change
    $('.price-carousel').on('beforeChange', function(event, slick, currentSlide, nextSlide){
      if( nextSlide < 2 ) {
        $('.price-carousel').find('.carousel-prev').addClass('faded')
      }
      if( nextSlide >= ( $('.price-carousel').find('.carousel-item').length - 2 ) ) {
        $('.price-carousel').find('.carousel-next').addClass('faded')
      }
      $('.carousel-item').find('.plan-box').removeClass('plan-box--active')
    });

    // Manage arrow states and active class on carousel change
    $('.price-carousel').on('afterChange', function(event, slick, currentSlide){
      if( currentSlide >= 2 ) {
        $('.price-carousel').find('.carousel-prev').removeClass('faded')
      }
      if( currentSlide < ( $('.price-carousel').find('.carousel-item').length - 2 ) ) {
        $('.price-carousel').find('.carousel-next').removeClass('faded')
      }
      $('.carousel-item:eq(' + currentSlide + ')').find('.plan-box').addClass('plan-box--active')
    });



  })

})( jQuery );
