(function($) {

$(document).on('change', 'input[name="account-type"]', function() {
  if($(this).val() === 'individual') {
    $('#company-details').fadeOut();
  } else {
    $('#company-details').show();
  }
})

$(document).on('click', '#toggleIntervalLink', function() {
  newInterval = toggleIntervalClass();
  $(this).text($(this).attr('data-' + newInterval + '-text'));
  if(newInterval === 'year' ) {
    $('#yearlyPromoText').fadeOut();
  } else {
    $('#yearlyPromoText').fadeIn();
  }
  jQuery('.price-display').hide();
  jQuery('.price-per-' + newInterval).show();
  jQuery('#interval-switcher').attr('data-interval', jQuery(this).val());


  history.pushState(null, null, jQuery(this).attr('data-url-' + newInterval) );


  return false;
})

name = '';

cardDetailValidationsOptions =  {
    rules: {
      cardHolderName: {
        required: true,
      },
    },
    highlight: function(element, errorClass, validClass) {
      jQuery(element).addClass(errorClass).removeClass(validClass);
      jQuery(element).parent().addClass('state-error');
    },
    unhighlight: function(element, errorClass, validClass) {
      jQuery(element).removeClass(errorClass).addClass(validClass);
      jQuery(element).parent().removeClass('state-error');
    }
  }

jQuery( "#create-account" ).attr('novalidate', 'novalidate');


// Create a Stripe client
var stripe = Stripe('pk_live_r16EiSaRITiPDMKQjLeoOviT');

// Create an instance of Elements
var elements = stripe.elements();

// Custom styling can be passed to options when creating an Element.
// (Note that this demo uses a wider set of styles than the guide below.)
var style = {
base: {
  color: '#32325d',
  lineHeight: '24px',
  fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
  fontSmoothing: 'antialiased',
  fontSize: '16px',
  '::placeholder': {
    color: '#aab7c4'
  }
},
invalid: {
  color: '#fa755a',
  iconColor: '#fa755a'
}
};

// Create an instance of the card Element
var card = elements.create('card', {style: style});

jQuery(document).on('ready', function() {

  // Add an instance of the card Element into the `card-element` <div>
  card.mount('#card-element');


  // Handle real-time validation errors from the card Element.
  card.addEventListener('change', function(event) {
    var displayError = document.getElementById('card-errors');
    if (event.error) {
      displayError.textContent = event.error.message;
    } else {
      displayError.textContent = '';
    }
  });

  if( sessionStorage.getItem('mykinstaToken') ) {
    company = JSON.parse(sessionStorage.getItem('company'))
    switchToPaymentForm();
    jQuery('select[name="country"]').val(company.country)
    jQuery('input[name="state"]').val(company.state)
    jQuery('input[name="city"]').val(company.city)
    jQuery('input[name="zip"]').val(company.zip)
    jQuery('input[name="address"]').val(company.street)
    jQuery('input[name="billingName"]').val(company.billingName)
    jQuery('input[name="vat"]').val(company.euVatID)
  }

  jQuery( "#create-account" ).validate({
    rules: {
      firstName: 'required',
      lastName: 'required',
      email: {
        required: true,
        email: true,
        freeEmail: true,
      },
      password: {
        required: true,
        minlength: 6,
        passwordFormat: true
      },
      passwordRepeat: {
        equalTo: "#password"
      }
    },
    highlight: function(element, errorClass, validClass) {
      jQuery(element).addClass(errorClass).removeClass(validClass);
      jQuery(element).parent().addClass('state-error');
    },
    unhighlight: function(element, errorClass, validClass) {
      jQuery(element).removeClass(errorClass).addClass(validClass);
      jQuery(element).parent().removeClass('state-error');
    }
  });




  jQuery( "#billing-details" ).validate({
    rules: {
      country: {
        required: true,
      },
      vat: {
        vatFormat: function() {
        return $('input[name="account-type"]:checked').val() === 'company'
      },
        checkVies: function() {
        return $('input[name="account-type"]:checked').val() === 'company'
      },
      },
      state: 'required',
      city: 'required',
      zip: 'required',
      address: 'required',
      billingName: {
        required: function( element ) {
          return $('input[name="account-type"]:checked').val() === 'company'
        }
      }
    },
    highlight: function(element, errorClass, validClass) {
      jQuery(element).addClass(errorClass).removeClass(validClass);
      jQuery(element).parent().addClass('state-error');
    },
    unhighlight: function(element, errorClass, validClass) {
      jQuery(element).removeClass(errorClass).addClass(validClass);
      jQuery(element).parent().removeClass('state-error');
    }
  });


  jQuery( "#card-details" ).validate(cardDetailValidationsOptions);



})

function switchToPaymentForm() {
  jQuery('#firstNameDisplay').html(sessionStorage.getItem('firstName'));


  var container = jQuery('#container-box');
  var width = container.width();
  container.height(container.height());
  jQuery('#step-1').fadeOut( function() {
    goToSection( null, '', '#container-box');
    jQuery('#step-2').css({
      width: width + 'px',
      position:'absolute',
      display:'block',
      left: '-99999px'
    })
    var newHeight = jQuery('#step-2').height();
    container.animate({
      height: newHeight + 80
    }, {
      speed: 700,
      done: function() {
        jQuery('#step-2').css({
          width: 'auto',
          position:'relative',
          display:'none',
          left: '0px',
        })
        jQuery('#step-2').fadeIn(function() {
          jQuery('#step-1').remove();
          container.css({
            height: 'auto'
          })
        })
      }
    })

  })
}


jQuery(document).on('submit', '#create-account', function() {

  form = jQuery(this)
  form.find('input, textarea').attr('disabled', 'disabled')
  setLoading(jQuery('#create-account').find('button'), 'Creating Account');

  jQuery.ajax({
    url: kinsta.ajaxurl,
    method: "POST",
    dataType: 'json',
    data: {
      action: 'mykinsta_register',
      email: jQuery('input[name="email"]').val(),
      firstName: jQuery('input[name="firstName"]').val(),
      lastName: jQuery('input[name="lastName"]').val(),
      password: jQuery('input[name="password"]').val(),
    },
    success: function(response) {
      tagHotjarRecording('Signup - Step 1');
      submitHotjarFormSuccess();
      sessionStorage.setItem('mykinstaToken', response.token);
      sessionStorage.setItem('firstName', response.firstName );
      sessionStorage.setItem('company', JSON.stringify(response.company) );
      switchToPaymentForm();

      form.find('input, textarea').removeAttr('disabled')
      removeLoading(jQuery('#create-account').find('button'));

    }
  })


  return false;
})


jQuery(document).on('click', '#change-plan', function() {
  if(jQuery(this).hasClass('loading')) {
    return false
  }
})

function setPaymentLoading() {
  jQuery('#billing-details').find('input, textarea').attr('disabled', 'disabled')
  jQuery('#card-details').find('input, textarea').attr('disabled', 'disabled')
  jQuery('#billing-details').addClass('loading')
  jQuery('#card-details').addClass('loading')

  jQuery('#interval-switcher').addClass('opacity--20')
  jQuery('#interval-switcher').find('input').attr('disabled', 'disabled')
  jQuery('#change-plan').addClass('opacity--20 loading')

  setLoading(jQuery('#submit-billing-button'), 'Finalizing');

}

function removePaymentLoading() {
  jQuery('#billing-details').find('input, textarea').removeAttr('disabled')
  jQuery('#card-details').find('input, textarea').removeAttr('disabled')
  jQuery('#billing-details').removeClass('loading')
  jQuery('#card-details').removeClass('loading')
  jQuery('#interval-switcher').removeClass('opacity--20')
  jQuery('#interval-switcher').find('input').removeAttr('disabled')
  jQuery('#change-plan').removeClass('opacity--20 loading')

  removeLoading(jQuery('#submit-billing-button'), 'Finalizing');

}


jQuery(document).on('click', '#submit-billing-button', function() {
  jQuery('#billing-details').submit();
  return false;
})

function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

jQuery(document).on('submit', '#card-details', function() {
  setPaymentLoading();


  var options = {
    name: jQuery('input[name="cardHolderName"]').val(),
  };

  stripe.createToken(card, options).then(function(result) {
    if (result.error) {
      removePaymentLoading();
      var errorElement = document.getElementById('card-errors');
      errorElement.textContent = result.error.message;
    } else {
      if(jQuery( "#card-details" ).valid()) {
        jQuery.ajax({
          url: kinsta.ajaxurl,
          method: "POST",
          dataType: 'json',
          data: {
            mykinstaToken: sessionStorage.getItem('mykinstaToken'),
            action: 'stripe_create_subscription',
            idStripeCustomer: JSON.parse(sessionStorage.getItem('company')).idStripeCustomer,
            cardToken: result.token,
            plan: getUrlParameter('plan')
          },
          success: function(response) {
            hj('tagRecording', ['Signup - Step 2']);
            sessionStorage.clear();

            ga('ecommerce:addTransaction', {
              id: response.idStripeSubscription,
              affiliation: 'My Kinsta',
              revenue: response.amount,
              shipping: '0',
              tax: '0'
            })

            ga('ecommerce:addItem', {
              id: response.idStripeSubscription,
              name: response.nameStripePlan,
              sku: response.idStripePlan,
              category: response.interval,
              price: response.amount,
              quantity: '1'
            })

            ga('ecommerce:send')

            fbq('track', 'Purchase', {value: response.amount, currency: 'USD'})

            window.location.replace(response.redirect)
          }
        })
      }
    }
  });


  return false;
})

jQuery(document).on('submit', '#billing-details', function() {
  var billingName = $('input[name="account-type"]:checked').val() === 'company' ? jQuery('input[name="billingName"]').val() : sessionStorage.getItem('firstName') + "'s Company"
  jQuery.ajax({
    url: kinsta.ajaxurl,
    method: "POST",
    dataType: 'json',
    data: {
      action: 'mykinsta_update_company',
      mykinstaToken: sessionStorage.getItem('mykinstaToken'),
      idCompany: JSON.parse(sessionStorage.getItem('company')).id,
      country: jQuery('select[name="country"]').val(),
      state: jQuery('input[name="state"]').val(),
      city: jQuery('input[name="city"]').val(),
      zip: jQuery('input[name="zip"]').val(),
      address: jQuery('input[name="address"]').val(),
      billingName: billingName,
      vat: jQuery('input[name="vat"]').val(),
    },
    success: function(response) {
      submitHotjarFormSuccess();
      sessionStorage.setItem('company', JSON.stringify(response.company) );
      jQuery('#card-details').submit();
    }
  })

  return false;
})


})( jQuery );
